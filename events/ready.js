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
        client.user.setActivity(`${prefix}help for help`, {type: 'WATCHING'});

        // wait for a reference to author's user
        const app = await client.fetchApplication();
        client.my_maker = app.owner;

        // const slash_command = await client.guilds.cache.get('625862970135805983')?.commands.create(data);
        // console.log(`slash is ${JSON.stringify(slash_command)}`);
    
        // processing commands
        // read all the sub-folders of commands
        const commandFolders = fs.readdirSync('./commands');

        // add just /v for now
        const command = require('../commands/users/v.js');
        client.commands.set(command.name, command);
        cooldowns.set(command.name, new Discord.Collection());
    
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

        // register slash commands

    
        console.log(`I'm ready!`);
	},
}