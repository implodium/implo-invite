import { readdir, mkdir, exists } from 'fs/promises'
import PocketBase from 'pocketbase'
import { Event } from '../src/util/types'
import { promptCredentials } from './util'

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
