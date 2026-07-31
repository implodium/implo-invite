import { eq } from "drizzle-orm"
import { db } from "../../../db/database"
import { Event } from "../../../db/schema"
import { EventExtraSchema } from "./type"
import { VoteConfig } from "../../../config/vote"
import { user } from "../../../db/auth-schema"

export type PointEntry = {
	user: string,
	points: number
}

export async function getUserById(userId: string) {
	const usr = await db.select().from(user).where(eq(user.id, userId)).get();
	return usr;
}

export async function getEntriesPerRestaurant() {
	const event = await db.select().from(Event).where(eq(Event.id, 'ImploParty2026')).get()
	const exteDetails = EventExtraSchema.safeParse(event?.extra).data

	const userIdToName = new Map(await Promise.all(
		Object.keys(exteDetails?.votes ?? {})
			.map(async (id): Promise<[string, string | undefined]> => [id, (await getUserById(id))?.name])
	))

	return Object.entries(exteDetails?.votes ?? {})
		.reduce((acc, [user, ranking]) => {
			ranking.forEach((restaurant, index) => {
				const currentEntries = acc.get(restaurant) ?? []
				const userPoints = (VoteConfig.maximumVoteCount) - index
				const userName = userIdToName.get(user)
				currentEntries.push({ user: userName ?? user, points: userPoints })
				acc.set(restaurant, currentEntries)
			})

			return acc;
		}, new Map<string, PointEntry[]>())
}
