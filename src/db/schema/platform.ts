import { generateUniqueId } from "@/lib/utils";
import { defineRelationsPart } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ============================================================
// PLATFORMS — user-specific platform list
// (Users add platforms like Instagram, X, YouTube as they need/use them)
// ============================================================
export const platformTable = pgTable(
  "platforms",
  {
    id: text("id").primaryKey().$defaultFn(() => generateUniqueId("plt")),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(), // "Instagram", "X", "YouTube"
    icon: text(), // icon url
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("platforms_user_idx").on(table.userId),
    unique("platforms_user_name_unique").on(table.userId, table.name),
  ]
);

// ============================================================
// CATEGORIES — self-referencing for unlimited subcategory depth
// (Instagram > Entertainment > Memes, etc.)
// ============================================================
export const categoryTable = pgTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(() => generateUniqueId("ctg")),

    // FIX: added back. Without this, categories are global —
    // every user sees and can edit the same category list.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text().notNull(), // entertainment, food, shopping, travel, lifestyle
    parentId: text("parent_id"), // null = top-level category, otherwise points to another category.id (self-reference)

    // FIX: platformId is now OPTIONAL (dropped .notNull()).
    // Reasoning: onDelete "set null" only works if the column is
    // nullable. If a category must always have a platform, the
    // right pairing is notNull() + onDelete: "restrict" instead —
    // but here we're intentionally allowing a category to outlive
    // its platform (e.g. general "Travel" category not tied to
    // any single platform).
    platformId: text("platform_id").references(() => platformTable.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    // ADDED: indexes on FK-like columns you'll filter/join on constantly.
    // Postgres does NOT auto-index foreign keys — only the referenced
    // side (the primary key) is indexed automatically.
    index("categories_user_idx").on(table.userId),
    index("categories_parent_idx").on(table.parentId),
    index("categories_platform_idx").on(table.platformId),

    // ADDED: prevents a user from creating two identically-named
    // categories under the same parent (e.g. two "Entertainment"
    // categories both under Instagram). Different users, or the
    // same name under a different parent, are still allowed.
    unique("categories_user_parent_name_unique").on(
      table.userId,
      table.parentId,
      table.name
    ),
  ]
);

// ============================================================
// LINKS — the saved link itself
// ============================================================
export const linkTable = pgTable(
  "links",
  {
    id: text("id").primaryKey().$defaultFn(() => generateUniqueId("lnk")),

    // FIX: added back for the same reason as categoryTable.userId —
    // without it, links aren't scoped to the person who saved them.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    url: text().notNull(),
    title: text(),
    description: text(),
    thumbnail: text(),

    // kept required — every link should know which platform it came
    // from, and cascade makes sense: if a platform is fully removed
    // from your app, its links go with it.
    platformId: text("platform_id")
      .notNull()
      .references(() => platformTable.id, { onDelete: "cascade" }),

    // FIX (Bug 1): dropped .notNull(). This was the actual crash —
    // notNull() + onDelete:"set null" is a contradiction Postgres
    // cannot satisfy (it tries to null the column, then rejects
    // that same write for violating NOT NULL). Making this optional
    // also matches your real workflow: save a link fast, categorize
    // it later, instead of being forced to pick a category up front.
    categoryId: text("category_id").references(() => categoryTable.id, {
      onDelete: "set null",
    }),

    isFavorite: boolean("is_favorite").default(false).notNull(),
    visitedTimes: integer("visited_times").default(0).notNull(),
    lastVisitedAt: timestamp("last_visited_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("links_user_idx").on(table.userId),
    index("links_platform_idx").on(table.platformId),
    index("links_category_idx").on(table.categoryId),

    // ADDED: stops the same user saving the exact same URL twice —
    // directly solves the "we save link but forget we already saved
    // it" problem you described at the start.
    unique("links_user_url_unique").on(table.userId, table.url),
  ]
);

// ============================================================
// TAGS — cross-cutting labels, independent of category
// ============================================================
export const tagTable = pgTable(
  "tags",
  {
    id: text("id").primaryKey().$defaultFn(() => generateUniqueId("tag")),

    // FIX (design question from before): switched from platformId to
    // userId. Tags like "inspiration" or "read-later" are a personal
    // labeling system that should work across every platform, not be
    // re-created separately per platform. If you specifically wanted
    // platform-scoped tags instead, swap this back — but the unique
    // constraint below would need to be (platformId, name) instead.
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(), // shopping, travel, etc.
  },
  (table) => [
    index("tags_user_idx").on(table.userId),

    // FIX (Bug 3): was a bare global .unique() on name, which meant
    // "shopping" could only ever exist ONCE across the entire table,
    // for any user. Now uniqueness is scoped per-user, so every user
    // can independently have their own "shopping" tag.
    unique("tags_user_name_unique").on(table.userId, table.name),
  ]
);

// ============================================================
// LINKS <-> TAGS — many-to-many join table
// ============================================================
export const linksTagsTable = pgTable(
  "links_tags",
  {
    linkId: text("link_id")
      .notNull()
      .references(() => linkTable.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tagTable.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    // FIX (Bug 2): composite primary key on (linkId, tagId). This is
    // what was missing entirely before — without it, Postgres had no
    // way to reject a duplicate (link, tag) pair, so double-clicking
    // "add tag" in the UI could silently create duplicate rows.
    // A composite PK both prevents duplicates AND is auto-indexed,
    // so no separate index needed here.
    primaryKey({ columns: [table.linkId, table.tagId] }),
  ]
);

// ============================================================
// RELATIONS — for db.query.* with nested with: {}
// ============================================================
export const platformRelations = defineRelationsPart(
  { platformTable, categoryTable, linkTable, tagTable, linksTagsTable },
  (helpers) => ({
    platformTable: {
      links: helpers.many.linkTable({
        from: helpers.platformTable.id,
        to: helpers.linkTable.platformId,
      }),
      categories: helpers.many.categoryTable({
        from: helpers.platformTable.id,
        to: helpers.categoryTable.platformId,
      }),
      // REMOVED: platformTable.tags relation — tagTable no longer
      // has a platformId column (moved to userId, see above).
    },
    categoryTable: {
      platform: helpers.one.platformTable({
        from: helpers.categoryTable.platformId,
        to: helpers.platformTable.id,
      }),
      // self-referencing pair: "parent" (one) and "subcategories"
      // (many) share the same alias so Drizzle knows they describe
      // the two directions of the same relationship.
      parent: helpers.one.categoryTable({
        from: helpers.categoryTable.parentId,
        to: helpers.categoryTable.id,
        alias: "subcategories",
      }),
      subcategories: helpers.many.categoryTable({
        from: helpers.categoryTable.id,
        to: helpers.categoryTable.parentId,
        alias: "subcategories",
      }),
      links: helpers.many.linkTable({
        from: helpers.categoryTable.id,
        to: helpers.linkTable.categoryId,
      }),
    },
    linkTable: {
      platform: helpers.one.platformTable({
        from: helpers.linkTable.platformId,
        to: helpers.platformTable.id,
      }),
      category: helpers.one.categoryTable({
        from: helpers.linkTable.categoryId,
        to: helpers.categoryTable.id,
      }),
      tags: helpers.many.linksTagsTable({
        from: helpers.linkTable.id,
        to: helpers.linksTagsTable.linkId,
      }),
    },
    tagTable: {
      // FIX: was `platform: one(platformTable, ...)` — no longer
      // valid since tagTable dropped platformId in favor of userId.
      links: helpers.many.linksTagsTable({
        from: helpers.tagTable.id,
        to: helpers.linksTagsTable.tagId,
      }),
    },
    linksTagsTable: {
      link: helpers.one.linkTable({
        from: helpers.linksTagsTable.linkId,
        to: helpers.linkTable.id,
      }),
      tag: helpers.one.tagTable({
        from: helpers.linksTagsTable.tagId,
        to: helpers.tagTable.id,
      }),
    },
  })
);