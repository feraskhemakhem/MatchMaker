// js file for the getting info on all other commands

const helper = require('../helper.js'); // self-defined helper functions
const prefix = '/'; // prefix i guess
const Discord = require('discord.js'); // discord api reference
const mm_mulan = new Discord.MessageAttachment('./assets/matchmakermulan.jpg'); // for hosting mulan image


module.exports = {
    // command name
	name: 'help',
    admin: false,
    usage: '',
    public: true,
    // description of command
	description: 'Lists all of commands or info about a specific command.',

    
    // actual command code
	async execute(message, args, data, your_maker) {
        // get references to commands from client
        const { commands } = message.client;

        //  add all matchmaker descriptions to two print strings
        // process commands for embed
        let user_descriptions = '';
        let admin_descriptions = '\u200B';
        commands.forEach(element => { // if admin, add to admin description, otherwise user desc
            if (!element.public) continue; // 
            if (element.admin)
                admin_descriptions = admin_descriptions + `\n\`${element.name}\`\n${element.description}\n`;
            else
                user_descriptions = user_descriptions + `\n\`${element.name}\`\n${element.description}\n`;
        });
        admin_descriptions = admin_descriptions + `\u200B`;
        user_descriptions = user_descriptions + `\u200B`;

        // create embedded message with necessary information
        const commands_embed = await helper.templateEmbed();  
        commands_embed
        .setFooter(`For further clarifications, please contact ${your_maker.tag}`, your_maker.displayAvatarURL({size: 16})) // add a little photo of my avatar if it can :)
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
    },
};
