import { auth } from "./utils/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const isAuthed = await auth.api
		.getSession({
			headers: context.request.headers,
		})

	if (isAuthed) {
		context.locals.user = isAuthed.user;
		context.locals.session = isAuthed.session;
		return next();
	} else {
		context.locals.user = null;
		context.locals.session = null;
		if (context.url.pathname === "/login" || context.url.pathname.startsWith("/api/auth")) {
			return next();
		} else {
			return context.redirect("/login");
		}
	}
});
