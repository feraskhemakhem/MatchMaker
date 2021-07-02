// js file for the getting elo of tagged user

// self-defined helper functions
const { readData } = require('../../helper_functions/db_helper.js');
const helper = require('../../helper_functions/helper.js');

module.exports = {
    // command name
	name: 'getelo',
    args: 0,
    admin: false,
    cooldown: 3,
    public: true,
    usage: '<@user>',
    // description of command
	description: 'Reacts with tagged <@user>\'s elo stored in database',
    options: [{
        name: 'user',
        type: 6, // user
        description: 'user you want to see elo of (self by default)',
        required: false,
    }],


    // actual command code
	async execute(message, args) {

        let user_id = message.author.id;

        // get id from username if arg is given
        if (args.length)
            user_id = message.mentions.users.first().id;

        console.log(`/getelo of ${user_id}`);

        const data = readData();

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