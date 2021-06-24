// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// Next:
// - (DONE) Tweak the UI for displaying (esp advantage). it doesnt feel full enough... find more stuff to put idk
// - (DONE) Dont let people make matches with 1 or less people (eventually i guess?)
// - Look into SQL Lite and see if it's worth it for this scope
// - (DONE) Look into making elo-setting reaction-based
// - (DONE) Alter team-making algorithm to treat unrated as the average
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')
// - Add option in setup to check tags instead of checking server
// - Add "!help" or "!commands" to let people know the available commands

// consts
const package = require('./package.json');   // info about the node.js project
const Discord = require('discord.js');       // discord api reference
const commands = require('./commands.js');   // self defined functions
const dotenv = require('dotenv');           // for supporting a .env with secrets
const client = new Discord.Client();        // for hosting a bot client in discord
const mm_mulan = new Discord.MessageAttachment('./assets/matchmakermulan.jpg'); // for hosting mulan image

//https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs
dotenv.config();

// temp const for testing
const random_dict = {};

// cached last players (only caches 1 team across all servers - would have to add to database for multiserver use)
let cached_players = {};

const debug = true; // BOOLEAN FOR DEBUGGING :DD

// guild message for setting elos
let server_setup_message;

// reaction collector for setting elos
const collector_filter = (reaction, user) => commands.isValorantEmoji(reaction.emoji.name) && user.id !== client.user.id;

// ON CREATION, PUT A MESSAGE IN THE SERVER ASKING FOR RANKS
client.on('ready', () => {
    console.log(`I'm ready!`);
});
 
// constantly running callback for when a message is sent
client.on('message', async message => {
    if (message.content.startsWith('!match')) {

        // extract number of players
        let digits = /\d+/;
        let num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (isNaN(num_players)) {
            message.channel.send('Please follow the format: \"!match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                message.channel.send('At least 2 people required to make a match');
                return;
            }
        }

        let ids = [];

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const reply = await message.channel.send('Please react :white_check_mark: if you wish to participate in the game');
            await reply.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅';
            };

            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            reply.awaitReactions(filter, { max: num_players, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
                .then(collected => {
                    console.log('Responses recorded...');

                    // extract IDs of reactors
                    // KEY IS THE EMOJI
                    // https://discord.js.org/#/docs/main/stable/class/MessageReaction
                    // https://discord.js.org/#/docs/main/stable/class/ReactionUserManager
                    let temp_count = collected.first().count;
                    ids = Array.from(collected.first().users.cache.firstKey(temp_count)); // apparently i need all of this for ids

                    // if bot's ID exists in list, remove (commented out when debugging)
                    if (!debug) {
                        let index_of_my_id;
                        if ((index_of_my_id = ids.indexOf(client.user.id)) !== -1) {
                            ids.splice(index_of_my_id, 1);
                        }
                    }

                    message.channel.send('Polling has closed. Making teams...');


                    // find these ids in the list and make a dictionary of their elos
                    let elos = {};
                    ids.forEach(element => {
                        if (random_dict[element]) {
                            elos[element] = random_dict[element];
                        }
                        else { // if rank is not found, set to unranked
                            elos[element] = -30;
                            random_dict[element] = -30;
                        }
                    });

                    console.log(`elos are: ${JSON.stringify(elos)}`);


                    // make the teams
                    if (!commands.makeTeams(elos, message, client)) { // if teams aren't made, let them know
                        message.channel.send('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last set of players used
                    cached_players = elos;
                })
                .catch(collected => { 
                message.channel.send('Polling has closed. Not enough people have chosen to participate.');
            	console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log('error replying and reacting');
        }        

    }
    // set the elo of yourself
    // WARNING: THIS ONLY WORKS FOR VALORANT RN
    else if (message.content.startsWith('!setelo')) {

        console.log('registering new elo');
        
        // calculate the score based on the elo provided
        let elo = message.content.substring(message.content.indexOf(' ') + 1);
        elo = elo.charAt(0).toUpperCase() + elo.slice(1); // make first letter uppercase

        let score;
        if ((score = commands.eloToScore(elo)) === -1) { // if -1, then error, so return
            return;
        }

        // TODO: add entry with user key and score to server
        random_dict[message.author.id] = score;

        // send message to confirm score value
        await message.channel.send(`your rank was registered`);
    }

    else if (message.content.startsWith('!reroll')) { // in case we don't like the teams, we can reroll
        if (Object.entries(cached_players).length === 0) { // check if cached team is empty
            message.channel.send('No player lists cached. Please use \"!match <player count>" instead');
            return;
        }
        if (!commands.makeTeams(cached_players, message, client)) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
            return;
        }
    }

    else if (message.content === '!myelo') { // prints elo if user
        if (!random_dict[message.author.id]) { // if rank doesnt exists, print it
            message.channel.send(`No elo is recorded under your username`);
            return;
        }
        // find the emoji we want given guild and elo
        console.log(`my elo is ${commands.scoreToElo(random_dict[message.author.id])}`);
        const emoji = await commands.findValorantEmoji(message.guild, commands.scoreToElo(random_dict[message.author.id]));

        // otherwise, calculate rank and react with an emoji for that rank
        message.react(emoji);
    }

    else if (message.content.startsWith('!setup') && // https://discord.js.org/#/docs/main/stable/class/Permissions
        message.member.hasPermission('ADMINISTRATOR')) { // set up reactions for assigning elos to players

        // make sure server is available, suggested by documentation
        if (!message.guild.available) {
            console.log(`Guild not available for setup`);
            return;
        }

        let default_text = 'Please choose your rank by selecting the reaction that corresponds to it. If you want to unselect a rank, click the same rank again';
        let setup_message;
        
        if (!(setup_message = await commands.setup(message, default_text))) {
            console.log(`ahaha`);
            return;
        }

        // assign message to server setup message
        // also create reaction collector for assigning elos
        server_setup_message = setup_message;
        const elo_collector = setup_message.createReactionCollector(collector_filter);
        // collect elo reactions
        elo_collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            // process elo reaction
            random_dict[user.id] = commands.processEloReaction(reaction, user);
        });
        console.log(`setup message resolved`);

        // if reactions do not exist, add them to server
        // first, get a list of emojis with 'Valorant(rank)' names
        let valorant_emojis = message.guild.emojis.cache.filter(emoji => emoji.name.startsWith('Valorant'));
        valorant_emojis = Array.from(valorant_emojis.values());

        let emoji_names = [];
        valorant_emojis.forEach(element => emoji_names.push(element.name));

        // for each emoji that does not exist, add it to the server
        let ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];
        for (const element of ranks) { // not the best but cleanest way to ensure order and linearity
            let new_emoji;
            if (emoji_names.indexOf(`Valorant${element}`) === -1) { // if not found, add it then react
                new_emoji = await message.guild.emojis.create(`./assets/Valorant${element}.webp`, `Valorant${element}`, {reason:'For use with the MatchMaker bot'});
            }
            else { // if emoji aready exists, react
                new_emoji = valorant_emojis[emoji_names.indexOf(`Valorant${element}`)];
            }
            await setup_message.react(new_emoji);
        }

        message.channel.send(`Message sent`); 
    }

    else if (message.content === '!commands') {
        // print all matchmaker commands
        let command_info = new Map();
        command_info.set('!match <number of players>', 'Begins process of matchmaking with an expected <number of players>');
        command_info.set('!reroll', 'Reattempts matchmaking with the same players as in the last !match pool');
        command_info.set('!myelo', '');
        command_info.set('!setelo', 'setelo info');
        command_info.set('!v', 'v info');

        const command_names = command_info.keys();
        
        let admin_info = new Map();
        admin_info.set('!setup', 'setup info');
        
        // create embedded message with necessary information
        // https://discordjs.guide/popular-topics/embeds.html#attaching-images-2
        const commands_embed = new Discord.MessageEmbed()
            .setColor('#ffb7c5')
            .setTitle('MatchMaker Commands')
            .setAuthor('MatchMaker Bot', 'attachment://matchmakermulan.jpg', 'https://www.youtube.com/watch?v=fO263dPKqns') // link to 2nd best mulan song :)
            .setTimestamp()
            .setFooter('For further clarification, contact @cherry_blossom#0030')

        // process commands for embed
        let user_command_string = '\u200B';
        for (let [command, info] of command_info) {
            // commands_embed.addField(command, info, false);
            user_command_string = user_command_string + `\n` + `\`${command}\`\n${info}\n`;
        }
        user_command_string = user_command_string + `\u200B`;

        if (message.member.hasPermission('ADMINISTRATOR')) {// if mod, have 2 categories
            let admin_command_string = '\u200B';
            for (let [command, info] of admin_info) {
                // commands_embed.addField(command, info, false);
                admin_command_string = admin_command_string + `\n` + `\`${command}\`\n${info}\n`;
            }
            admin_command_string = admin_command_string + `\u200B`;
            commands_embed.addField('User Commands', user_command_string, true);
            commands_embed.addField('Admin Commands', admin_command_string, true);
        }
        else { // no need to subcategorize if not an admin
            commands_embed.addField('\u200B', user_command_string);
        }

        message.channel.send({files: [mm_mulan], embed: commands_embed});
    }

    // else if (message.content === '!clear reactions') { // for clearing reactions while testing
    //     let emojis = Array.from(message.guild.emojis.cache.values());
    //     emojis.forEach(element => {
    //         element.delete('Clearing for more testing with MatchMaker');
    //     });
    // }

    else if (message.content === '!v') { // prints the version of matchmaker
        // get version from package file
        message.channel.send(`MatchMaker ${package.version}`);
    }

    else if (message.author.id === '274360817707778050' && Math.random() > 0.9) { // a gift for rich :)
        message.channel.send('<@274360817707778050> go fuck yourself');
    }
});

 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret