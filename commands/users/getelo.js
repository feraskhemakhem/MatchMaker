// js file for the getting elo of tagged user

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'getelo',
    args: 1,
    admin: false,
    cooldown: 3,
    public: true,
    usage: '<@user>',
    // description of command
	description: 'Reacts with tagged <@user>\'s elo stored in database',

    // actual command code
	async execute(message, args, data) {

        // get id from username
        const user_id = message.mentions.users.first().id;

        console.log(`/getelo of ${message.mentions.users.first().username}`);

        if (!data.player_elos[user_id]) { // if rank doesnt exists, print it
            message.react('🚫');
            return;
        }
        // find the emoji we want given guild and elo
        helper.findValorantEmoji(helper.scoreToElo(data.player_elos[user_id]), message.guild)
        .then(emoji => message.react(emoji));

        return undefined;
    },
};