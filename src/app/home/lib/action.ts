"use server";

import { db } from "@/db/index";
import { categoryTable, platformTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";

export async function getGlobalPlatform() {

  try {
  // get user session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) return {success: false, message: "User not authenticated"};

  const userId = session.user.id

  const platforms = await db.select().from(platformTable).where(eq(platformTable.userId, userId));

  return {success: true, message: "Platforms fetched successfully", data: platforms}
  } catch (error) {
    console.log("🚀 ~ getGlobalPlatform ~ error:",error);
    return {success: false, message: "Failed to fetch platforms"}
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