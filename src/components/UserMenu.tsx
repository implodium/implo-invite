import { authClient } from "../utils/auth_client"

export function UserMenu(props: { username: string }) {
	async function logout() {
		await authClient.signOut()
	}

	return (
		<div>
			<h1>{props.username}</h1>
			<button onclick={() => logout()}>Log out</button>
		</div >
	)
}

