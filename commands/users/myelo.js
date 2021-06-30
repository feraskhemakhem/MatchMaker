// js file for the checking elo command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'myelo',
    args: 0,
    admin: false,
    public: true,
    usage: '',
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
        const emoji = await helper.findValorantEmoji(helper.scoreToElo(data.player_elos[message.author.id]), message.guild);

        // otherwise, calculate rank and react with an emoji for that rank
        message.react(emoji);

        return undefined;
    },
};