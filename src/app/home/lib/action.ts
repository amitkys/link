"use server";

import { db } from "@/db/index";

import {
  categoryTable,
  linkTable,
  linksTagsTable,
  platformTable,
  tagTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import {
  ActionResponse,
  CreateLinkInput,
  CreateLinkSchema,
  CreatePlatformInput,
  CreatePlatformSchema,
  LinkItem,
  Platform,
} from "../types";

export async function createPlatform(
  rawInput: CreatePlatformInput
): Promise<ActionResponse<Platform>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "User not authenticated" };
    }

    const userId = session.user.id;

    const parsed = CreatePlatformSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        message: firstIssue ? firstIssue.message : "Invalid parent folder payload",
      };
    }

    const { name, icon } = parsed.data;

    const [newPlatform] = await db
      .insert(platformTable)
      .values({
        userId,
        name,
        icon: icon || null,
      })
      .returning();

    return {
      success: true,
      message: "Parent folder created successfully",
      data: newPlatform,
    };
  } catch (error: unknown) {
    console.log("🚀 ~ createPlatform ~ error:", error);
    const dbErr = error as { code?: string; message?: string };
    if (dbErr?.code === "23505" || dbErr?.message?.includes("unique")) {
      return {
        success: false,
        message: "A parent folder with this name already exists",
      };
    }
    return { success: false, message: "Failed to create parent folder" };
  }
}

export async function getGlobalPlatform() {
  try {
    // get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const platforms = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.userId, userId));

    return {
      success: true,
      message: "Platforms fetched successfully",
      data: platforms,
    };
  } catch (error) {
    console.log("🚀 ~ getGlobalPlatform ~ error:", error);
    return { success: false, message: "Failed to fetch platforms" };
  }
}

/**
 * Fetches top-level categories (parentId IS NULL) for a given platform,
 * scoped to the authenticated user.
 */
export async function getCategoriesForPlatform(platformId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const categories = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.userId, userId),
          eq(categoryTable.platformId, platformId),
          isNull(categoryTable.parentId)
        )
      );

    return {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  } catch (error) {
    console.log("🚀 ~ getCategoriesForPlatform ~ error:", error);
    return { success: false, message: "Failed to fetch categories" };
  }
}

/**
 * Fetches direct child categories of a given parent category,
 * scoped to the authenticated user.
 */
export async function getSubcategories(categoryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const subcategories = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.userId, userId),
          eq(categoryTable.parentId, categoryId)
        )
      );

    return {
      success: true,
      message: "Subcategories fetched successfully",
      data: subcategories,
    };
  } catch (error) {
    console.log("🚀 ~ getSubcategories ~ error:", error);
    return { success: false, message: "Failed to fetch subcategories" };
  }
}

export interface CreateFolderParams {
  name: string;
  platformId?: string | null;
  parentId?: string | null;
}

/**
 * Creates a new folder (category or subcategory) scoped to the authenticated user.
 */
export async function createFolder({
  name,
  platformId,
  parentId,
}: CreateFolderParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, message: "Folder name cannot be empty" };
    }
    if (trimmedName.length > 50) {
      return {
        success: false,
        message: "Folder name must be 50 characters or less",
      };
    }

    let finalPlatformId = platformId || null;

    // If creating under a parent category, verify parent exists and belongs to user
    if (parentId) {
      const parent = await db
        .select()
        .from(categoryTable)
        .where(
          and(
            eq(categoryTable.id, parentId),
            eq(categoryTable.userId, userId)
          )
        )
        .limit(1);

      if (!parent || parent.length === 0) {
        return { success: false, message: "Parent folder not found" };
      }

      // Inherit platformId from parent if not explicitly provided
      if (!finalPlatformId && parent[0].platformId) {
        finalPlatformId = parent[0].platformId;
      }
    } else if (platformId) {
      // Top-level folder under a platform: verify platform exists and belongs to user
      const platform = await db
        .select()
        .from(platformTable)
        .where(
          and(
            eq(platformTable.id, platformId),
            eq(platformTable.userId, userId)
          )
        )
        .limit(1);

      if (!platform || platform.length === 0) {
        return { success: false, message: "Platform not found" };
      }
    } else {
      return {
        success: false,
        message: "Target platform or parent folder is required",
      };
    }

    // Insert new category row
    const [newFolder] = await db
      .insert(categoryTable)
      .values({
        userId,
        name: trimmedName,
        parentId: parentId || null,
        platformId: finalPlatformId,
      })
      .returning();

    return {
      success: true,
      message: "Folder created successfully",
      data: newFolder,
    };
  } catch (error: unknown) {
    console.log("🚀 ~ createFolder ~ error:", error);
    const dbErr = error as { code?: string; message?: string };
    if (dbErr?.code === "23505" || dbErr?.message?.includes("unique")) {
      return {
        success: false,
        message: "A folder with this name already exists here",
      };
    }
    return { success: false, message: "Failed to create folder" };
  }
}

/**
 * Saves a new link, optionally assigning tags and associating it with a platform/category.
 */
export async function createLink(
  rawInput: CreateLinkInput
): Promise<ActionResponse<LinkItem>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "User not authenticated" };
    }

    const userId = session.user.id;

    // Runtime validate untrusted payload using Zod
    const parsed = CreateLinkSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        message: firstIssue ? firstIssue.message : "Invalid link payload",
      };
    }

    const {
      url,
      title,
      description,
      thumbnail,
      platformId,
      categoryId,
      isFavorite,
      tags,
    } = parsed.data;

    // Verify platform ownership
    const platform = await db
      .select()
      .from(platformTable)
      .where(
        and(eq(platformTable.id, platformId), eq(platformTable.userId, userId))
      )
      .limit(1);

    if (!platform || platform.length === 0) {
      return { success: false, message: "Platform not found or access denied" };
    }

    // Verify category ownership if categoryId is provided
    if (categoryId) {
      const category = await db
        .select()
        .from(categoryTable)
        .where(
          and(
            eq(categoryTable.id, categoryId),
            eq(categoryTable.userId, userId)
          )
        )
        .limit(1);

      if (!category || category.length === 0) {
        return { success: false, message: "Folder not found or access denied" };
      }
    }

    // Execute insert in a database transaction
    const newLink = await db.transaction(async (tx) => {
      const [insertedLink] = await tx
        .insert(linkTable)
        .values({
          userId,
          url,
          title: title || null,
          description: description || null,
          thumbnail: thumbnail || null,
          platformId,
          categoryId: categoryId || null,
          isFavorite: isFavorite ?? false,
        })
        .returning();

      const tagNames: string[] = [];

      if (tags && tags.length > 0) {
        for (const rawTag of tags) {
          const cleanTag = rawTag.trim().toLowerCase();
          if (!cleanTag) continue;

          const [tagRecord] = await tx
            .insert(tagTable)
            .values({ userId, name: cleanTag })
            .onConflictDoUpdate({
              target: [tagTable.userId, tagTable.name],
              set: { name: cleanTag },
            })
            .returning();

          if (tagRecord) {
            await tx
              .insert(linksTagsTable)
              .values({
                linkId: insertedLink.id,
                tagId: tagRecord.id,
              })
              .onConflictDoNothing();
            tagNames.push(cleanTag);
          }
        }
      }

      return {
        ...insertedLink,
        tags: tagNames,
      };
    });

    return {
      success: true,
      message: "Link saved successfully",
      data: newLink,
    };
  } catch (error: unknown) {
    console.log("🚀 ~ createLink ~ error:", error);
    const dbErr = error as { code?: string; message?: string };
    if (dbErr?.code === "23505" || dbErr?.message?.includes("unique")) {
      return {
        success: false,
        message: "You have already saved this link URL",
      };
    }
    return { success: false, message: "Failed to save link" };
  }
}

/**
 * Fetches saved links for a platform or category.
 */
export async function getLinksForContext(params: {
  platformId?: string | null;
  categoryId?: string | null;
}): Promise<ActionResponse<LinkItem[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "User not authenticated" };
    }

    const userId = session.user.id;

    if (params.categoryId) {
      const links = await db
        .select()
        .from(linkTable)
        .where(
          and(
            eq(linkTable.userId, userId),
            eq(linkTable.categoryId, params.categoryId)
          )
        );

      return {
        success: true,
        message: "Links fetched successfully",
        data: links,
      };
    }

    if (params.platformId) {
      const links = await db
        .select()
        .from(linkTable)
        .where(
          and(
            eq(linkTable.userId, userId),
            eq(linkTable.platformId, params.platformId),
            isNull(linkTable.categoryId)
          )
        );

      return {
        success: true,
        message: "Links fetched successfully",
        data: links,
      };
    }

    return { success: true, message: "No context specified", data: [] };
  } catch (error: unknown) {
    console.log("🚀 ~ getLinksForContext ~ error:", error);
    return { success: false, message: "Failed to fetch links" };
  }
}

export async function getPlatform() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "User not authenticated" };

    const userId = session.user.id;

    const platform = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.userId, userId));

    return { success: true, message: "Platform fetched successfully", data: platform };
  } catch (error) {
    console.log("🚀 ~ getPlatform ~ error:", error);
    return { success: false, message: "Failed to fetch platform" };
  }
}