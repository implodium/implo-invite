import { auth, checkAuthFor } from "./utils/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	console.log(context.url.pathname)
	const isAuthed = await auth.api
		.getSession({
			headers: context.request.headers,
		})

	const inLogin = context.url.pathname === "/login" || context.url.pathname.startsWith("/api/auth")

	if (context.url.pathname === '/403') {
		return next()
	}

	if (inLogin) {
		return next()
	}

	if (!isAuthed) {
		return context.redirect(`/login?redirect=${context.url.pathname}`);
	}

	if (context.url.pathname.startsWith("/party/2026")) {
		const checkResult = await checkAuthFor(context.request.headers, 'ImploParty2026')

		if (checkResult !== 'ok') {
			return context.redirect("/403");
		}

		if (context.url.pathname === '/party/2026/') {
			return context.redirect("/party/2026/registration");
		}


		context.locals.user = isAuthed.user;
		context.locals.session = isAuthed.session;
		return next();
	}


	context.locals.user = isAuthed.user;
	context.locals.session = isAuthed.session;
	return next();
});
