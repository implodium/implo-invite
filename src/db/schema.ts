import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Event = sqliteTable("Event", {
	id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
	date: text(), // should be iso 8601 date
	extra: text({ mode: "json" }) // contains extra information that is required for the event
})

