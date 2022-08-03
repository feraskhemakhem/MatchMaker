// https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js
// helper file for emoji, setup, and elo functions

/****************************** CONSTS ******************************/

// self-defined helper functions
const { getScore } = require('./db_helper.js');
const helper = require('./helper.js');


/****************************** FUNCTIONS ******************************/

module.exports = {
    // function for creating teams/matchmaking and sending an embed message of created teams
    // parameters: interaction, collection of ( string|snowflake : messageReaction objects)
    // prints: guiding prints
    // returns: nothing
    matchMaker: async function(interaction, collected) {

        // extract IDs of reactors
        // KEY IS THE EMOJI
        // https://discord.js.org/#/docs/main/stable/class/MessageReaction
        // https://discord.js.org/#/docs/main/stable/class/ReactionUserManager

        // get the first reaction (the checkmark)
        // users_coll -> collection of (user_id : user object)
        // ids -> array of all user_id's
        const users_coll = collected.first().users.cache;
        const ids_arr = Array.from(collected.first().users.cache.keys());

        console.log(`matchMaker: initial lists are ${users_coll.toJSON()} and ${ids_arr}`);

        // if bot id is in the lists, remove from both (assumes order is the same in both lists)
        let bot_id;
        if ((bot_id = ids_arr.indexOf(interaction.client.user.id)) !== -1) {
            ids_arr.splice(bot_id, 1);
        }

        console.log(`matchMaker: final lists are ${users_coll.toJSON()} and ${ids_arr}`);

        // send a message saying polling has closed
        interaction.channel.send('Polling has closed. Making teams...');
        console.log(`matchMaker: polling closed`);


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

        console.log(`matchMaker: elos are ${JSON.stringify(elos)}`);


        // make the teams
        // if teams can't be made, let them know
        // returns false if error btw
        helper.makeTeams(users_coll, elos, interaction, 10);

        // cache last set of players used
        // updateCachedPlayers(ids);

    }
};