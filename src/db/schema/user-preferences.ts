import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userPreferencesTable = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  viewMode: text("view_mode").default("grid").notNull(),
  sortBy: text("sort_by").default("newest").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});
