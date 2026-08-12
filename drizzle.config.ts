import 'dotenv/config';
import dns from 'node:dns';
import { defineConfig } from 'drizzle-kit';

// Force Node.js DNS resolution to prefer IPv4 over IPv6.
// Prevents ETIMEDOUT / ENETUNREACH connection failures to Neon DB on networks where IPv6 routes are unreachable.
dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

