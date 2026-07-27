import { Client, GatewayIntentBits, OAuth2Guild, Role } from "discord.js";
import { Event, Invitation } from "../db/schema.ts";
import { eq, type InferSelectModel } from "drizzle-orm";
import enquirer from 'enquirer';
import 'dotenv/config';
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(process.env.DB_FILE_NAME!)

const { prompt } = enquirer;

type Invitation = {
	username: string;
	event: string;
	user: string;
}

async function main() {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
		],
	});

	const token = await promptToken();

	// Load events from the database
	const eventList = await db.select().from(Event);

	client.once("ready", async () => {
		const guilds = await client.guilds.fetch();

		if (guilds.size === 0) {
			console.error("No guilds found. Bot must be part of at least one guild");
			client.destroy();
			process.exit(1);
		}

		const guildArray = Array.from(guilds.values());
		const guildId = await promptGuild(guildArray);
		const guild = guilds.get(guildId);

		const fullGuild = await guild?.fetch();
		const members = await fullGuild?.members.fetch();
		const roles = await fullGuild?.roles.fetch();

		const roleId = await promptRole(Array.from(roles?.values() ?? []));

		const roleMembers = members?.filter(
			(member) => member.roles.cache.has(roleId) && !member.user.bot
		);

		if (!roleMembers) {
			console.error("No members found with that role");
			client.destroy();
			process.exit(1);
		}

		const eventId = await promptEvent(eventList);

		const invitations: Invitation[] = roleMembers.map((member) => ({
			event: eventId,
			user: `${member.user.id}`,
			username: member.user.username
		}));

		console.info("Members to invite:");
		console.info(
			roleMembers.map((member) => `* ${member.user.username}`).join("\n")
		);

		const confirm = await prompt<{ confirm: boolean }>({
			type: "confirm",
			name: "confirm",
			message: "Are you sure you want to invite these members to the server?",
		});

		if (!confirm.confirm) {
			console.error("Aborting");
			client.destroy();
			process.exit(1);
		}

		const duplicates: Invitation[] = [];
		const added: Invitation[] = [];

		for (const invitation of invitations) {
			try {
				// Check whether an invitation already exists
				const existing = await db
					.select()
					.from(Invitation)
					.where(
						eq(
							Invitation.user,
							invitation.user
						)
					)
					.limit(1);

				if (existing.length > 0) {
					duplicates.push(invitation);
					continue;
				}

				await db.insert(Invitation).values(invitation);

				added.push(invitation);
			} catch (err) {
				console.error(
					`Failed to insert ${invitation.user}`,
					err
				);
			}
		}

		console.warn("Duplicate invitations:");
		duplicates.forEach((i) =>
			console.warn(`* ${i.username}`)
		);

		console.info("Added invitations:");
		added.forEach((i) =>
			console.info(`* ${i.username}`)
		);

		client.destroy();
		process.exit(0);
	});

	await client.login(token);
}

async function promptEvent(events: InferSelectModel<typeof Event>[]) {
	const { eventId } = await prompt<{ eventId: string }>({
		type: "select",
		name: "eventId",
		message: "Select an event:",
		choices: events.map((event) => ({
			name: event.id,
			message: event.name
		})),
	});

	return eventId;
}

async function promptToken() {
	if (process.env.DISCORD_TOKEN) {
		return process.env.DISCORD_TOKEN;
	}

	const { token } = await prompt<{ token: string }>({
		type: "input",
		name: "token",
		message: "Token:",
	});

	return token;
}

async function promptGuild(guilds: OAuth2Guild[]) {
	const { guildId } = await prompt<{ guildId: string }>({
		type: "select",
		name: "guildId",
		message: "Select a guild:",
		choices: guilds.map((guild) => ({
			name: guild.id,
			message: guild.name,
		})),
	});

	return guildId;
}

async function promptRole(roles: Role[]) {
	const { roleId } = await prompt<{ roleId: string }>({
		type: "select",
		name: "roleId",
		message: "Select a role:",
		choices: roles.map((role) => ({
			name: role.id,
			message: role.name,
		})),
	});

	return roleId;
}

main().catch(console.error);
