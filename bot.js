// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// Next:
// - (DONE) Tweak the UI for displaying (esp advantage). it doesnt feel full enough... find more stuff to put idk
// - (DONE) Dont let people make matches with 1 or less people (eventually i guess?)
// - Look into SQL Lite and see if it's worth it for this scope
// - Look into making elo-setting reaction-based
// - (DONE) Alter team-making algorithm to treat unrated as the average
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')
// - Add option in setup to check tags instead of checking server

// consts
const Discord = require('discord.js');
const commands = require('./commands.js');
const dotenv = require('dotenv');
const client = new Discord.Client();

//https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs
dotenv.config();

// temp const for testing
const random_dict = {};

// cached last players (only caches 1 team across all servers - would have to add to database for multiserver use)
let cached_players = {};

const debug = true; // BOOLEAN FOR DEBUGGING :DD

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
            await message.channel.send('Please follow the format: \"!match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                await message.channel.send('At least 2 people required to make a match');
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
        let score;
        if ((score = commands.eloToScore(message)) === -1) { // if -1, then error, so return
            return;
        }

        // TODO: add entry with user key and score to server
        random_dict[message.author.id] = score;

        // send message to confirm score value
        await message.channel.send(`your rank was registered as ${elo}`);
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
    
    else if (message.content === '!v') { // prints the version of matchmaker
        message.channel.send('MatchMaker v1.2');
    }

    else if (message.content === '!ping') { // just something for testing
        commands.printTeams(message, `t1`, `t2`, `no ad`);
    }

    else if (message.content === '!myelo') {
        if (random_dict[message.author.id]) { // if rank exists, print it
            message.channel.send(`Your elo is ${random_dict[message.author.id]}`);
        }
        else { // otherwise indicate that rank doesnt exist
            message.channel.send(`No elo is recorded under your username`);
        }
    }

});




 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret