// js file for the match command
// this command will match players into teams based on their elos

// self-defined helper functions
const { ApplicationCommandOptionType } = require('discord.js');
const { reply_and_react } = require('../../helper_functions/comm_helper.js');
const { matchMaker } = require('../../helper_functions/match_helper.js');

// global consts needed for this function
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


        // extract number of players
        const num_players = interaction.options.getInteger('num_players');

        console.log(`match: sending reaction prompt/reply for ${num_players} players...`);

        // very error prone, so using try/catch in case
        try {
            // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
            const repl = await reply_and_react(interaction, `Please react :white_check_mark: if you wish to participate in the game. You have ${collection_time}s to react`, confirm_reaction);
            console.log(`match: repl sent ${repl}`);

            console.log(`match: client id is ${interaction.client.user.id}`);

            // create filter to filter reaction out later
            // only read confirmation reaction, and ignore the id of the bot
            const filter = (reaction, user) => reaction.emoji.name === confirm_reaction;
            
            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            // await ensures that we don't return before reactions complete
            // wait collected_time seconds (*1000 for ms->s) for num_players+1 (+1 for bot) reactions, for only 1 possible emoji
            repl.awaitReactions({filter, max: num_players+1, time: 3_000, errors: ['time']})
                .then(collected => {
                   
                    matchMaker(interaction, collected);
                    
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