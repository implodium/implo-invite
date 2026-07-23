import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/database";
import * as schema from "../db/auth-schema";
import { Invitation } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { getRuntimeEnvs } from "./environemnt";

const env = getRuntimeEnvs()

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "sqlite", schema: schema }),
	socialProviders: {
		discord: {
			enabled: true,
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}
	}
})

export async function checkAuthFor(headers: Request['headers'], eventId: string): Promise<'ok' | 'NotDiscordAccount' | 'Unauthenticated' | 'EventNotFound' | 'NoInvitationFound'> {
	const session = await auth.api.getSession({
		headers: headers,
	})

	if (!session) {
		return 'Unauthenticated'
	}

	const accounts = await auth.api.listUserAccounts({
		headers: headers,
	})
	const discordAccount = accounts.find(a => a.providerId === 'discord')

	if (!discordAccount) {
		return 'NotDiscordAccount'
	}

	const invitation = await db.select().from(Invitation).where(and(eq(Invitation.event, eventId), eq(Invitation.user, discordAccount?.accountId))).get()

	if (!invitation) {
		return 'NoInvitationFound'
	}

	return 'ok'
}
