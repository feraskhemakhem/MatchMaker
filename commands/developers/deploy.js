// js file for the getting elo of tagged user

const fs = require('fs');

module.exports = {
    name: 'deploy',
    public: false,
    usage: '',
    cooldown: 0.5,
    description: 'deploys slash commands',

    async execute(message, args) {

        const { client } = message;

        // if no args, deploy every user command
        if (!args.length) {
            // deleting all old commands

            console.log(`deleting old commands...`);

            const old_ids = await client.api.applications(client.user.id).guilds('625862970135805983').commands.get();
            old_ids.forEach(old_id => {
                client.api.applications(client.user.id).guilds('625862970135805983').commands(old_id.id).delete();
            });

            console.log(`adding all commands...`);

            // iterate through each user 
            const commandFolders = fs.readdirSync('./commands');

            for (const folder of commandFolders) {
                if (folder.endsWith('js')) continue; // if a file and not a folder, skip
                const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
                // for each file, add the command to client.commands
                for (const file of commandFiles) {
                    const command = require(`../${folder}/${file}`);

                    if (!command.public || command.admin) continue; // if not for all users, hide

                    let functional_desc = command.description;
                    if (command.description.length < 1 || command.description.length > 100) {
                        functional_desc = command.description.substring(0, command.description.indexOf('.'));
                    }
                    console.log(`adding command ${file}`);

                    // add slash command
                    client.api.applications(client.user.id).guilds('625862970135805983').commands.post({data: {
                        name: command.name,
                        description: functional_desc,
                        options: command.options,
                    }});
                }
            }

            message.reply(`deployed all of the commands!`);

        }
        else { // find command given arg name and add it
            // https://gist.github.com/advaith1/287e69c3347ef5165c0dbde00aa305d2

            // if name is not a command, ignore
            if (!client.commands.has(args[0])) return;

            // find command reference
            const command = client.commands.get(args[0]);

            if (!command.public || command.admin) return; // if not for all users, hide

            let functional_desc = command.description;
            if (command.description.length < 1 || command.description.length > 100) {
                functional_desc = command.description.substring(0, command.description.indexOf('.'));
            }
            // add command to list of commands
            client.api.applications(client.user.id).guilds('625862970135805983').commands.post({data: {
                name: command.name,
                description: functional_desc,
                options: command.options,
            }});

            message.reply(`command ${args[0]} deployed`);
        }

        return undefined;
    },
};