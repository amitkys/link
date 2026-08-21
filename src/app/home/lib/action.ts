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
import { processIconInput } from "@/app/home/lib/icon-utils";
import { and, eq, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Non-blocking background flush for platform visits stored in Redis.
 */
async function flushPendingPlatformVisits(userId: string) {
  const redisKey = `user:${userId}:pending_platform_visits`;
  const pendingVisits = await redis.hgetall<Record<string, number>>(redisKey);
  if (!pendingVisits || Object.keys(pendingVisits).length === 0) return;

  const entries = Object.entries(pendingVisits).filter(([, count]) => Number(count) > 0);
  if (entries.length === 0) return;

  await Promise.all(
    entries.map(([platformId, count]) =>
      db
        .update(platformTable)
        .set({
          visitedTimes: sql`${platformTable.visitedTimes} + ${Number(count) || 0}`,
          lastVisitedAt: new Date(),
        })
        .where(
          and(
            eq(platformTable.id, platformId),
            eq(platformTable.userId, userId)
          )
        )
    )
  );
  await redis.del(redisKey);
}

/**
 * Non-blocking background flush for category visits stored in Redis.
 */
async function flushPendingCategoryVisits(userId: string) {
  const redisKey = `user:${userId}:pending_category_visits`;
  const pendingVisits = await redis.hgetall<Record<string, number>>(redisKey);
  if (!pendingVisits || Object.keys(pendingVisits).length === 0) return;

  const entries = Object.entries(pendingVisits).filter(([, count]) => Number(count) > 0);
  if (entries.length === 0) return;

  await Promise.all(
    entries.map(([categoryId, count]) =>
      db
        .update(categoryTable)
        .set({
          visitedTimes: sql`${categoryTable.visitedTimes} + ${Number(count) || 0}`,
          lastVisitedAt: new Date(),
        })
        .where(
          and(
            eq(categoryTable.id, categoryId),
            eq(categoryTable.userId, userId)
          )
        )
    )
  );
  await redis.del(redisKey);
}

/**
 * Fetches platforms for authenticated user.
 * Non-blocking Redis visit sync runs in background.
 */
export async function getPlatformAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    // Trigger non-blocking Redis sync in background
    flushPendingPlatformVisits(userId).catch((err) =>
      console.error("flushPendingPlatformVisits error", err)
    );

    // Query platforms immediately from PostgreSQL
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
 * Fetches ALL categories AND ALL links for a given platform in one single fast parallel query.
 */
export async function getPlatformDataAction(platformId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    flushPendingCategoryVisits(userId).catch((err) =>
      console.error("flushPendingCategoryVisits error", err)
    );

    const [categories, links] = await Promise.all([
      db
        .select()
        .from(categoryTable)
        .where(
          and(
            eq(categoryTable.userId, userId),
            eq(categoryTable.platformId, platformId)
          )
        ),
      db
        .select()
        .from(linkTable)
        .where(
          and(
            eq(linkTable.userId, userId),
            eq(linkTable.platformId, platformId)
          )
        ),
    ]);

    return { success: true, data: { categories, links } };
  } catch (error) {
    console.error("getPlatformDataAction error", error);
    return { success: false, message: "Failed to fetch platform data" };
  }
}

/**
 * Fetches ALL categories for a given platform in one single fast query.
 */
export async function getAllCategoriesAction(platformId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    flushPendingCategoryVisits(userId).catch((err) =>
      console.error("flushPendingCategoryVisits error", err)
    );

    const categories = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.userId, userId),
          eq(categoryTable.platformId, platformId)
        )
      );

    return { success: true, data: categories };
  } catch (error) {
    console.error("getAllCategoriesAction error", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}

/**
 * Fetches categories for a platform level, scoped to the authenticated user.
 */
export async function getCategoriesAction(platformId: string, parentId?: string | null) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    flushPendingCategoryVisits(userId).catch((err) =>
      console.error("flushPendingCategoryVisits error", err)
    );

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

/**
 * Creates a new platform/hub for the authenticated user.
 */
export async function createPlatformAction(input: {
  name: string;
  icon?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const cleanName = input.name.trim();

    if (!cleanName) {
      return { success: false, message: "Platform name is required" };
    }

    const [platform] = await db
      .insert(platformTable)
      .values({
        userId,
        name: cleanName,
        icon: processIconInput(input.icon),
      })
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("createPlatformAction error", error);
    return { success: false, message: "Failed to create platform" };
  }
}

/**
 * Creates a new directory or subdirectory under a platform for the authenticated user.
 */
export async function createCategoryAction(input: {
  name: string;
  platformId: string;
  parentId?: string | null;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const cleanName = input.name.trim();

    if (!cleanName) {
      return { success: false, message: "Category name is required" };
    }

    if (!input.platformId) {
      return { success: false, message: "Platform ID is required" };
    }

    const [category] = await db
      .insert(categoryTable)
      .values({
        userId,
        name: cleanName,
        platformId: input.platformId,
        parentId: input.parentId || null,
      })
      .returning();

    return { success: true, data: category };
  } catch (error) {
    console.error("createCategoryAction error", error);
    return { success: false, message: "Failed to create category" };
  }
}

/**
 * Creates a new saved link under a platform (and optional category) for the authenticated user.
 */
export async function createLinkAction(input: {
  platformId: string;
  categoryId?: string | null;
  url: string;
  title?: string;
  description?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const cleanUrl = input.url.trim();

    if (!cleanUrl) {
      return { success: false, message: "URL is required" };
    }

    if (!input.platformId) {
      return { success: false, message: "Platform ID is required" };
    }

    const [newLink] = await db
      .insert(linkTable)
      .values({
        userId,
        platformId: input.platformId,
        categoryId: input.categoryId || null,
        url: cleanUrl,
        title: input.title?.trim() || null,
        description: input.description?.trim() || null,
      })
      .returning();

    return { success: true, data: newLink };
  } catch (error) {
    console.error("createLinkAction error", error);
    return { success: false, message: "Failed to create link" };
  }
}

/**
 * Updates an existing platform/hub for the authenticated user.
 */
export async function updatePlatformAction(
  id: string,
  input: { name?: string; icon?: string | null }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.name !== undefined) {
      const cleanName = input.name.trim();
      if (!cleanName) return { success: false, message: "Platform name cannot be empty" };
      updateData.name = cleanName;
    }
    if (input.icon !== undefined) {
      updateData.icon = processIconInput(input.icon);
    }

    const [updatedPlatform] = await db
      .update(platformTable)
      .set(updateData)
      .where(and(eq(platformTable.id, id), eq(platformTable.userId, userId)))
      .returning();

    if (!updatedPlatform) {
      return { success: false, message: "Platform not found" };
    }

    return { success: true, data: updatedPlatform };
  } catch (error) {
    console.error("updatePlatformAction error", error);
    return { success: false, message: "Failed to update platform" };
  }
}

/**
 * Deletes a platform/hub for the authenticated user.
 */
export async function deletePlatformAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const [deletedPlatform] = await db
      .delete(platformTable)
      .where(and(eq(platformTable.id, id), eq(platformTable.userId, userId)))
      .returning();

    if (!deletedPlatform) {
      return { success: false, message: "Platform not found" };
    }

    return { success: true, data: deletedPlatform };
  } catch (error) {
    console.error("deletePlatformAction error", error);
    return { success: false, message: "Failed to delete platform" };
  }
}

/**
 * Updates an existing directory or subdirectory for the authenticated user.
 */
export async function updateCategoryAction(
  id: string,
  input: { name?: string }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const cleanName = input.name?.trim();

    if (!cleanName) {
      return { success: false, message: "Category name cannot be empty" };
    }

    const [updatedCategory] = await db
      .update(categoryTable)
      .set({ name: cleanName, updatedAt: new Date() })
      .where(and(eq(categoryTable.id, id), eq(categoryTable.userId, userId)))
      .returning();

    if (!updatedCategory) {
      return { success: false, message: "Category not found" };
    }

    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("updateCategoryAction error", error);
    return { success: false, message: "Failed to update category" };
  }
}

/**
 * Deletes a directory or subdirectory for the authenticated user.
 */
export async function deleteCategoryAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const [deletedCategory] = await db
      .delete(categoryTable)
      .where(and(eq(categoryTable.id, id), eq(categoryTable.userId, userId)))
      .returning();

    if (!deletedCategory) {
      return { success: false, message: "Category not found" };
    }

    return { success: true, data: deletedCategory };
  } catch (error) {
    console.error("deleteCategoryAction error", error);
    return { success: false, message: "Failed to delete category" };
  }
}

/**
 * Updates an existing saved link for the authenticated user.
 */
export async function updateLinkAction(
  id: string,
  input: { url?: string; title?: string | null; description?: string | null }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.url !== undefined) {
      const cleanUrl = input.url.trim();
      if (!cleanUrl) return { success: false, message: "URL cannot be empty" };
      updateData.url = cleanUrl;
    }
    if (input.title !== undefined) {
      updateData.title = input.title?.trim() || null;
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    const [updatedLink] = await db
      .update(linkTable)
      .set(updateData)
      .where(and(eq(linkTable.id, id), eq(linkTable.userId, userId)))
      .returning();

    if (!updatedLink) {
      return { success: false, message: "Link not found" };
    }

    return { success: true, data: updatedLink };
  } catch (error) {
    console.error("updateLinkAction error", error);
    return { success: false, message: "Failed to update link" };
  }
}

/**
 * Deletes a saved link for the authenticated user.
 */
export async function deleteLinkAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const [deletedLink] = await db
      .delete(linkTable)
      .where(and(eq(linkTable.id, id), eq(linkTable.userId, userId)))
      .returning();

    if (!deletedLink) {
      return { success: false, message: "Link not found" };
    }

    return { success: true, data: deletedLink };
  } catch (error) {
    console.error("deleteLinkAction error", error);
    return { success: false, message: "Failed to delete link" };
  }
}