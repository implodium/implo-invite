import { createSignal } from "solid-js"
import { authClient } from "../utils/auth_client"

export function Login() {
	const [password, setPassword] = createSignal("")
	const [email, setEmail] = createSignal("")
	const [name, setName] = createSignal("")

	function login(email: string, password: string) {
	}

	async function signup(email: string, password: string, name: string) {
		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name
		})

		console.log(data?.user.name)
		console.log(error)
	}

	return (
		<div>
			<h1>Login</h1>
			<input type="text" placeholder="Email" value={email()} onInput={(e) => setEmail(e.target.value)} />
			<input type="password" placeholder="Password" value={password()} onInput={(e) => setPassword(e.target.value)} />
			<input type="text" placeholder="Name" value={name()} onInput={(e) => setName(e.target.value)} />
			<button onClick={() => login(email(), password())}>Login</button>
			<button onClick={() => signup(email(), password(), name())}>Sign Up</button>
		</div>
	)
}
