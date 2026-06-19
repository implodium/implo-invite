import { authClient } from "../utils/auth_client"

export function Login() {

	async function loginViaDiscord() {
		await authClient.signIn.social({
			provider: "discord",
		})
	}

	return (
		<div>
			<h1>Login</h1>
			<button onClick={() => loginViaDiscord()}>discord</button>
		</div>
	)
}
