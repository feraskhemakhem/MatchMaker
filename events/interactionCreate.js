// module for interaction event of client
// this function gets called when interacting with user, which should be with every command (slash commands)

const { reply } = require('../helper_functions/event_helper.js');

module.exports = {
        // update for v14: no longer need to use API to run slash commands
	name: 'interactionCreate',
        ws: true,
	async execute(interaction, client) {
                
                /************************************ check interaction requirements ************************************/
                if (!interaction.isChatInputCommand()) return; // if not a slash command message, ignore it
                if (!interaction.isRepliable()) return; // if cannot reply, then don't even try!
                if (interaction.member.user.bot) return; // if message comes from bot, ignore it

                const commandName = interaction.commandName.toLowerCase();
                if (!client.commands.has(commandName)) return; // iif not a registered command in "commands", skip

                const command = client.commands.get(commandName);
                if (!command.public && interaction.member.id !== client.my_maker.id) return; // if not public and I (owner) don't ask for it, ignore

                // print interaction information
                console.log(`interaction: ${interaction}`);
                console.log(`\n\n`);

                // get cooldowns to get ensure this command is not on cooldown
                const { cooldowns, default_cooldown } = client;

                /************************************ check cooldown ************************************/
                // https://discordjs.guide/command-handling/#dynamically-executing-commands

                // if admin command and you aren't an admin, get out of here!
                if (command.admin && !interaction.memberPermissions.has('ADMINISTRATOR')) return;

                // she's a beaut: https://discordjs.guide/command-handling/adding-features.html#expected-command-usage
                // if incorrectly formatted, send strongly worded message
                if (command.args && command.args !== args.length) {
                        let reply = `Error: incorrect number of arguments provided`;

                        if (command.usage) {
                                reply += `\nPlease follow the format: ${client.prefix}${command.name} ${command.usage}`;
                        }
                        return (client, interaction, reply);
                }

                // check for appropriate cooldowns
                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                const cooldownAmount = (command.cooldown || default_cooldown) * 1000; // to milliseconds

                // value of each command cooldown is cooldowns > command > user > timestamp
                // if timestamps exist, check it
                if (timestamps.has(interaction.member.id)) {
                        const expirationTime = timestamps.get(interaction.member.id) + cooldownAmount;

                        // if the cooldown is still going, tell them to waits
                        if (now < expirationTime) {
                                const timeLeft = (expirationTime - now) / 1000;
                                return reply(client, interaction, `please do not spam me; I'm a busy woman. The cooldown for the ${command.name} is ${cooldownAmount / 1000} seconds.`);
                        }
                }

                // update the timestamps collection for author to be new time
                timestamps.set(interaction.member.id, now);
                setTimeout(() => timestamps.delete(interaction.member.id), cooldownAmount);

                /************************************ finally, run the command ************************************/

                try {
                        command.execute(interaction, client); // run command
                } catch (error) { // if there's an error, print it as well as a message in the chat
                        console.error(error);
                        reply(client, interaction, 'there was an error trying to execute this command :/');
                }

	},
}