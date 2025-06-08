import { readdir } from 'fs/promises'

const main = async () => {
	await generateTypes('.', 'src/util/party-types')
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
