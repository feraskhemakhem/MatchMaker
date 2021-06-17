// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// Next:
// - (DONE) Tweak the UI for displaying (esp advantage). it doesnt feel full enough... find more stuff to put idk
// - (DONE) Dont let people make matches with 1 or less people (eventually i guess?)
// - Look into SQL Lite and see if it's worth it for this scope
// - Look into making elo-setting reaction-based

// consts
const Discord = require('discord.js');
const commands = require('./commands.js');
const { debug } = require('request');
const client = new Discord.Client();

// temp const for testing
const random_dict = {};

// cached last players (only caches 1 team across all servers - would have to add to database for multiserver use)
let cached_team = {};
 
// constantly running callback for when a message is sent
client.on('message', async message => {
    if (message.content.startsWith('!match')) {

        // extract number of players
        var digits = /\d+/;
        var num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (isNaN(num_players)) {
            await message.channel.send('Please follow the format: \"!match <number of players>\"');
            return;
        }
        else if (num_players < 2) {
            await message.channel.send('At least 2 people required to make a match');
            return;
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
                    let index_of_my_id;
                    if ((index_of_my_id = ids.indexOf(client.user.id)) !== -1) {
                        ids.splice(index_of_my_id, 1);
                    }

                    message.channel.send('Polling has closed. Making teams...');


                    // find these ids in the list and make a dictionary of their elos
                    let elos = {};
                    ids.forEach(element => {
                        if (random_dict[element]) {
                            elos[element] = random_dict[element];
                        }
                    });

                    console.log(`elos are: ${JSON.stringify(elos)}`);


                    // make the teams
                    let are_teams_made = commands.makeTeams(elos, message, client);
                    if (!are_teams_made) { // if teams aren't made, let them know
                        message.channel.send('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last team used
                    cached_team = elos;

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
        // extract relevant info from string
        var elo = message.content.substring(message.content.indexOf(' ') + 1);
        var elo_bracket = elo.substring(0, elo.indexOf(' '));
        var elo_number = parseInt(elo.substring(elo.indexOf(' ') + 1)) || -1;

        // edge case for no subrank number
        if (elo === 'radiant') {
            elo_bracket = 'radiant';
            elo_number = 0;
        }
        // small error checking
        else if (elo === -1) {
            await message.channel.send('Please follow the format: \"!setelo <rank bracket> <subrank number>');
            return;
        }
        // in case number is out of range
        else if (elo_number < 0 || elo_number > 3) {
            await message.channel.send('Please enter a valid subrank number');
            return;
        }

        var score = 0;
        // set initial score based on bracket
        // NOTE: probably cleaner with an enum equivilent
        switch(elo_bracket) {
            case "iron":
                score = 0;
                break;
            case "bronze":
                score = 1;
                break;
            case "silver":
                score = 2;
                break;
            case "gold":
                score = 3;
                break;
            case "platinum":
            case "plat":
                score = 4;
                break;
            case "diamond":
                score = 5;
                break;
            case "immortal":
                score = 6;
                break;
            case "radiant":
                score = 7;
                break;
            case "unranked": // unranked is negative as to ignore the rank in the future
                score = -10;
                break;
            default: // if we get this far, there's an error
                await message.channel.send('Only valid ranks are allowed');
                return;
        }

        // now consider number for elo
        score *= 3;
        score += elo_number;

        // TODO: add entry with user key and score to server
        random_dict[message.author.id] = score;

        // send message to confirm score value
        await message.channel.send(`your rank was registered as ${elo}`);
    }

    else if (message.content.startsWith('!reroll')) { // in case we don't like the teams, we can reroll
        if (Object.entries(cached_team).length === 0) { // check if cached team is empty
            message.channel.send('No player lists cached. Please use \"!match <player count>" instead');
            return;
        }
        let are_teams_made = commands.makeTeams(cached_team, message, client);
        if (!are_teams_made) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
            return;
        }
    }
    
    else if (message.content === '!v') {
        message.channel.send('MatchMaker v1.0');
    }

});




 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
