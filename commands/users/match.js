// js file for the match command
// this command will match players into teams based on their elos

// self-defined helper functions
const { ApplicationCommandOptionType } = require('discord.js');
const { readData, updateCachedPlayers, getScore } = require('../../helper_functions/db_helper.js');
const { reply, reply_and_react } = require('../../helper_functions/comm_helper.js');
const helper = require('../../helper_functions/helper.js');

// consts used in this function
const confirm_reaction = '✅'; // reaction to confirm
const collection_time = 3; // in seconds

// actual module
module.exports = {
    // command name
	name: 'match',
    args: 1,
    admin: false,
    public: true,
    cooldown: 20,
    usage: '<number of players>',
    // description of command
	description: 'Begins process of matchmaking with an expected <number of players> (e.g. \"/match 10\"). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking',
    options: [{
        name: 'num_players', // changed from underscore to space for better readability
        type: ApplicationCommandOptionType.Integer, // int
        description: 'number of players playing in the match',
        required: true,
        minValue: 3,
        maxValue: 10
    }],

    // actual command code
	async execute(interaction) {
        // const data = readData();

        // extract number of players
        // const num_players = interaction.options.getInteger("num players");
        const num_players = 1; // TEMP

        console.log(`match: sending reaction prompt/reply...`);

        // very error prone, so using try/catch in case
        try {
            // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
            const repl = await reply_and_react(interaction, 'Please react :white_check_mark: if you wish to participate in the game', confirm_reaction);
            console.log(`match: repl sent ${repl}`);

            console.log(`match: client id is ${interaction.client.user.id}`);

            // create filter to filter reaction out later
            // only read confirmation reaction, and ignore the id of the bot
            const filter = (reaction, user) => reaction.emoji.name === confirm_reaction;
            
            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            // await ensures that we don't return before reactions complete
            // wait collected_time seconds (*1000 for ms->s) for num_players+1 (+1 for bot) reactions, for only 1 possible emoji
            repl.awaitReactions({filter, max: num_players+1, time: collection_time*1000, errors: ['time']})
                .then(collected => {
                    console.log('match: reactions recorded...');

                    // extract IDs of reactors
                    // KEY IS THE EMOJI
                    // https://discord.js.org/#/docs/main/stable/class/MessageReaction
                    // https://discord.js.org/#/docs/main/stable/class/ReactionUserManager

                    // get the first reaction (the checkmark)
                    // ids -> the ids of all people that used the first reaction
                    const users_coll = collected.first().users.cache;
                    const ids_arr = Array.from(collected.first().users.cache.keys());

                    console.log(`match: initial lists are ${users_coll.toJSON()} and ${ids_arr}`);

                    // if bot id is in the lists, remove from both (assumes order is the same in both lists)
                    let bot_id;
                    if ((bot_id = ids_arr.indexOf(interaction.client.user.id)) !== -1) {
                        ids_arr.splice(bot_id, 1);
                        users_coll.splice(bot_id, 1);
                    }

                    console.log(`match: final lists are ${users_coll.toJSON()} and ${ids_arr}`);

                    // send a message saying polling has closed
                    interaction.channel.send('Polling has closed. Making teams...');
                    console.log(`match: polling closed`);


                    // find these ids in the list and make a dictionary of their elos
                    let elos = {};
                    ids_arr.forEach(user_id => {
                        let temp_score;
                        // if found, just read it lol
                        if ((temp_score = getScore(user_id)) !== undefined) { 
                            elos[user_id] = temp_score;
                        }
                        // if rank is not found, use random negative number
                        else {
                            // users with a negative elo will be given the average of everyone else as an elo
                            elos[user_id] = -1;
                        }
                    });

                    console.log(`match: elos are ${JSON.stringify(elos)}`);


                    // make the teams
                    // if teams can't be made, let them know
                    // returns false if error btw
                    helper.makeTeams(users_coll, elos, interaction, 10);

                    // cache last set of players used
                    // updateCachedPlayers(ids);
                    
                })
                .catch(collected => { 
                    // print error message based on error
            	    if (collected.size !== undefined) {
                        console.log(`match: After ${collection_time}s, only ${collected.size} out of ${num_players} reacted.`);
                        // send a followup error message
                        interaction.channel.send('Error: Polling has closed. Not enough people have chosen to participate.');
                    }
                    else {
                        console.log(`match: awaitReactions failed with ${collected}`);
                        // send a followup error message
                        interaction.channel.send(`Error: Something went wrong on our end. Please try again or contact ${interaction.client.my_maker} with ERRORNO 2`);
                    }
            });
        } catch (error) {
            console.log(`Error replying and reacting: ${error}`);
        }
    },
};