import { z } from "zod";

/**
 * Generic response type for server actions ensuring strong typing and error handling.
 */
export interface ActionResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Zod runtime validation schema for creating a new saved link.
 */
export const CreateLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Please enter a valid URL (e.g. https://example.com)"),
  title: z
    .string()
    .trim()
    .max(200, "Title must be 200 characters or less")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  thumbnail: z
    .string()
    .trim()
    .url("Thumbnail must be a valid URL")
    .optional()
    .or(z.literal("")),
  platformId: z.string().min(1, "Platform is required"),
  categoryId: z.string().nullable().optional(),
  isFavorite: z.boolean().optional().default(false),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});

export type CreateLinkInput = z.infer<typeof CreateLinkSchema>;

/**
 * Zod runtime validation schema for creating a new platform / parent folder.
 */
export const CreatePlatformSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(50, "Folder name must be 50 characters or less"),
  icon: z
    .string()
    .trim()
    .url("Icon must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CreatePlatformInput = z.infer<typeof CreatePlatformSchema>;

/**
 * Domain interface for a Platform (Parent Folder).
 */
export interface Platform {
  id: string;
  name: string;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Domain interface for a saved Link item.
 */
export interface LinkItem {
  id: string;
  userId: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  platformId: string;
  categoryId: string | null;
  isFavorite: boolean;
  visitedTimes: number;
  lastVisitedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

