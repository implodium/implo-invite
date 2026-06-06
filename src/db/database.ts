import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(import.meta.env.DB_FILE_NAME)

export {
	db,
}
