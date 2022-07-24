// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// For v3.0:
// - (DONE) Make code more efficient / argument based
// - (DONE) Make commands slash-based instead of exlcimation-based
// - (DONE) Look into SQL Lite and see if it's worth it for this scope
// - (DONE) Add stdev command to developers
// - (DONE) If deploy/reload has no args, use last used command name
// - (DONE) Make database readings within the function instead of outside function
// - Convert ALL functions with args into using the options property of the interaction
// - Revisit "followUp" function in event_helper.js
// - Revisit embed functionality in reply function
// - Investigate database options that are non-local

// Potentially for v3.0:
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')
// - (DONE) Use subcommand groups to organize elo change (setelo, getelo, etc) (https://discord.com/developers/docs/interactions/slash-commands#subcommands-and-subcommand-groups)
// - Update readme to include information of what files are what
// - (DONE) Add interaction optimization
// - Add permissions for setup function
// - Add preprocessor code for readme to make version and command details automatic
// - Add oppourtunity for automatic registration of players from a voice channel (e.g. '-vc')

// v4.0:
// - Revisit the need for a commands collection, as commands are stored on discord when deploying them
// - Investigate whether patching commands is better than deleting then adding the same commands
// - (DONE for v3.0) WHENEVER IT COMES OUT, UPDATE INTERACTIONS TO WORK WITH DISCORDJS INSTEAD OF USING REST API
// - Change readData() to only pull single entry instead of all entries (optimization)


/********************************* CONSTS *********************************/

const fs = require('fs');                   							//  node.js native file system
const { Client, GatewayIntentBits, Collection } = require('discord.js');// client, intent, and collection references
const dotenv = require('dotenv');           							// for supporting a .env with secrets
// use of intents (respectively in order): create roles based on rank; add emojis for reacting ranks; for use of webhooks in match.js; creating a new message; reacting to message prompting for ranks; reading messages from users
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent]});
																		// ^for hosting a bot client in discord
client.commands = new Collection(); 							// collection of user/admin commands to be stored
client.cooldowns = new Collection();							// collection of cooldowns for each command

dotenv.config(); //https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs


/********************************* GLOBAL VARIABLES *********************************/

// for testing
client.debug = true;         // BOOLEAN FOR DEBUGGING :DD (turn on in shipped builds)
if (!client.debug) {		 // only prints console logs when debugging
	console.log = function() {};
}

// for fulltime use
client.prefix = '/';         // the prefix for all commands
client.default_cooldown = 5; // default cooldown time if none is given


/********************************* FUNCTIONS *********************************/

// https://discordjs.guide/creating-your-bot/event-handling.html#individual-event-files
// get all event files (files ending with '.js' in events folder)
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// instantiate events from js files in events folder
for (const file of eventFiles) {
	// if (file === 'messageCreate.js') continue; // skip message callback for now (DEPRICATED)
	const event = require(`./events/${file}`);
	if (event.once) { // if has "once" flag to only be called once
		client.once(event.name, (...args) => event.execute(...args, client));
	}
	else { // if callable event (interaction_create [slash commands], message)
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// client.on('interactionCreate', async interaction => {
// 	console.log(`interaction`);
// });

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); // BOT_TOKEN is the Client Secret