import { Client, GatewayIntentBits } from "discord.js";
import enquirer from "enquirer";
import { promptCredentials } from "./util";

const { prompt } = enquirer;

async function main() {
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });
	const token = await promptToken();
	const { username, password } = await promptCredentials()

	client.once("ready", async () => {
		console.log("Ready!");
		const guilds = await client.guilds.fetch();
		console.log(guilds.map(guild => guild.name));

		if (guilds.size === 0) {
			console.error("No guilds found. Bot must be part of at least one guild")
			client.destroy()
			process.exit(1)
		}

		const guild = await promptGuild(guilds.map(guild => guild.name))
	});

	client.login(token)
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

async function promptGuild(guilds: string[]) {
	const { guild } = await prompt<{ guild: string }>({
		type: "select",
		name: "guild",
		message: "Select a guild: ",
		choices: guilds.map(guild => ({ name: guild, message: guild }))
	});

	return guild;
}

async function promptChannel(channels: string[]) {
	const { channel } = await prompt<{ channel: string }>({
		type: "select",
		name: "channel",
		message: "Select a channel: ",
		choices: channels.map(channel => ({ name: channel, message: channel }))
	});

	return channel;
}

main().catch(console.error);
