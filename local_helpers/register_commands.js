// this file will register all the commands in a give guild (not a guild)

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const dotenv = require('dotenv');	// for supporting a .env with secrets
const fs = require('node:fs');
dotenv.config({ path: '../.env'}); // https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs


const commands = [];
const working_functions = ['v', 'help', 'reroll', 'match'];

// Place your client id here
const clientId = '721167637006123088';

// read all commands into slash command builder
for (const file of working_functions) {
	const command = require(`../commands/${file}.js`);
	commands.push(new SlashCommandBuilder().setName(command.name).setDescription(command.description));
}

// map all commands to json format
commands.map(cmd => cmd.toJSON());

// create rest api reference
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// use routes to map each command for specific guild, asynchronously
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
