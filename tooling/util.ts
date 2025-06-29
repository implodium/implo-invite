import enquirer from 'enquirer'

const { prompt } = enquirer

export const promptCredentials = async (): Promise<{ username: string, password: string }> => {
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
