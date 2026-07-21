import { defineAction, ActionError } from "astro:actions"
import { eq } from "drizzle-orm"
import { VoteConfig } from "../config/vote"
import { db } from "../db/database"
import { checkAuthFor, auth } from "../utils/auth"
import { z } from "astro/zod"
import { handleCheckResult } from "./util"
import { Event } from "../db/schema"

type ImploParty2026EventExtra = {
	votes?: {
		[discordUserId: string]: string[]
	}
}

export const voting2026 = {
	submitVote: defineAction({
		input: z.object({
			restaurants: z.array(z.string()),
			eventId: z.string()
		}),
		handler: async ({ restaurants, eventId }, context) => {
			const checkResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(checkResult)

			if (restaurants.length > VoteConfig.maximumVoteCount && restaurants.length < VoteConfig.minimumVoteCount) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "You need to vote exactly 5 restaurants"
				})
			}

			const session = await auth.api.getSession({
				headers: context.request.headers,
			})

			try {
				await db.transaction(async (tx) => {
					const event = await tx.select().from(Event).where(eq(Event.id, eventId)).limit(1).get()

					if (!event) {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "Event not found"
						})
					}


					const exteDetails: ImploParty2026EventExtra = event.extra as ImploParty2026EventExtra
					if (!exteDetails.votes) {
						exteDetails.votes = {}
					}

					exteDetails.votes[session?.user.id ?? 'unknown'] = restaurants

					await tx.update(Event).set({ extra: exteDetails }).where(eq(Event.id, event.id))
				})

			} catch (err) {
				console.error(err)
				throw err
			}

		},
	}),
	getVote: defineAction({
		input: z.object({
			eventId: z.string()
		}),
		handler: async ({ eventId }, context) => {
			const checkResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(checkResult)

			const session = await auth.api.getSession({
				headers: context.request.headers,
			})

			if (!session) {
				throw new ActionError({
					code: "UNAUTHORIZED",
					message: "Not authenticated"
				})
			}
			const event = await db.select().from(Event).where(eq(Event.id, eventId)).limit(1).get()

			if (!event) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Event not found"
				})
			}

			const exteDetails: ImploParty2026EventExtra = event.extra as ImploParty2026EventExtra
			if (!exteDetails.votes) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "No votes found"
				})
			}

			if (exteDetails.votes[session.user.id] === undefined) {
				throw new ActionError({
					code: "NOT_FOUND",
					message: "There was no vote submitted yet"
				})
			}

			return exteDetails.votes[session.user.id]
		}
	}),


}
