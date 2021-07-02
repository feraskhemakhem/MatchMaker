// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// For v3.0:
// - (DONE) Make code more efficient / argument based
// - (DONE) Make commands slash-based instead of exlcimation-based
// - Look into SQL Lite and see if it's worth it for this scope
// - (DONE) Add stdev command to developers
// - If deploy has no args, use last used variable
// - Update readme to include information of what files are what
// - Use subcommand groups to organize elo change (setelo, getelo, etc) (https://discord.com/developers/docs/interactions/slash-commands#subcommands-and-subcommand-groups)
// - Make database readings within the function instead of outside function

// Potentially for v3.0:
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')


/********************************* CONSTS *********************************/

const fs = require('fs');                   //  node.js native file system
const Discord = require('discord.js');      // discord api reference
const dotenv = require('dotenv');           // for supporting a .env with secrets
const client = new Discord.Client();        // for hosting a bot client in discord
client.commands = new Discord.Collection(); // collection of user/admin commands to be stored
client.cooldowns = new Discord.Collection();// collection of cooldowns for each command

dotenv.config(); //https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs


/********************************* GLOBAL VARIABLES *********************************/

// for testing
client.debug = true;         // BOOLEAN FOR DEBUGGING :DD

// for fulltime use
client.prefix = '/';         // the prefix for rall commands
client.default_cooldown = 5; // default cooldown time if none is given


/********************************* FUNCTIONS *********************************/

// https://discordjs.guide/event-handling/#individual-event-files
// get all event files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// instantiate events from js files in events folder
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret