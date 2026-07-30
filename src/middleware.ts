import { auth, checkAuthFor, isAdmin } from "./utils/auth";
import { defineMiddleware } from "astro:middleware";
import { getRuntimeEnvs } from "./utils/environemnt";

export const onRequest = defineMiddleware(async (context, next) => {
	const session = await auth.api
		.getSession({
			headers: context.request.headers,
		})

	const inLogin = context.url.pathname === "/login" || context.url.pathname.startsWith("/api/auth")

	if (context.url.pathname === '/403') {
		return next()
	}

	if (context.url.pathname === '/version') {
		return next()
	}


	if (inLogin) {
		return next()
	}

	if (!session) {
		return context.redirect(`/login?redirect=${context.url.pathname}`);
	}

	if (context.url.pathname.startsWith("/party/2026")) {
		const checkResult = await checkAuthFor(context.request.headers, 'ImploParty2026')

		if (checkResult !== 'ok') {
			return context.redirect("/403");
		}

		if (context.url.pathname === '/party/2026/admin' && !isAdmin(session)) {
			return context.redirect("/403");
		}

		if (context.url.pathname === '/party/2026/') {
			return context.redirect("/party/2026/registration");
		}


		context.locals.user = session.user;
		context.locals.session = session.session;
		return next();
	}


	context.locals.user = session.user;
	context.locals.session = session.session;
	return next();
});
