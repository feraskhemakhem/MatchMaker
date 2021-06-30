// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// For v3.0:
// - Make code more efficient / argument based
// - Make commands slash-based instead of exlcimation-based
// - Look into SQL Lite and see if it's worth it for this scope

// Potentially for v3.0:
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')


/********************************* CONSTS *********************************/

const fs = require('fs');                   //  node.js native file system
const Discord = require('discord.js');      // discord api reference
const dotenv = require('dotenv');           // for supporting a .env with secrets
const client = new Discord.Client();        // for hosting a bot client in discord
const mm_mulan = new Discord.MessageAttachment('./assets/matchmakermulan.jpg'); // for hosting mulan image
client.commands = new Discord.Collection();             // collection of user/admin commands to be stored
client.cooldowns = new Discord.Collection();            // collection of cooldowns for each command
const { cooldowns } = client;                           // cooldowns from the client

dotenv.config(); //https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs


/********************************* GLOBAL VARIABLES *********************************/

// temp fields (to server later)
const temp_db_name = 
    './temp/temp_db.json';  // name of temp dababase
let data = 
    require(temp_db_name);  // temp database stored in json file

// for testing
client.debug = true;         // BOOLEAN FOR DEBUGGING :DD

// for fulltime use
let your_maker;             // a reference to me :)
const prefix = '!';         // the prefix for rall commands
const default_cooldown = 5; // default cooldown time if none is given


/********************************* FUNCTIONS *********************************/

// on the bot waking up
client.on('ready', async () => {
    // set user status
    client.user.setActivity('!help for help', {type: 'WATCHING'});

    if (!your_maker) { // wait for a reference to author's user
        const app = await client.fetchApplication();
        your_maker = app.owner;
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
            const command = require(`./commands/${folder}/${file}`);
            if (!command.public && !client.debug) continue; // if not ready for public use, and debug is off
            // key is command name, value is actual command
            client.commands.set(command.name, command);
            // also add cooldowns
            cooldowns.set(command.name, new Discord.Collection());
        }
    }

    console.log(`I'm ready!`);
});
 
// constantly running callback for when a message is sent
client.on('message', async message => {

    /************************************ preprocessing of arguments ************************************/
    // based on https://discordjs.guide/creating-your-bot/commands-with-user-input.html#basic-arguments

    // if command prefix is not found or message comes from bot, ignore it
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // store arguments and the actual command in variables
	const args = message.content.slice(prefix.length).trim().split(/ +/); // use regex to split by any # of spaces
	const commandName = args.shift().toLowerCase();


    /************************************ actual commands ************************************/
    // https://discordjs.guide/command-handling/#dynamically-executing-commands
    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);

    // make setup function invalid FOR NOw :(
    if (commandName === 'setup') return;

    // if admin command, get out of here!
    if (command.admin && !message.member.hasPermission('ADMINISTRATOR')) return;

    // she's a beaut: https://discordjs.guide/command-handling/adding-features.html#expected-command-usage
    // if incorrectly formatted, send strongly worded message
    if (command.args && command.args !== args.length) {
        let reply = `Error: incorrect number of arguments provided`;

        if (command.usage) {
            reply += `\nPlease follow the format: ${prefix}${command.name} ${command.usage}`;
        }
        return message.reply(reply);
    }

    // check for appropriate cooldowns
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000; // to milliseconds

    // value of each command cooldown is cooldowns > command > user > timestamp
    // if timestamps exist, check it
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        // if the cooldown is still going, tell them to waits
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please do not spam me; I'm a busy woman. The cooldown for the ${command.name} is ${cooldownAmount / 1000} seconds.`);
        }
    }

    // update the timestamps collection for author to be new time
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    let returned_value;

    try {
        returned_value = await command.execute(message, args, data, your_maker); // run command with args and database reference
    } catch (error) { // if there's an error, print it as well as a message in the chat
        console.error(error);
        message.reply('there was an error trying to execute this command :/');
    }

    // console.log(`returned value is ${JSON.stringify(returned_value)}`);

    // if returned, update db
    if (returned_value !== undefined) {
        data = returned_value;
        // write the data received back into the temp database
        fs.writeFile('./temp/temp_db.json', JSON.stringify(data), err => {
        
            // Checking for errors
            if (err) console.log('error storing to database'); 
        
            // if you've reached this point, update db successfully
            console.log('db update complete'); 
        });
    }



//     if (message.content.startsWith('!match')) {

//         // extract number of players
//         let digits = /\d+/;
//         let num_players = parseInt(message.content.match(digits));

//         // small error checking for number of players
//         if (isNaN(num_players)) {
//             message.reply('Please follow the format: \"!match <number of players>\"');
//             return;
//         }
//         if (!debug) {
//             if (num_players < 2) {
//                 message.reply('At least 2 people required to make a match');
//                 return;
//             }
//         }

//         let ids = [];

//         // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
//         try {
//             const reply = await message.channel.send('Please react :white_check_mark: if you wish to participate in the game');
//             await reply.react('✅');

//             const filter = (reaction, user) => {
//                 return reaction.emoji.name === '✅';
//             };

//             // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
//             reply.awaitReactions(filter, { max: num_players, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
//                 .then(collected => {
//                     console.log('Responses recorded...');

//                     // extract IDs of reactors
//                     // KEY IS THE EMOJI
//                     // https://discord.js.org/#/docs/main/stable/class/MessageReaction
//                     // https://discord.js.org/#/docs/main/stable/class/ReactionUserManager
//                     let temp_count = collected.first().count;
//                     ids = Array.from(collected.first().users.cache.firstKey(temp_count)); // apparently i need all of this for ids

//                     // if bot's ID exists in list, remove (commented out when debugging)
//                     if (!debug) {
//                         let index_of_my_id;
//                         if ((index_of_my_id = ids.indexOf(client.user.id)) !== -1) {
//                             ids.splice(index_of_my_id, 1);
//                         }
//                     }

//                     message.channel.send('Polling has closed. Making teams...');


//                     // find these ids in the list and make a dictionary of their elos
//                     let elos = {};
//                     ids.forEach(element => {
//                         if (random_dict[element]) {
//                             elos[element] = random_dict[element];
//                         }
//                         else { // if rank is not found, set to unranked
//                             elos[element] = -30;
//                             random_dict[element] = -30;
//                         }
//                     });

//                     console.log(`elos are: ${JSON.stringify(elos)}`);


//                     // make the teams
//                     if (!helper.makeTeams(elos, message, client, Discord, mm_mulan, stdev_ratio)) { // if teams aren't made, let them know
//                         message.reply('Unable to make teams with these players. Sorry :(');
//                     }

//                     // cache last set of players used
//                     cached_players = elos;
//                 })
//                 .catch(collected => { 
//                 message.reply('Polling has closed. Not enough people have chosen to participate.');
//             	console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
//             });
//         } catch (error) {
//             console.log('Error replying and reacting');
//         }        

//     }
//     // set the elo of yourself
//     // WARNING: THIS ONLY WORKS FOR VALORANT RN
//     else if (message.content.startsWith('!setelo')) {


//         const first_space = message.content.indexOf(' ');
//         const second_space = message.content.indexOf(' ', first_space+1);

//         let user_id = message.author.id;
//         let elo;

//         if (second_space === -1) {
//             elo = message.content.substring(first_space + 1);
//         }
//         else if (message.member.hasPermission('ADMINISTRATOR')) { // if requesting to change another user as an admin
//             elo = message.content.substring(first_space + 1, second_space);
//             if (!message.mentions.users.size) { 
//                 message.reply('If you want to change a user\'s elo, follow the format: !setelo <elo> <@user>');
//             }
//             // get first person mentioned in message
//             user_id = message.mentions.users.first();
//         }
//         else {
//             message.reply('You do not have the permissions to change their rank');
//             return;
//         }
//         console.log(`registering new elo for ${user_id}`);
        
//         // calculate the score based on the elo provided
//         elo = elo.charAt(0).toUpperCase() + elo.slice(1); // make first letter uppercase

//         let score;
//         if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
//             message.reply('Error: problem processing this rank');
//             return;
//         }

//         // TODO: add entry with user key and score to server
//         random_dict[user_id] = score;

//         // send message to confirm score value
//         message.reply(`your rank was registered`);
//     }

//     else if (message.content.startsWith('!reroll')) { // in case we don't like the teams, we can reroll
//         if (Object.entries(cached_players).length === 0) { // check if cached team is empty
//             message.reply('No player lists cached. Please use \"!match <player count>" instead');
//             return;
//         }
//         if (!helper.makeTeams(cached_players, message, client, Discord, mm_mulan, stdev_ratio)) { // if teams aren't made, let them know
//             message.channel.send('Unable to make teams with these players. Sorry :(');
//             return;
//         }
//     }

//     else if (message.content === '!myelo') { // prints elo if user
//         console.log(`!myelo by ${message.author.id}`);
//         if (!random_dict[message.author.id]) { // if rank doesnt exists, print it

//             message.react('🚫');
//             return;
//         }
//         // find the emoji we want given guild and elo
//         const emoji = await helper.findValorantEmoji(helper.scoreToElo(random_dict[message.author.id]), message.guild);

//         // otherwise, calculate rank and react with an emoji for that rank
//         message.react(emoji);
//     }

//     else if (message.content.startsWith('!setup') && // https://discord.js.org/#/docs/main/stable/class/Permissions
//         message.member.hasPermission('ADMINISTRATOR')) { // set up reactions for assigning elos to players

//         // make sure server is available, suggested by documentation
//         if (!message.guild.available) {
//             console.log(`Guild not available for setup`);
//             return; 
//         }

//         let default_text = 'Please choose your rank by selecting the reaction that corresponds to it.';
//         let setup_message;
        
//         if (!(setup_message = await helper.setup(message, default_text))) {
//             console.log(`ahaha`);
//             return;
//         }

//         // reaction collector for setting elos
//         const collector_filter = (reaction, user) => helper.isValorantEmoji(reaction.emoji.name) && user.id !== client.user.id;
//         // also create reaction collector for assigning elos
//         const elo_collector = setup_message.createReactionCollector(collector_filter);
//         // collect elo reactions
//         elo_collector.on('collect', (reaction, user) => {
//             console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
//             // process elo reaction
//             random_dict[user.id] = helper.processEloReaction(reaction, user);
//         });
//         console.log(`setup message resolved`);

//         // if reactions do not exist, add them to server
//         // first, get a list of emojis with 'Valorant(rank)' names
//         let valorant_emojis = message.guild.emojis.cache.filter(emoji => emoji.name.startsWith('Valorant'));
//         valorant_emojis = Array.from(valorant_emojis.values());

//         let emoji_names = [];
//         valorant_emojis.forEach(element => emoji_names.push(element.name));

//         // for each emoji that does not exist, add it to the server
//         let ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];
//         for (const element of ranks) { // not the best but cleanest way to ensure order and linearity
//             let new_emoji;
//             if (emoji_names.indexOf(`Valorant${element}`) === -1) { // if not found, add it then react
//                 new_emoji = await message.guild.emojis.create(`./assets/Valorant${element}.webp`, `Valorant${element}`, {reason:'For use with the MatchMaker bot'});
//             }
//             else { // if emoji aready exists, react
//                 new_emoji = valorant_emojis[emoji_names.indexOf(`Valorant${element}`)];
//             }
//             await setup_message.react(new_emoji);
//         }

//         message.reply(`Setup message sent`); 
//     }

//     else if (message.content === '!commands') {
//         // print all matchmaker commands
//         let command_info = new Map();
//         command_info.set('!match <number of players>', 'Begins process of matchmaking with an expected <number of players> (e.g. \'!match 10\'). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking');
//         command_info.set('!reroll', 'Reattempts matchmaking with the same players as the last !match pool. For example, if teams are made with 8 set people, !reroll will make new teams with those exact same people');
//         command_info.set('!myelo', 'Reacts with user\'s elo stored in database');
//         command_info.set('!setelo <elo>', 'Sets the elo of user to <elo>. <elo> is a string which supports capitalisation and lowercase (e.g. \'!setelo Radiant\')');
//         command_info.set('!v', 'Replies with current release version of MatchMaker');
        
//         let admin_info = new Map();
//         admin_info.set('!setup <#channel> <message>', 'Sends setup message of content <message> to <#channel> and prepares reactions for assigning elo. Message is optional, with default message as stand-in. Quotes around message are also optional (e.g. \'!setup #roles "React your elo here"\'). WARNING: THIS COMMAND SHOULD ONLY BE USED ONCE, UNLESS THE PREVIOUS MESSAGE IS DELETED');
//         admin_info.set('!setelo <@user> <elo>', '!Sets the elo of <@user> to <elo>. <elo> is a string which supports capitalisation and lowercase (e.g. \'!setelo @cherry_blossom gold\')');
        


//         // create embedded message with necessary information
//         const commands_embed = await helper.templateEmbed(Discord);  
//         commands_embed
//         .setFooter(`For further clarifications, please contact ${your_maker.tag}`, your_maker.displayAvatarURL({size: 16})) // add a little photo of my avatar if it can :)
//         .setTitle('MatchMaker Commands');

//         // process commands for embed
//         let user_command_string = '\u200B';
//         for (let [command, info] of command_info) {
//             // commands_embed.addField(command, info, false);
//             user_command_string = user_command_string + `\n` + `\`${command}\`\n${info}\n`;
//         }
//         user_command_string = user_command_string + `\u200B`;

//         if (message.member.hasPermission('ADMINISTRATOR')) {// if mod, have 2 categories
//             let admin_command_string = '\u200B';
//             for (let [command, info] of admin_info) {
//                 // commands_embed.addField(command, info, false);
//                 admin_command_string = admin_command_string + `\n` + `\`${command}\`\n${info}\n`;
//             }
//             admin_command_string = admin_command_string + `\u200B`;
//             commands_embed.addField('User Commands', user_command_string, true);
//             commands_embed.addField('Admin Commands', admin_command_string, true);
//         }
//         else { // no need to subcategorize if not an admin
//             commands_embed.addField('\u200B', user_command_string);
//         }

//         message.reply({files: [mm_mulan], embed: commands_embed});
//     }

//     else if (message.content === '!v') { // prints the version of matchmaker
//         // get version from package file
//         message.reply(`MatchMaker ${package.version}`);
//     }

//     else if (message.author.id === '274360817707778050' && Math.random() > 0.9) { // a gift for rich :)
//         message.reply('go fuck yourself');
//     }

//     else if (message.author.id === '237113691332542464' && Math.random() > 0.9) { // another gift, for jesus <3
//         message.reply('ur pp is big');
//     }

//     else if (message.content.startsWith('!stdev_ratio')) {
//         const key = message.content.substring(message.content.indexOf(' ') + 1);
//         if (key === '?') { // if asking for ratio
//             message.reply(stdev_ratio);
//         }
//         else if (!isNaN(parseFloat(key))) { // if float
//             stdev_ratio = parseFloat(key);
//             message.react('👍');
//         }
//     }

//     else if (command === 'args-info') {
//         if (!args.length) {
//             return message.reply(`You didn't provide any arguments, ${message.author}!`);
//         }

//         message.reply(`Command name: ${command}\nArguments: ${args}`);
//     }
});

 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret