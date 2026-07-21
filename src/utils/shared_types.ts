import { z } from "astro/zod";

export const OtherPersonSchmea = z.object({
	name: z.string().describe("The name of the person"),
	shopping: z.boolean().describe("Whether the person wants to also go with shopping for the party"),
	lunch: z.boolean().describe("Whether the person wants to have lunch at the restaurant"),
	dinner: z.boolean().describe("Whether the person wants to have dinner at the restaurant"),
	overnight: z.boolean().describe("Whether the person wants to stay overnight at the party"),
})

export const RegistrationOptionsSchema = z.object({
	shopping: z.boolean().describe("Whether the user wants to also go with shopping for the party"),
	lunch: z.boolean().describe("Whether the user wants to have lunch at the restaurant"),
	dinner: z.boolean().describe("Whether the user wants to have dinner at the restaurant"),
	overnight: z.boolean().describe("Whether the user wants to stay overnight at the party"),
	otherPeople: z.array(OtherPersonSchmea).describe("Plus ones")
})

