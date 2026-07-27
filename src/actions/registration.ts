import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { handleCheckResult } from "./util";
import { auth, checkAuthFor } from "../utils/auth";
import { db } from "../db/database";
import { and, eq } from "drizzle-orm";
import { Participant, Event } from "../db/schema";
import { RegistrationOptionsSchema } from "../utils/shared_types";

export const registration = {
	registerOrUpdate: defineAction({
		input: z.object({
			eventId: z.string().describe("The event id of the event to register for"),
			registrationOptions: RegistrationOptionsSchema
		}),
		handler: async ({ eventId, registrationOptions }, context) => {
			const ckeckResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(ckeckResult)

			const session = await auth.api.getSession({
				headers: context.request.headers,
			})

			await db.transaction(async (tx) => {
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

				const participant = await tx.select().from(Participant).where(and(eq(Participant.user, session.user.id), eq(Participant.event, eventId))).limit(1).get()

				if (participant) {
					const result = await tx.update(Participant).set({ extra: registrationOptions }).where(eq(Participant.id, participant.id))

					if (result.rowsAffected !== 1) {
						throw new ActionError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to update participant"
						})
					}
				} else {
					const result = await tx.insert(Participant).values({
						user: session.user.id,
						event: eventId,
						extra: registrationOptions
					})

					if (result.rowsAffected !== 1) {
						throw new ActionError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to insert participant"
						})
					}
				}
			})
		},
	}),
	getRegistraiton: defineAction({
		input: z.object({
			eventId: z.string()
				.describe("The event id of the event to register for")
		}),
		handler: async ({ eventId }, context) => {
			const checkResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(checkResult)


			try {
				const parsedExtras = await db.transaction(async (tx) => {
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

					const participant = await tx.select().from(Participant).where(and(eq(Participant.user, session.user.id), eq(Participant.event, eventId))).limit(1).get()


					if (!participant) {
						throw new ActionError({
							code: "NOT_FOUND",
							message: "Participant not found"
						})
					}


					const parsedExtras = RegistrationOptionsSchema.safeParse(participant.extra)
					if (!parsedExtras.success) {
						throw new ActionError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to parse participant"
						})
					}
					return parsedExtras.data
				})

				return parsedExtras
			} catch (e) {
				throw e
			}
		}
	})
}
