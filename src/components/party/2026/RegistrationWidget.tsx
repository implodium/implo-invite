import { Button } from "./Button";

export function Registration() {
	return <>
		<Button fullWidth command="show-modal" commandfor="registration-modal">Register</Button>

		<dialog id="registration-modal" class="window">
		</dialog>

	</>
}
