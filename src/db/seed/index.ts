import { db } from "@/db/index";
import {
  categoryTable,
  linkTable,
  linksTagsTable,
  platformTable,
  tagTable,
  user,
} from "@/db/schema";
import { generateUniqueId } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

const PLATFORM_SEED_DATA = [
  {
    name: "GitHub",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    categories: [
      { name: "Repositories", subcategories: ["React Projects", "Next.js Apps", "AI Tools"] },
      { name: "Starred Repos", subcategories: ["Utilities", "UI Libraries"] },
    ],
  },
  {
    name: "YouTube",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    categories: [
      { name: "Tutorials", subcategories: ["Full Courses", "Quick Tips"] },
      { name: "Podcasts & Tech Talks", subcategories: ["System Design", "Career"] },
    ],
  },
  {
    name: "X (Twitter)",
    icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    categories: [
      { name: "Tech Threads", subcategories: ["Frontend Tips", "AI Updates"] },
      { name: "Bookmarks", subcategories: ["Design Threads"] },
    ],
  },
  {
    name: "Instagram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    categories: [
      { name: "Inspiration", subcategories: ["UI Shots", "Typography"] },
      { name: "Reels & Demos", subcategories: ["Design Tips"] },
    ],
  },
  {
    name: "Dribbble",
    icon: "https://cdn.worldvectorlogo.com/logos/dribbble-icon-1.svg",
    categories: [
      { name: "UI Components", subcategories: ["Dashboards", "Mobile Apps"] },
      { name: "Branding", subcategories: ["Logos", "Color Palettes"] },
    ],
  },
  {
    name: "Medium & Dev.to",
    icon: "https://cdn.worldvectorlogo.com/logos/medium-1.svg",
    categories: [
      { name: "Articles", subcategories: ["TypeScript Guides", "Performance"] },
    ],
  },
];

const TAG_SEED_NAMES = [
  "react",
  "nextjs",
  "typescript",
  "tailwind",
  "design",
  "ai",
  "drizzle",
  "frontend",
  "backend",
  "architecture",
  "inspiration",
  "tutorial",
];

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Ensure at least one user exists
  let users = await db.select().from(user);

  if (users.length === 0) {
    console.log("👤 Creating seed user...");
    const [newUser] = await db
      .insert(user)
      .values({
        id: generateUniqueId("usr"),
        name: "Demo User",
        email: "demo@example.com",
        emailVerified: true,
        image: faker.image.avatar(),
      })
      .returning();
    users = [newUser];
  }

  const targetUser = users[0];
  console.log(`👤 Seeding data for user: ${targetUser.name} (${targetUser.id})`);

  // 2. Seed Tags
  console.log("🏷️  Seeding tags...");
  const seededTagsMap = new Map<string, string>(); // tag name -> tag id

  for (const tagName of TAG_SEED_NAMES) {
    const existing = await db
      .select()
      .from(tagTable)
      .where(eq(tagTable.name, tagName))
      .limit(1);

    if (existing.length > 0) {
      seededTagsMap.set(tagName, existing[0].id);
    } else {
      const [insertedTag] = await db
        .insert(tagTable)
        .values({
          id: generateUniqueId("tag"),
          userId: targetUser.id,
          name: tagName,
        })
        .returning();
      seededTagsMap.set(tagName, insertedTag.id);
    }
  }

  const tagIdsList = Array.from(seededTagsMap.values());

  // 3. Seed Platforms, Categories, and Links
  for (const platformInfo of PLATFORM_SEED_DATA) {
    console.log(`📦 Seeding platform: ${platformInfo.name}...`);

    // Check if platform exists
    let platformId: string;
    const existingPlatform = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.name, platformInfo.name))
      .limit(1);

    if (existingPlatform.length > 0) {
      platformId = existingPlatform[0].id;
    } else {
      const [insertedPlatform] = await db
        .insert(platformTable)
        .values({
          id: generateUniqueId("plt"),
          userId: targetUser.id,
          name: platformInfo.name,
          icon: platformInfo.icon,
        })
        .returning();
      platformId = insertedPlatform.id;
    }

    // Seed Categories for Platform
    for (const catInfo of platformInfo.categories) {
      let categoryId: string;
      const existingCat = await db
        .select()
        .from(categoryTable)
        .where(eq(categoryTable.name, catInfo.name))
        .limit(1);

      if (existingCat.length > 0) {
        categoryId = existingCat[0].id;
      } else {
        const [insertedCat] = await db
          .insert(categoryTable)
          .values({
            id: generateUniqueId("ctg"),
            userId: targetUser.id,
            name: catInfo.name,
            platformId: platformId,
          })
          .returning();
        categoryId = insertedCat.id;
      }

      // Seed Subcategories under Category
      for (const subName of catInfo.subcategories) {
        let subId: string;
        const existingSub = await db
          .select()
          .from(categoryTable)
          .where(eq(categoryTable.name, subName))
          .limit(1);

        if (existingSub.length > 0) {
          subId = existingSub[0].id;
        } else {
          const [insertedSub] = await db
            .insert(categoryTable)
            .values({
              id: generateUniqueId("ctg"),
              userId: targetUser.id,
              name: subName,
              parentId: categoryId,
              platformId: platformId,
            })
            .returning();
          subId = insertedSub.id;
        }

        // Seed 2-4 links per subcategory
        const linkCount = faker.number.int({ min: 2, max: 4 });
        for (let i = 0; i < linkCount; i++) {
          const linkUrl = faker.internet.url();

          // Avoid duplicate link URLs for user
          const existingLink = await db
            .select()
            .from(linkTable)
            .where(eq(linkTable.url, linkUrl))
            .limit(1);

          if (existingLink.length > 0) continue;

          const [insertedLink] = await db
            .insert(linkTable)
            .values({
              id: generateUniqueId("lnk"),
              userId: targetUser.id,
              url: linkUrl,
              title: `${faker.company.catchPhrase()} - ${subName}`,
              description: faker.lorem.sentences({ min: 1, max: 2 }),
              thumbnail: faker.image.url(),
              platformId: platformId,
              categoryId: subId,
              isFavorite: faker.datatype.boolean({ probability: 0.3 }),
              visitedTimes: faker.number.int({ min: 0, max: 50 }),
              lastVisitedAt: faker.date.recent({ days: 30 }),
            })
            .returning();

          // Attach 1-3 random tags to each link
          const randomTags = faker.helpers.arrayElements(
            tagIdsList,
            faker.number.int({ min: 1, max: 3 })
          );

          for (const tagId of randomTags) {
            await db
              .insert(linksTagsTable)
              .values({
                linkId: insertedLink.id,
                tagId: tagId,
              })
              .onConflictDoNothing();
          }
        }
      }
    }
  }

  console.log("✅ Database seeding completed successfully!");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  });