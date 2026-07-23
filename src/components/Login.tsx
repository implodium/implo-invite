import { onMount } from "solid-js"
import { authClient } from "../utils/auth_client"

export function Login() {

	onMount(() => {
		loginViaDiscord()
	})

	async function loginViaDiscord() {
		const urlParams = new URLSearchParams(window.location.search)
		const redirectUrl = urlParams.get('redirect')

		await authClient.signIn.social({
			callbackURL: redirectUrl ?? "/party/2026/registration",
			provider: "discord",
		})
	}

	return (
		<></>
	)
}
