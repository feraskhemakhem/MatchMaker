// js file for the match command

module.exports = {
    // command name
	name: 'match',
    // description of command
	description: 'Begins process of matchmaking with an expected <number of players> (e.g. \'!match 10\'). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking',

    // actual command code
	execute(message, args) {
        // extract number of players
        let digits = /\d+/;
        let num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (isNaN(num_players)) {
            message.reply('Please follow the format: \"!match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                message.reply('At least 2 people required to make a match');
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
                    if (!helper.makeTeams(elos, message, client, Discord, mm_mulan, stdev_ratio)) { // if teams aren't made, let them know
                        message.reply('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last set of players used
                    cached_players = elos;
                })
                .catch(collected => { 
                message.reply('Polling has closed. Not enough people have chosen to participate.');
            	console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log('Error replying and reacting');
        }   	
    },
};