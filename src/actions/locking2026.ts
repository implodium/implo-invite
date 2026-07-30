import { z } from "astro/zod";
import { EventExtraLocksSchema, EventExtraSchema } from "../utils/party/2026/type";
import { ActionError, defineAction } from "astro:actions";
import { handleCheckResult } from "./util";
import { auth, checkAuthFor, isAdmin } from "../utils/auth";
import { db } from "../db/database";
import { Event } from "../db/schema";
import { eq } from "drizzle-orm";

export const locking2026 = {
	setLocks: defineAction({
		input: z.object({
			locks: EventExtraLocksSchema,
			eventId: z.string()
		}),
		handler: async ({ locks, eventId }, context) => {
			const checkResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(checkResult)

			const session = await auth.api.getSession({
				headers: context.request.headers,
			})

			if (!isAdmin(session)) {
				throw new ActionError({
					code: "UNAUTHORIZED",
					message: "Not authenticated"
				})
			}

			await db.transaction(async (tx) => {
				const event = await tx.select().from(Event).where(eq(Event.id, eventId)).limit(1).get()

				if (!event) {
					throw new ActionError({
						code: "BAD_REQUEST",
						message: "Event not found"
					})
				}

				const existingExtra = EventExtraSchema.safeParse(event.extra)

				if (!existingExtra.success) {
					throw new ActionError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to parse event extra"
					})
				}

				const result = await tx.update(Event).set({ extra: { ...existingExtra.data, locks } }).where(eq(Event.id, eventId))

				if (result.rowsAffected !== 1) {
					throw new ActionError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to update event"
					})
				}
			})

			return true
		}
	}),

	getLocks: defineAction({
		input: z.object({
			eventId: z.string()
		}),
		handler: async ({ eventId }, context) => {
			const checkResult = await checkAuthFor(context.request.headers, eventId)
			handleCheckResult(checkResult)

			const event = await db.select().from(Event).where(eq(Event.id, eventId)).limit(1).get()

			if (!event) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Event not found"
				})
			}

			const existingExtra = EventExtraSchema.safeParse(event.extra)

			if (!existingExtra.success) {
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to parse event extra"
				})
			}

			return existingExtra.data.locks
		}
	})

}
