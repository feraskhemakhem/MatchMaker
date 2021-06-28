// js file for the match command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'setelo',
    // description of command
	description: 'Sets the elo of user to <elo>. <elo> is a string which supports capitalisation and lowercase (e.g. \'/setelo Radiant\')',

    // actual command code
	async execute(message, args, data) {
        if (args.length !== 1) {
            message.reply('Error: incorrect number of arguments. Please use the following format: \'/setelo <elo>\'');
            return undefined;
        }

        let user_id = message.author.id;
        let elo = args[0].charAt(0).toUpperCase() + args[0].slice(1); // make first letter uppercase of first arg

        console.log(`registering new elo ${elo} for user ${user_id}`);
        
        // calculate the score based on the elo provided
        let score = 1;
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