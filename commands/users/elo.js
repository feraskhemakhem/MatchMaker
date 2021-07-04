// js file for the checking elo command

// self-defined helper functions
const { readData, updateEloOnce } = require('../../helper_functions/db_helper.js');
const helper = require('../../helper_functions/helper.js');

module.exports = {
    // command name
	name: 'elo',
    admin: false,
    public: true,
    cooldown: 10,
    // description of command
	description: 'Reacts with user\'s elo stored in database',
    options: [{
        name: 'option',
        description: 'either \'get\' or \'set\' for the elo of the user',
        type: 3, // string
        choices: [
            {
                name: 'set',
                value: 'set',
            },
            {
                name: 'get',
                value: 'get',
            }
        ],
        required: true,
    },
    {
        name: 'user',
        description: 'the user at hand (default is self)',
        type: 6, // user
        required: false,
    },
    {
        name: 'elo',
        description: 'elo to set to if set is true',
        type: 3, // string
        require: false,
        choices: helper.getEloChoices(),
    }],

    // actual command code
	async execute(message, args) {

        // set user value based on arg 2 (user)
        let user_id = message.author.id;
        if (args.length === 2)
            user_id = message.mentions.users.first().id;

        console.log(`/command is ${args[0]} by ${user_id}`);

        // if get, return value of user
        if (args[0] === 'get') {
            const data = readData();

            if (!data.player_elos[user_id]) { // if rank doesnt exists, print it
                console.log(`elo is ${data.player_elos[user_id]}`);
                message.react('🚫');
                return;
            }
            // find the emoji we want given guild and elo
            helper.findValorantEmoji(helper.scoreToElo(data.player_elos[user_id]), message.guild)
            .then(emoji => message.react(emoji));
        }
        // if set, change value of user (unless user is someone else and not admin)
        else if (args[0] === 'set') {
            // if trying to set id of someone else and not admin, deny
            if (user_id !== message.author.id
                && message.member.hasPermission('ADMINISTRATOR')) return;

            if (args.length < 3) {
                message.reply('Elo is required for set function');
                return;
            }
            const elo = args[2].charAt(0).toUpperCase() + args[2].slice(1); // make first letter uppercase of first arg

            // calculate the score based on the elo provided
            let score;
            if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
                message.reply('Error: problem processing this rank');
                return undefined;
            }

            // add data to temp database
            updateEloOnce(user_id, score);
            
        }
    },
};