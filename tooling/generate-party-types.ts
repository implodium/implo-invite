import { readdir, mkdir, exists } from 'fs/promises'
import PocketBase from 'pocketbase'
import enquirer from 'enquirer'
import { Event } from '../src/util/types'

const { prompt } = enquirer

const main = async () => {
	const { username, password } = await promptCredentials()
	const pb = new PocketBase('http://localhost:8090')

	try {
		await pb.collection('_superusers')
			.authWithPassword(username, password)
	} catch (e) {
		console.error(e)
		return
	}

	const events: Event[] = await pb.collection('events').getFullList()

	if (!(await exists('tmp'))) {
		await mkdir('tmp', {})
	}

	for (const event of events) {
		const { name, information } = event
		const filename = name.replace(/ /g, "_").toLowerCase()
		await Bun.write(`tmp/${filename}.json`, JSON.stringify(information))
	}

	await generateTypes('tmp', 'src/util/event-types/')
}


const promptCredentials = async (): Promise<{ username: string, password: string }> => {
	const credsFile = Bun.file('creds.json')

	if (await credsFile.exists()) {
		const creds = await credsFile.json()
		return creds
	}

	const { username } = await prompt<{ username: string }>({
		type: 'input',
		name: 'username',
		message: 'username: '
	})

	const { password } = await prompt<{ password: string }>({
		type: 'password',
		name: 'password',
		message: 'password: '
	})

	await credsFile.write(JSON.stringify({ username, password }))

	return { username, password }
}



const generateTypes = async (directory: string, out_directory: string) => {
	const promises: ReturnType<typeof Bun.spawn>[] = []

	for (const file of await readdir(directory)) {
		if (!file.endsWith('.json')) {
			continue
		}

		promises.push(Bun.spawn([
			"quicktype",
			`${directory}/${file}`,
			"--out",
			`${out_directory}/${file.replace('.json', '')}.ts`
		]))
	}

	await Promise.all(promises)
}

main().catch(console.error)
