// module for ready event of client


const reply = async (client, interaction, response) => {
        let data = {
                content: response,
        };

        // check for embeds
        if (typeof response === 'object') {
                data = await createAPIMessage(interaction, response);
        }

        //  reply? TODO: since discord.js doesnt natively support it yet, doing it ugly
        client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                        data: data,
                }
        });
};

module.exports = {
        // AYYO DICSORD JS GUIDE KINDA SUS GOTTA USE REST API
        // USE THIS: https://www.youtube.com/watch?v=-YxuSSG_O6g        
	name: 'INTERACTION_CREATE',
        ws: true,
	async execute(interaction, client) {
                const { name, options } = interaction.data;
                const commandName = name.toLowerCase();
                // print the command
                console.log(commandName);
                // reply(client, interaction, 'pog?');
                console.log(`opts are ${JSON.stringify(options[0])}`);

                // process this message
                const args = [];
                if (options) {
                        for (const option of options) {
                                const { value } = option;
                                console.log(`option is ${value}`);
                                args.push(value);
                        }
                }

                reply(client, interaction, 'ok');
                console.log(`interaction: ${JSON.stringify(interaction)}`);

                const { cooldowns, default_cooldown } = client;
                /************************************ preprocessing of arguments ************************************/
                // based on https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments

                // if message comes from bot, ignore it
                if (interaction.member.user.bot) return;

                /************************************ actual commands ************************************/
                // https://discordjs.guide/command-handling/#dynamically-executing-commands
                if (!client.commands.has(commandName)) return;
                const command = client.commands.get(commandName);

                if (!command.public && interaction.member.id !== client.my_maker.id) return; // if not public and I don't ask for it, ignore

                // if admin command, get out of here!
                if (command.admin && !interaction.member.hasPermission('ADMINISTRATOR')) return;

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
                if (timestamps.has(interaction.member.id)) {
                        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                        // if the cooldown is still going, tell them to waits
                        if (now < expirationTime) {
                                const timeLeft = (expirationTime - now) / 1000;
                                return reply(client, interaction, `please do not spam me; I'm a busy woman. The cooldown for the ${command.name} is ${cooldownAmount / 1000} seconds.`);
                        }
                }

                // update the timestamps collection for author to be new time
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


                try {
                        command.execute(message, args); // run command with args and database reference
                } catch (error) { // if there's an error, print it as well as a message in the chat
                        console.error(error);
                        reply(client, interaction, 'there was an error trying to execute this command :/');
                }

	},
}