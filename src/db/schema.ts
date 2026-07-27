import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Event = sqliteTable("Event", {
	// In most cases this should be created manually and should be a shorthand for the event (e.g. Implo Party 2026 => ImploParty2026)
	id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text().notNull().unique(),
	date: text(), // should be iso 8601 date
	extra: text({ mode: "json" }) // contains extra information that is required for the event
})

export const Invitation = sqliteTable("Invitation", {
	user: text().primaryKey().$defaultFn(() => crypto.randomUUID()),

	// This is just for debugging and is not required for the invitation system to work
	username: text(),

	event: text().references(() => Event.id)
})

export const Participant = sqliteTable("Participant", {
	id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
	user: text(),
	event: text().references(() => Event.id),
	extra: text({ mode: "json" })
})



