import { drizzle } from "drizzle-orm/libsql";
import { getRuntimeEnvs } from "../utils/environemnt";

const envs = getRuntimeEnvs()
const db = drizzle(envs.DB_FILE_NAME)

export {
	db,
}
