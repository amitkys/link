import 'dotenv/config';
import dns from 'node:dns';
import { drizzle } from 'drizzle-orm/node-postgres';
import { authRelations, platformRelations } from "@/db/schema/index";

// Force Node.js DNS resolution to prefer IPv4 over IPv6.
// Prevents ETIMEDOUT / ENETUNREACH connection failures to Neon DB on networks where IPv6 routes are unreachable.
dns.setDefaultResultOrder('ipv4first');

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: { ...authRelations, ...platformRelations },
});


