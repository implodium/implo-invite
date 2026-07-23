import { z } from "astro/zod"


export const EnvsSchema = z.object({
	BETTER_AUTH_SECRET: z.string(),
	DB_FILE_NAME: z.string(),
	BETTER_AUTH_URL: z.string(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
})

let runtimeConfig: z.infer<typeof EnvsSchema> | undefined = undefined

export function getRuntimeEnvs() {
	if (runtimeConfig) {
		return runtimeConfig
	}

	console.info(`Loading environmental variables with profile: ${import.meta.env.DEV ? 'development' : 'production'}`)
	const envs = import.meta.env.DEV
		? {
			BETTER_AUTH_SECRET: import.meta.env['BETTER_AUTH_SECRET'],
			DB_FILE_NAME: import.meta.env['DB_FILE_NAME'],
			BETTER_AUTH_URL: import.meta.env['BETTER_AUTH_URL'],
			DISCORD_CLIENT_ID: import.meta.env['DISCORD_CLIENT_ID'],
			DISCORD_CLIENT_SECRET: import.meta.env['DISCORD_CLIENT_SECRET'],
		} : {
			BETTER_AUTH_SECRET: process.env['BETTER_AUTH_SECRET'],
			DB_FILE_NAME: process.env['DB_FILE_NAME'],
			BETTER_AUTH_URL: process.env['BETTER_AUTH_URL'],
			DISCORD_CLIENT_ID: process.env['DISCORD_CLIENT_ID'],
			DISCORD_CLIENT_SECRET: process.env['DISCORD_CLIENT_SECRET'],
		}

	console.log(envs)

	const parsedEnvs = EnvsSchema.safeParse(envs)

	if (!parsedEnvs.success) {
		throw new Error(`Please define the required environment variables: ${JSON.stringify(parsedEnvs.error.issues)}`)
	}

	runtimeConfig = parsedEnvs.data
	return parsedEnvs.data
}
