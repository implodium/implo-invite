import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/database";
import * as schema from "../db/auth-schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "sqlite", schema: schema }),
	socialProviders: {
		discord: {
			enabled: true,
			clientId: import.meta.env.DISCORD_CLIENT_ID,
			clientSecret: import.meta.env.DISCORD_CLIENT_SECRET,
		}
	},
	emailAndPassword: {
		enabled: true
	}
})
