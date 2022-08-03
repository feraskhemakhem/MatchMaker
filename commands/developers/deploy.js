// js file for the getting elo of tagged user

const fs = require('fs');
let last_command;

module.exports = {
    name: 'deploy',
    public: false,
    cooldown: 0.5,
    description: 'deploys slash commands',

    async execute(message, args) {

        const { client } = message;

        // if no args, deploy from cache
        if (!args.length) {
            if (!last_command) {
                return;
            }

            // find command given arg name and add it
            // https://gist.github.com/advaith1/287e69c3347ef5165c0dbde00aa305d2

            // if name is not a command, ignore
            if (!client.commands.has(last_command)) return;

            // find command reference
            const command = client.commands.get(last_command);

            if (!command.public || command.admin) return; // if not for all users, hide

            let functional_desc = command.description;
            if (command.description.length < 1 || command.description.length > 100) {
                functional_desc = command.description.substring(0, command.description.indexOf('.'));
            }
            // add command to list of commands
            const curr_guild = await client.guilds.fetch(process.env.GUILD_ID);

            curr_guild.commands.post({data: {
                name: command.name,
                description: functional_desc,
                options: command.options,
            }});

            message.reply(`command ${last_command} deployed`);
            
        }
        else { 
            // if "all", deploy every user command
            if (args[0].toLowerCase() === 'all') {
                // deleting all old commands

                console.log(`deleting old commands...`);

                // obtain old ids
                const curr_guild = await client.guilds.fetch(process.env.GUILD_ID);
                const old_ids = await curr_guild.commands.get();              
                
                // delete each id from commands list
                old_ids.forEach(old_id => {
                    curr_guild.commands(old_id.id).delete();
                });

                console.log(`adding all commands...`);

                // iterate through existing commands
                for (const [commandName, command] of client.commands) {
                    // only deploy public commands not for admins
                    if (command.admin || !command.public) continue;
                    // only access up to first 100 characters of description if applicable
                    let functional_desc = command.description;
                    if (command.description.length < 1 || command.description.length > 100) {
                        functional_desc = command.description.substring(0, command.description.indexOf('.'));
                    }
                    console.log(`adding command ${commandName}`);

                    // add slash command
                    curr_guild.commands.post({data: {
                        name: command.name,
                        description: functional_desc,
                        options: command.options,
                    }});
                }

                message.reply(`deployed all of the commands!`);
            }
            else if (args[0].toLowerCase() === 'clear') {
                console.log(`deleting old commands...`);

                // obtain old ids
                const curr_guild = await client.guilds.fetch(process.env.GUILD_ID);
                const old_ids = await curr_guild.commands.get();

                // delete each command id
                old_ids.forEach(old_id => {
                    curr_guild.commands(old_id.id).delete();
                });
                console.log(`done`);
            }
            // if specific command, deploy that command
            else {
            
                // find command given arg name and add it
                // https://gist.github.com/advaith1/287e69c3347ef5165c0dbde00aa305d2

                // if name is not a command, ignore
                if (!client.commands.has(args[0])) return;

                // find command reference
                const command = client.commands.get(args[0]);

                if (!command.public || command.admin) return; // if not for all users, hide

                // only take first 100 characters of description
                let functional_desc = command.description;
                if (command.description.length < 1 || command.description.length > 100) {
                    functional_desc = command.description.substring(0, command.description.indexOf('.'));
                }
                // add command to list of commands
                // this also changed with v14 of discord.js
                const curr_guild = await client.guilds.fetch(process.env.GUILD_ID);
                curr_guild.commands.create({
                    name: command.name,
                    description: functional_desc,
                    options: command.options,
                })
                .then(console.log)
                .catch(console.error);

                last_command = args[0];

                message.reply(`command ${args[0]} deployed`);
            }
        }
    },
};