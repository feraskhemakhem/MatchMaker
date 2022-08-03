// https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js
// helper file for emoji, setup, and elo functions

/****************************** CONSTS ******************************/

// self-defined helper functions
const { readData, updateCachedPlayers } = require('./helper_functions/db_helper.js');
const { reply, reactPost } = require('./helper_functions/comm_helper.js');
const helper = require('./helper_functions/helper.js');


/****************************** FUNCTIONS ******************************/

module.exports = {
    // function for creating teams/matchmaking
    // parameters: interaction
    // prints: guiding prints
    // returns: nothing
    matchMaker: async function(arr_players) {
        
    }
};