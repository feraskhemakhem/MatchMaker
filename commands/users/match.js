// js file for the match command

// self-defined helper functions
const { readData, updateCachedPlayers } = require('../../helper_functions/db_helper.js');
const { reply, reactPost } = require('../../helper_functions/event_helper.js');
const helper = require('../../helper_functions/helper.js');

// FOR ALL INTERACTION INCOMPLETES, SEARCH KEYWORD WEBHOOK
module.exports = {
    // command name
	name: 'match',
    args: 1,
    admin: false,
    public: true,
    cooldown: 60,
    usage: '<number of players>',
    // description of command
	description: 'Begins process of matchmaking with an expected <number of players> (e.g. \"/match 10\"). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking',
    options: [{
        name: 'num_players',
        type: 3, // string
        description: 'number of players playing in the match',
        required: true,
    }],

    // actual command code
	async execute(interaction, args, client) {
        console.log(`begin!`);
        const { debug } = client.debug;
        const data = readData();

        // extract number of players
        let num_players = parseInt(args[0]);

        // small error checking for number of players
        if (isNaN(num_players)) {
            reply(client, interaction, 'Error: expected a number. Please follow the format: \"/match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                reply(client, interaction, 'Error: At least 2 people required to make a match');
                return;
            }
        }

        let ids = [];

        console.log(`sending reply...`);

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const repl = await reply(client, interaction, 'Please react :white_check_mark: if you wish to participate in the game');
            // await repl.react('✅');
            await repl.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅';
            };

            console.log(`repl sent`);
            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            // await ensures that we don't return before reactions complete
            await repl.awaitReactions(filter, { max: num_players, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
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
                        if ((index_of_my_id = ids.indexOf(message.client.user.id)) !== -1) {
                            ids.splice(index_of_my_id, 1);
                        }
                    }

                    new Discord.WebhookClient(client.user.id, interaction.token).send('Polling has closed. Making teams...');
                    // message.channel.send('Polling has closed. Making teams...');
                    console.log(`polling closed`);


                    // find these ids in the list and make a dictionary of their elos
                    let elos = {};
                    ids.forEach(element => {
                        if (data.player_scores[element]) { // if found, just read it lol
                            elos[element] = data.player_scores[element];
                        }
                        else { // if rank is not found, use random negative number
                            elos[element] = -69;
                        }
                    });


                    console.log(`elos are: ${JSON.stringify(elos)}`);


                    // make the teams
                    if (!helper.makeTeams(elos, message, message.client, data.stdev_ratio)) { // if teams aren't made, let them know
                        new Discord.WebhookClient(client.user.id, interaction.token).send('Unable to make teams with these players. Sorry :(');
                        // message.reply('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last set of players used
                    updateCachedPlayers(ids);
                    
                })
                .catch(collected => { 
                    // send a followup message
                    new Discord.WebhookClient(client.user.id, interaction.token).send('Polling has closed. Not enough people have chosen to participate.');
            	    console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log(`Error replying and reacting: ${error}`);
        }
    },
};