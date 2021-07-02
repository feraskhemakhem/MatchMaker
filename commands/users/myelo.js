// js file for the checking elo command

// self-defined helper functions
const helper = require('../../helper_functions/helper.js');

module.exports = {
    // command name
	name: 'myelo',
    args: 0,
    admin: false,
    public: true,
    cooldown: 10,
    // description of command
	description: 'Reacts with user\'s elo stored in database',

    // actual command code
	async execute(message, args, data) {
        console.log(`/myelo by ${message.author.id}`);
        if (!data.player_elos[message.author.id]) { // if rank doesnt exists, print it
            message.react('🚫');
            return;
        }
        // find the emoji we want given guild and elo
        helper.findValorantEmoji(helper.scoreToElo(data.player_elos[message.author.id]), message.guild)
        .then(emoji => message.react(emoji));

        return undefined;
    },
};