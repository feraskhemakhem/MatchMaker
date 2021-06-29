// js file for the setting elo command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'setelo',
    args: 1,
    admin: false,
    usage: '<elo>',
    // description of command
	description: 'Sets the elo of user to <elo>. <elo> is a string which supports capitalisation and lowercase (e.g. \'/setelo Radiant\')',

    // actual command code
	async execute(message, args, data) {

        const user_id = message.author.id;
        const elo = args[0].charAt(0).toUpperCase() + args[0].slice(1); // make first letter uppercase of first arg

        console.log(`registering new elo ${elo} for user ${user_id}`);
        
        // calculate the score based on the elo provided
        let score;
        if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
            message.reply('Error: problem processing this rank');
            return;
        }

        // add data to temp database
        data.player_elos[user_id] = score;

        // send message to confirm score value
        message.reply(`your rank was registered`);
        return data;
    },
};