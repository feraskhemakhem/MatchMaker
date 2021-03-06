// module for message event of client

// temp fields (to server later)
const db_helper = require('../helper_functions/db_helper.js');

module.exports = {
	name: 'message',
	async execute(message, client) {

        const { cooldowns, default_cooldown } = client;
        /************************************ preprocessing of arguments ************************************/
        // based on https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments

        // if command prefix is not found or message comes from bot, ignore it
        if (!message.content.startsWith(client.prefix) || message.author.bot) return;

        // store arguments and the actual command in variables
        const args = message.content.slice(client.prefix.length).trim().split(/ +/); // use regex to split by any # of spaces
        const commandName = args.shift().toLowerCase();


        /************************************ actual commands ************************************/
        // https://discordjs.guide/command-handling/#dynamically-executing-commands
        if (!client.commands.has(commandName)) return;
        const command = client.commands.get(commandName);

        if (!command.public && message.author.id !== client.my_maker.id) return; // if not public and I don't ask for it, ignore

        // if admin command, get out of here!
        if (command.admin && !message.member.hasPermission('ADMINISTRATOR')) return;

        // she's a beaut: https://discordjs.guide/command-handling/adding-features.html#expected-command-usage
        // if incorrectly formatted, send strongly worded message
        if (command.args && command.args !== args.length) {
            let reply = `Error: incorrect number of arguments provided`;

            if (command.usage) {
                reply += `\nPlease follow the format: ${client.prefix}${command.name} ${command.usage}`;
            }
            return message.reply(reply);
        }

        // check for appropriate cooldowns
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || default_cooldown) * 1000; // to milliseconds

        // value of each command cooldown is cooldowns > command > user > timestamp
        // if timestamps exist, check it
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            // if the cooldown is still going, tell them to waits
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please do not spam me; I'm a busy woman. The cooldown for the ${command.name} is ${cooldownAmount / 1000} seconds.`);
            }
        }

        // update the timestamps collection for author to be new time
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        let returned_value;

        try {
            command.execute(message, args); // run command with args and database reference
        } catch (error) { // if there's an error, print it as well as a message in the chat
            console.error(error);
            message.reply('there was an error trying to execute this command :/');
        }
	},
};