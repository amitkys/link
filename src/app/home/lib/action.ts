"use server";

import { db } from "@/db/index";
import {
  categoryTable,
  linkTable,
  platformTable,
  userPreferencesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { and, eq, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Fetches platforms for authenticated user.
 * Implements Option A1 Lazy Sync: Flushes pending Redis visit counts to Postgres before querying.
 */
export async function getPlatformAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const redisKey = `user:${userId}:pending_platform_visits`;

    // 1. Lazy Sync from Redis to DB
    try {
      const pendingVisits = await redis.hgetall<Record<string, number>>(redisKey);
      if (pendingVisits && Object.keys(pendingVisits).length > 0) {
        for (const [platformId, count] of Object.entries(pendingVisits)) {
          const incrementBy = Number(count) || 0;
          if (incrementBy > 0) {
            await db
              .update(platformTable)
              .set({
                visitedTimes: sql`${platformTable.visitedTimes} + ${incrementBy}`,
                lastVisitedAt: new Date(),
              })
              .where(
                and(
                  eq(platformTable.id, platformId),
                  eq(platformTable.userId, userId)
                )
              );
          }
        }
        await redis.del(redisKey);
      }
    } catch (redisError) {
      console.error("getPlatformAction Redis sync error", redisError);
    }

    // 2. Query platforms from PostgreSQL
    const platforms = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.userId, userId));

    return { success: true, data: platforms };
  } catch (error) {
    console.error("getPlatformAction error", error);
    return { success: false, message: "Failed to fetch platforms" };
  }
}

/**
 * Records a platform visit by atomically incrementing visit counter in Redis Hash.
 */
export async function recordPlatformVisitAction(platformId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const redisKey = `user:${userId}:pending_platform_visits`;

    await redis.hincrby(redisKey, platformId, 1);

    return { success: true, data: null };
  } catch (error) {
    console.error("recordPlatformVisitAction error", error);
    return { success: false, message: "Failed to record platform visit" };
  }
}

export async function recordCategoryVisitAction(categoryId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const redisKey = `user:${userId}:pending_category_visits`;

    await redis.hincrby(redisKey, categoryId, 1);

    return { success: true, data: null };
  } catch (error) {
    console.error("recordCategoryVisitAction error", error);
    return { success: false, message: "Failed to record category visit" };
  }
}

/**
 * Fetches categories for a platform, scoped to the authenticated user.
 * If parentId is provided, fetches subcategories of that parent.
 * If parentId is null/undefined, fetches top-level categories (parentId IS NULL).
 * Implements Option A1 Lazy Sync for category visit counts.
 */
export async function getCategoriesAction(platformId: string, parentId?: string | null) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const redisKey = `user:${userId}:pending_category_visits`;

    // 1. Lazy Sync from Redis to DB
    try {
      const pendingVisits = await redis.hgetall<Record<string, number>>(redisKey);
      if (pendingVisits && Object.keys(pendingVisits).length > 0) {
        for (const [categoryId, count] of Object.entries(pendingVisits)) {
          const incrementBy = Number(count) || 0;
          if (incrementBy > 0) {
            await db
              .update(categoryTable)
              .set({
                visitedTimes: sql`${categoryTable.visitedTimes} + ${incrementBy}`,
                lastVisitedAt: new Date(),
              })
              .where(
                and(
                  eq(categoryTable.id, categoryId),
                  eq(categoryTable.userId, userId)
                )
              );
          }
        }
        await redis.del(redisKey);
      }
    } catch (redisError) {
      console.error("getCategoriesAction Redis sync error", redisError);
    }

    const conditions = [
      eq(categoryTable.userId, userId),
      eq(categoryTable.platformId, platformId),
    ];

    if (parentId) {
      conditions.push(eq(categoryTable.parentId, parentId));
    } else {
      conditions.push(isNull(categoryTable.parentId));
    }

    const categories = await db
      .select()
      .from(categoryTable)
      .where(and(...conditions));

    return { success: true, data: categories };
  } catch (error) {
    console.error("getCategoriesAction error", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}

/**
 * Fetches links for a given context (platform root or category), scoped to user.
 */
export async function getLinksAction(params: {
  platformId: string;
  categoryId?: string | null;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const conditions = [
      eq(linkTable.userId, userId),
      eq(linkTable.platformId, params.platformId),
    ];

    if (params.categoryId) {
      conditions.push(eq(linkTable.categoryId, params.categoryId));
    } else {
      conditions.push(isNull(linkTable.categoryId));
    }

    const links = await db
      .select()
      .from(linkTable)
      .where(and(...conditions));

    return { success: true, data: links };
  } catch (error) {
    console.error("getLinksAction error", error);
    return { success: false, message: "Failed to fetch links" };
  }
}

/**
 * Fetches saved user preferences from DB.
 */
export async function getUserPreferencesAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const preferences = await db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, userId))
      .limit(1);

    if (preferences.length === 0) {
      return { success: true, data: null };
    }

    return { success: true, data: preferences[0] };
  } catch (error) {
    console.error("getUserPreferencesAction error", error);
    return { success: false, message: "Failed to fetch user preferences" };
  }
}

/**
 * Upserts user preferences in DB for cross-device persistence.
 */
export async function updateUserPreferencesAction(input: {
  viewMode?: "grid" | "list" | "compact";
  sortBy?: "newest" | "oldest" | "most-visited" | "name";
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const [updatedPref] = await db
      .insert(userPreferencesTable)
      .values({
        userId,
        viewMode: input.viewMode ?? "grid",
        sortBy: input.sortBy ?? "newest",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferencesTable.userId,
        set: {
          ...(input.viewMode ? { viewMode: input.viewMode } : {}),
          ...(input.sortBy ? { sortBy: input.sortBy } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return { success: true, data: updatedPref };
  } catch (error) {
    console.error("updateUserPreferencesAction error", error);
    return { success: false, message: "Failed to update user preferences" };
  }
}