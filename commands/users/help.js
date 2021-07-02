// js file for the getting info on all other commands

const helper = require('../../helper_functions/helper.js'); // self-defined helper functions
const Discord = require('discord.js'); // discord api reference
const mm_mulan = new Discord.MessageAttachment('./assets/matchmakermulan.jpg'); // for hosting mulan image


module.exports = {
    // command name
	name: 'help',
    admin: false,
    cooldown: 3,
    public: true,
    // description of command
	description: 'Lists all of commands or info about a specific command.',
    options: [{
        name: 'command',
        type: 3, // string
        description: 'command you want details on',
        required: false,
    }],

    
    // actual command code
	async execute(message, args, data) {

        // get references to commands from client
        const { commands, prefix, my_maker } = message.client;

        if (args.length) {
            // if an argument is provided, read it and print description!

            // command can only be lowercase
            let commandName = args[0].toLowerCase();
            // if argument is not a command, provide error
            if (!commands.has(commandName)) {
                message.reply(`${commandName} is not an available argument`);
                return undefined;
            }
            // if argument is a command, provide description of it
            else {
                const command = commands.get(commandName);
                if (command.admin && !message.member.hasPermission('ADMINISTRATOR')) return undefined; // if admin command and is user, dont print
                let description_string = `${command.name}${command.usage ? ' ' + command.usage : ''}: ${command.description}`;
                message.channel.send(description_string);
            }
        }

        // if no argument is provided, print all alrguments
            else {

                //  add all matchmaker descriptions to two print strings
                // process commands for embed
                let user_descriptions = '';
                let admin_descriptions = '\u200B';
                commands.forEach(element => { // if admin, add to admin description, otherwise user desc
                    if (!commands.public) return; // if not public, don't print
                    let command_usage = `${prefix}${element.name}`;
                    if (element.usage && element.usage !== '')
                        command_usage = command_usage + ` ${element.usage}`;
                    if (element.admin)
                        admin_descriptions = admin_descriptions + `\n\`${command_usage}\`\n${element.description}\n`;
                    else
                        user_descriptions = user_descriptions + `\n\`${command_usage}\`\n${element.description}\n`;
                });
                admin_descriptions = admin_descriptions + `\u200B`;
                user_descriptions = user_descriptions + `\u200B`;

                // create embedded message with necessary information
                helper.templateEmbed()
                .then(commands_embed => {  
                    commands_embed
                    .setFooter(`For further clarifications, please contact ${my_maker.tag}`, my_maker.displayAvatarURL({size: 16})) // add a little photo of my avatar if it can :)
                    .setTitle('MatchMaker Commands');

                    if (message.member.hasPermission('ADMINISTRATOR')) {// if mod, have 2 categories
                        commands_embed.addField('User Commands', '\u200B' + user_descriptions, true); // only add indent if admin bc otherwise it looks bad
                        commands_embed.addField('Admin Commands', admin_descriptions, true);
                    }
                    else { // no need to subcategorize if not an admin
                        commands_embed.addField('\u200B', user_descriptions);
                    }

                    // send the message
                    message.reply({files: [mm_mulan], embed: commands_embed});
                });
            }
        return undefined;
    },
};
