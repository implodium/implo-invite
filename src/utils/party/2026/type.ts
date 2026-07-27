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
