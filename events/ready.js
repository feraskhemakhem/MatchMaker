// module for ready event of client

//  node.js native file system
const fs = require('fs');
// discord api reference
const Discord = require('discord.js'); 

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
        // cooldowns from the client
        const { cooldowns, prefix } = client;
        const require_path = '../commands';

        // set user status
        client.user.setActivity(`${prefix}help for help`, {type: Discord.ActivityType.Watching});

        console.log(`Ready! Logged in as ${client.user.tag}`);

        // wait until client is "ready" before fetching application owner
        client.application.fetch()
                .then(value => { client.my_maker = value.owner; });
    
        // processing commands

        // (temporary) add just /v for now
        const working_functions = ['v'];
        for (const w of working_functions) {
                const command = require(`../commands/users/${w}.js`);
                client.commands.set(command.name, command);
                cooldowns.set(command.name, new Discord.Collection());
        }

        // HARDCODED TEMP: also add deploy function
        const command = require(`../commands/developers/deploy.js`);
        client.commands.set(command.name, command);
        cooldowns.set(command.name, new Discord.Collection());

        // // read all the sub-folders of commands
        // const commandFolders = fs.readdirSync('./commands');

        // // for each subfolder, get all the files ending in js
        // for (const folder of commandFolders) {
        //     if (folder.endsWith('js')) continue; // if a file and not a folder, skip
        //     // if (folder === 'legacy_commands') continue; // if legacy commands, ignore
        //     const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        //     // for each file, add the command to client.commands
        //     for (const file of commandFiles) {
        //         const command = require(`${require_path}/${folder}/${file}`);
        //         // key is command name, value is actual command
        //         client.commands.set(command.name, command);
        //         // also add cooldowns
        //         cooldowns.set(command.name, new Discord.Collection());
        //     }
        // }
    
        console.log(`I'm ready!`);
	},
}