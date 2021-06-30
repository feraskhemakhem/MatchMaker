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
        const { cooldowns } = client;
        const require_path = '../commands';

        // set user status
        client.user.setActivity('!help for help', {type: 'WATCHING'});

        if (!client.my_maker) { // wait for a reference to author's user
            const app = await client.fetchApplication();
            client.my_maker = app.owner;
        }
    
        // processing commands
        // read all the sub-folders of commands
        const commandFolders = fs.readdirSync('./commands');
    
        // for each subfolder, get all the files ending in js
        for (const folder of commandFolders) {
            if (folder.endsWith('js')) continue; // if a file and not a folder, skip
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            // for each file, add the command to client.commands
            for (const file of commandFiles) {
                const command = require(`${require_path}/${folder}/${file}`);
                if (!command.public && !client.debug) continue; // if not ready for public use, and debug is off
                // key is command name, value is actual command
                client.commands.set(command.name, command);
                // also add cooldowns
                cooldowns.set(command.name, new Discord.Collection());
            }
        }
    
        console.log(`I'm ready!`);
	},
}