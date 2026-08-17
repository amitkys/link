import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import * as schema from "@/db/schema/index";
import { magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey"
import { sendMagicLinkEmail } from "./send-magic-link";

const getRpID = () => {
  const url = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `http://${url}`);
    return parsed.hostname;
  } catch {
    return undefined;
  }
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    passkey({
      rpID: getRpID(),
      rpName: "link",
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url });
      }
    }),
  ],

  trustedOrigins: [
    "https://link.id0.uk",
    "https://www.link.id0.uk",
    "http://link.id0.uk",
    "http://www.link.id0.uk",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      : []),
  ],
});
export type Auth = typeof auth;