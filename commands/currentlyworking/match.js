// js file for the match command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'match',
    // description of command
	description: 'Begins process of matchmaking with an expected <number of players> (e.g. \"/match 10\"). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking',

    // actual command code
	async execute(message, args, data, client) {
        const debug = true;
        // check number of args
        if (args.length !== 1) {
            message.reply('Error: incorrect number of arguments. Please follow the format: \"/match <number of players>\"');
            return;
        }

        // extract number of players
        let num_players = parseInt(args[0]);

        // small error checking for number of players
        if (isNaN(num_players)) {
            message.reply('Error: expected a number. Please follow the format: \"/match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                message.reply('Error: At least 2 people required to make a match');
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
            // await ensures that we don't return before reactions complete
            await reply.awaitReactions(filter, { max: num_players, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
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
                        console.log(data.player_elos);
                        if (data.player_elos[element]) { // if found, just read it lol
                            elos[element] = data.player_elos[element];
                        }
                        else { // if rank is not found, use random negative number
                            elos[element] = -69;
                        }
                    });


                    console.log(`elos are: ${JSON.stringify(elos)}`);


                    // make the teams
                    if (!helper.makeTeams(elos, message, client, data.stdev_ratio)) { // if teams aren't made, let them know
                        message.reply('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last set of players used
                    data.cached_players = ids;
                    
                })
                .catch(collected => { 
                message.reply('Polling has closed. Not enough people have chosen to participate.');
            	console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log('Error replying and reacting');
        }
        return data; // return for new cached players db update
    },
};