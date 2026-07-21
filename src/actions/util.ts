import { ActionError } from "astro:actions"

export function handleCheckResult(checkResult: 'Unauthenticated' | 'NotDiscordAccount' | 'NoInvitationFound' | 'EventNotFound' | 'ok') {
	switch (checkResult) {
		case 'Unauthenticated':
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Not authenticated"
			})
		case 'NotDiscordAccount':
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "This action requires authenticated Discord account"
			})
		case 'NoInvitationFound':
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "No registered invitation found"
			})
		case 'EventNotFound':
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Event not found"
			})
		case 'ok':
			return
	}
}
