import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";
import { handleCheckResult } from "./util";
import { auth, checkAuthFor } from "../utils/auth";
import { db } from "../db/database";
import { and, eq } from "drizzle-orm";
import { Participant, Event } from "../db/schema";
import { EventExtraSchema, ParticipantExtraSchema, PersonFlagsSchema } from "../utils/party/2026/type";

function isDistinctByKey<T>(arr: T[], key: keyof T): boolean {
  const values = arr.map((obj) => obj[key]);
  return new Set(values).size === arr.length;
}

function checkLockedOptionsForPerson(
	options: z.infer<typeof PersonFlagsSchema>,
	current: z.infer<typeof PersonFlagsSchema> | undefined,
	locks: Extract<z.infer<typeof EventExtraSchema>['locks']['registration'], { flags: {} }>['flags']
) {
	if (current === undefined) {
		if (options.shopping && locks.shopping) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Shopping is locked"
			})
		}

		if (options.lunch && locks.lunch) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Lunch is locked"
			})
		}

		if (options.dinner && locks.dinner) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Dinner is locked"
			})
		}

		if (options.overnight && locks.overnight) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Overnight is locked"
			})
		}
	} else {
		if (locks.shopping && options.shopping !== current.shopping) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Shopping is locked"
			})
		}

		if (locks.lunch && options.lunch !== current.lunch) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Lunch is locked"
			})
		}

		if (locks.dinner && options.dinner !== current.dinner) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Dinner is locked"
			})
		}

		if (locks.overnight && options.overnight !== current.overnight) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Overnight is locked"
			})
		}
	}
}

function checkLockedOptions(
	options: z.infer<typeof ParticipantExtraSchema>,
	current: z.infer<typeof ParticipantExtraSchema> | undefined,
	locks: Extract<z.infer<typeof EventExtraSchema>['locks']['registration'], { flags: {} }>['flags']
) {
	checkLockedOptionsForPerson(options, current, locks)

	if (current && options.otherPeople.length < current?.otherPeople.length) {
		throw new ActionError({
			code: "BAD_REQUEST",
			message: "You cannot remove people anymore"
		})
	}

	for (const person of options.otherPeople) {
		const currentPerson = current?.otherPeople.find(p => p.name === person.name)
		checkLockedOptionsForPerson(person, currentPerson, locks)
	}
}

export const registration = {
	registerOrUpdate: defineAction({
		input: z.object({
			eventId: z.string().describe("The event id of the event to register for"),
			registrationOptions: ParticipantExtraSchema
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

				const eventExtra = EventExtraSchema.safeParse(event.extra)

				if (!eventExtra.success) {
					throw new ActionError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to parse event extra"
					})
				}

				if (typeof eventExtra.data.locks.registration === 'boolean' && eventExtra.data.locks.registration) {
					throw new ActionError({
						code: "BAD_REQUEST",
						message: "Registration is locked"
					})
				}

				const participant = await tx.select().from(Participant).where(and(eq(Participant.user, session.user.id), eq(Participant.event, eventId))).limit(1).get()

				if (participant) {
					const participantExtra = ParticipantExtraSchema.safeParse(participant.extra)

					if (!participantExtra.success) {
						throw new ActionError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to parse participant"
						})
					}

					if (eventExtra.data.locks.registration) {
						checkLockedOptions(registrationOptions, participantExtra.data, eventExtra.data.locks.registration.flags)
					}

					if (!isDistinctByKey(registrationOptions.otherPeople, 'name')) {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "You cannot add a Person with the same name twice. Try ot add the person with ther last name"
						})
					}

					const result = await tx.update(Participant).set({ extra: registrationOptions }).where(eq(Participant.id, participant.id))

					if (result.rowsAffected !== 1) {
						throw new ActionError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to update participant"
						})
					}
				} else {
					if (eventExtra.data.locks.registration) {
						checkLockedOptions(registrationOptions, undefined, eventExtra.data.locks.registration.flags)
					}

					if (!isDistinctByKey(registrationOptions.otherPeople, 'name')) {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "You cannot add a Person with the same name twice. Try ot add the person with ther last name"
						})
					}

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


					const parsedExtras = ParticipantExtraSchema.safeParse(participant.extra)
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
