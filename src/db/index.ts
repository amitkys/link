import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { authRelations, platformRelations } from "@/db/schema/index";


export const db = drizzle(process.env.DATABASE_URL!, {
  relations: { ...authRelations, ...platformRelations },
});


