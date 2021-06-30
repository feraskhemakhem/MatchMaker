// js file for the setting player elo by username

// self-defined helper functions
const helper = require('../../helper_functions/helper.js');

module.exports = {
    // command name
	name: 'setuserelo',
    args: 2,
    admin: true,
    usage: '<@user> <elo>',
    // description of command
	description: '!Sets the elo of <@user> to <elo>. <elo> is a string which supports capitalisation and lowercase (e.g. \'/setuserelo @cherry_blossom gold\')',

    // actual command code
	async execute(message, args, data) {

        const _user = message?.mentions?.users?.first();

        const elo = args[1].charAt(0).toUpperCase() + args[1].slice(1); // make first letter uppercase of first arg

        console.log(`registering new elo ${elo} for user ${_user}`);
        
        // calculate the score based on the elo provided
        let score;
        if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
            message.reply(`Error: problem processing this rank. Please follow the format: \"/setuserelo ${this.usage}\"`);
            return undefined;
        }

        // add data to temp database
        data.player_elos[_user.id] = score;

        // send message to confirm score value
        message.reply(`${_user.username}'s rank was registered`);
        return data;
    },
};