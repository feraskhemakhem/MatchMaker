// js file for the getting info on all other commands

const { templateEmbed } = require('../../helper_functions/helper.js');  // self-defined helper functions
const { reply } = require('../../helper_functions/event_helper.js');    // helper for all event-related things
const { AttachmentBuilder } = require('discord.js');                    // attachment builder function reference
const mm_mulan = new AttachmentBuilder('./assets/matchmakermulan.jpg'); // for hosting mulan image


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
	async execute(interaction, args, client) {

        // get references to commands from client
        const { commands, prefix, my_maker } = client;

        // if an argument is provided, read it and print description!
        if (args.length) {

            const mem = interaction.member;
            console.log(mem);

            // command can only be lowercase
            let commandName = args[0].toLowerCase();
            // if argument is not a command, provide error
            if (!commands.has(commandName)) {
                reply(client, interaction, `${commandName} is not an available argument`);
                return;
            }
            // if argument is a command, provide description of it
            else {
                const command = commands.get(commandName);
                // INTERACTION INCOMPLETE: admin is 1<<3 (https://discord.com/developers/docs/topics/permissions)
                if (command.admin && !(interaction.member.permissions & 1<<3 === 1<<3)) return; // if admin command and is user, dont print
                // if (command.admin && !interaction.member.hasPermission('ADMINISTRATOR')) return; // if admin command and is user, dont print
                let description_string = `\`${prefix}${command.name}${command.usage ? ' ' + command.usage : ''}\`: ${command.description}`;
                reply(client, interaction, description_string);
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
            templateEmbed()
            .then(commands_embed => {  
                commands_embed
                .setFooter(`For further clarifications, please contact ${my_maker.tag}`, my_maker.displayAvatarURL({size: 16})) // add a little photo of my avatar if it can :)
                .setTitle('MatchMaker Commands');

                // const mem = interaction.member;
                // console.log(`${JSON.stringify(mem)}, with permissions ${mem.permissions} and id ${mem.id}`);

                // INTERACTION INCOMPLETE: for some reason, hasPermission isn't working, so using bool manipulation
                // ADMIN is 1<<3
                if (interaction.member.permissions & 1<<3 === 1<<3) {// if mod, have 2 categories
                    commands_embed.addField('User Commands', '\u200B' + user_descriptions, true); // only add indent if admin bc otherwise it looks bad
                    commands_embed.addField('Admin Commands', admin_descriptions, true);
                }
                // if (interaction.member.hasPermission('ADMINISTRATOR')) {// if mod, have 2 categories
                //     commands_embed.addField('User Commands', '\u200B' + user_descriptions, true); // only add indent if admin bc otherwise it looks bad
                //     commands_embed.addField('Admin Commands', admin_descriptions, true);
                // }
                else { // no need to subcategorize if not an admin
                    commands_embed.addField('\u200B', user_descriptions);
                }

                // send the message 
                reply(client, interaction, 'sorry embed messages are not supported yet');
                // reply(client, interaction, {files: [mm_mulan], embed: commands_embed});
            });
        }
    },
};
