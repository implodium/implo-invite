import { Client, GatewayIntentBits, OAuth2Guild, Role } from "discord.js";
import enquirer from "enquirer";
import { Invitation, promptCredentials } from "./util";
import PocketBase from "pocketbase";
import { Event } from "../src/util/types";

const { prompt } = enquirer;

async function main() {
	const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
	const token = await promptToken();
	const { username, password } = await promptCredentials()
	const pb = new PocketBase('http://localhost:8090')
	await pb.collection('_superusers')
		.authWithPassword(username, password)
	const events = await pb.collection<Event>('events').getFullList()

	client.once("ready", async () => {
		const guilds = await client.guilds.fetch();

		if (guilds.size === 0) {
			console.error("No guilds found. Bot must be part of at least one guild")
			client.destroy()
			process.exit(1)
		}


		const guildArray = Array.from(guilds.values());
		const guildId = await promptGuild(guildArray);
		const guild = guilds.get(guildId);
		const fullGuild = await guild?.fetch()
		const members = await fullGuild?.members.fetch();
		const roles = await fullGuild?.roles.fetch()
		const roleId = await promptRole(Array.from(roles?.values() ?? []));
		const roleMembers = members?.filter(member => member.roles.cache.has(roleId) && !member.user.bot);

		if (roleMembers === undefined) {
			console.error("No members found with that role")
			client.destroy()
			process.exit(1)
		}

		const eventId = await promptEvent(events)
		const invitations: Invitation[] = roleMembers?.map(member => ({
			event_id: eventId,
			discord_email_or_username: `${member.user.username}#0`
		}))

		console.info('Members to invite:')
		console.info(roleMembers?.map(member => '* ' + member.user.username).join('\n'))
		const confirm = await prompt<{ confirm: boolean }>({
			type: "confirm",
			name: "confirm",
			message: "Are you sure you want to invite these members to the server?"
		});

		if (!confirm.confirm) {
			console.error("Aborting")
			client.destroy()
			process.exit(1)
		}

		const duplicates: Invitation[] = []
		const added: Invitation[] = []
		for (const invitation of invitations) {
			try {
				added.push(await pb.collection('invites').create(invitation))
			} catch (e) {
				duplicates.push(invitation)
			}
		}

		console.warn('Duplicate invitations:')
		duplicates.forEach(invitation => console.warn(`* ${invitation.discord_email_or_username}`))
		console.info('Added invitations:')
		added.forEach(invitation => console.info(`* ${invitation.discord_email_or_username}`))

		client.destroy()
		process.exit(0)
	});

	client.login(token)
}

async function promptEvent(events: Event[]) {
	const { eventId } = await prompt<{ eventId: string }>({
		type: "select",
		name: "eventId",
		message: "Select an event: ",
		choices: events.map(event => ({ name: event.id, message: event.name, value: event }))
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
		message: "token: "
	});

	return token;
}

async function promptGuild(guilds: OAuth2Guild[]) {
	const { guildId } = await prompt<{ guildId: string }>({
		type: "select",
		name: "guildId",
		message: "Select a guild: ",
		choices: guilds.map(guild => ({ name: guild.id, message: guild.name, value: guild }))
	});

	return guildId;
}

async function promptRole(roles: Role[]) {
	const { roleId } = await prompt<{ roleId: string }>({
		type: "select",
		name: "roleId",
		message: "Select a Role: ",
		choices: roles.map(role => ({ name: role.id, message: role.name }))
	});

	return roleId;
}

main().catch(console.error);
