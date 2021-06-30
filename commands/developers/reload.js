// js file for the getting elo of tagged user

// filesystem reference
const fs = require('fs');

module.exports = {
    name: 'reload',
    args: 1,
    cooldown: 3,
    public: false,
    usage: '<command>',
    description: 'reloads <command>',

    async execute(message, args) {
        // get command from args
        const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName);

        // if not found, provide message
		if (!command) {
			message.reply(`There is no command with a name \`${commandName}\`, master`);
            return undefined;
		}

        console.log(`reloading ${command.name}`);

        // if found, find the folder and file for this command
        const commandFolders = fs.readdirSync('./commands'); // path relative to bot.js i guess
        const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));

        // https://discordjs.guide/command-handling/adding-features.html#reloading-commands
        // cant just require again bc it uses cache, so delete and redo from scratch
        delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];
        try {
            const newCommand = require(`../${folderName}/${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            message.reply(`Command \`${newCommand.name}\` was reloaded, master`);
        } catch (error) {
            console.error(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\`, master :(`);
        }

        return undefined;
    },
};