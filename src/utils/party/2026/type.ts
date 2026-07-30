import { z } from "astro/zod";

export const PersonFlagsSchema = z.object({
	dinner: z.boolean(),
	lunch: z.boolean(),
	overnight: z.boolean(),
	shopping: z.boolean()
})

export const PersonExtraSchema = PersonFlagsSchema.extend({
	name: z.string()
})

export const ParticipantExtraSchema = PersonFlagsSchema.extend({
	otherPeople: z.array(PersonExtraSchema)
})

export const EventExtraLocksSchema = z.object({
	voting: z.boolean(),
	registration: z.union([
		z.object({
			flags: PersonFlagsSchema // locks individual flags (e.g. dinner and lunch after the reservations are done)
		}),
		// locks the whole thing when true or locks nothing when false
		z.boolean()
	]),
}).default({
	voting: false,
	registration: false
})

export const EventExtraVotingSchema = z.record(z.string(), z.array(z.string())).default({})

export const EventExtraSchema = z.object({
	votes: EventExtraVotingSchema,
	// Options that are locked. Used in this case to lock some options after the initial registration preiod (after restuarant reservation)
	locks: EventExtraLocksSchema
})

