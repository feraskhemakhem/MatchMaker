// module for message event of client (runs every time a message is sent)
// only used for deploy command

// temp fields (to server later)
const db_helper = require('../helper_functions/db_helper.js');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {

        console.log(message.toString());
        // if owner says to deploy, i deploy :)
        if (message.content.startsWith("!deploy") && message.author.id === client.my_maker.id) {

            console.log("deploy detected");

            // store arguments and the actual command in variables
            const args = message.content.slice(client.prefix.length).trim().split(/ +/); // use regex to split by any # of spaces
            args.shift(); //  remove "!deploy" from args
            
            try {
                const command = client.commands.get("deploy");
                console.log(command, args);
                command.execute(message, args, client); // run command with args and database reference
            } catch (error) { // if there's an error, print it as well as a message in the chat
                console.error(error);
                message.reply(client, interaction, 'there was an error trying to execute this command :/');
            }
        }
	},
};