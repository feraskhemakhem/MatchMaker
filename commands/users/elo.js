// js file for the checking elo command

// self-defined helper functions
const { ApplicationCommandOptionType } = require('discord.js');
const { getScore, updateScoreOnce } = require('../../helper_functions/db_helper.js');
const helper = require('../../helper_functions/helper.js');

module.exports = {
    // command name
	name: 'elo',
    admin: false,
    public: true,
    cooldown: 6,
    // description of command
	description: 'Reacts with user\'s elo stored in database',
    // the options for the command (subcommands)
    options: [{
        name: 'option',
        description: 'either \'get\' or \'set\' for the elo of the user',
        type: ApplicationCommandOptionType.String, // string
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
        type: ApplicationCommandOptionType.User, // user
        required: false,
    },
    {
        name: 'elo',
        description: 'elo to set to (ONLY FOR SET OPTION)',
        type: ApplicationCommandOptionType.String, // string
        require: false,
        choices: helper.getEloChoices(),
    }],

    // actual command code
	async execute(interaction, client) {

        // set user value if 'user' option provided (otherwise default to person calling elo)
        let user;
        if ((user = interaction.options.getUser('user')) === null) {
            user = interaction.user;
        }
        const user_id = user.id;

        const user_option = interaction.options.getString('option');
        console.log(`/elo command is ${user_option} by ${interaction.user.username} for ${user.username}`);

        // if get, return elo of the user from database
        if (user_option === 'get') {

            // if rank doesnt exists, throw error and react accordingly
            let score;
            if ((score = getScore(user_id)) === undefined) {
                console.log(`invalid user elo for user ${user.username}`);
                interaction.reply(`Error: ${user} has no recorded elo. Set ${user}'s elo before before trying to get it`);
                return undefined;
            }

            // obtain the elo of the player and reply that elo (or error)
            let elo;
            if ((elo = helper.scoreToElo(score)) === undefined) {
                // this error should never happen - previous error checking should resolve this
                interaction.reply(`Error: this is an unexpected error 🤔 please contact ${client.my_maker} with ERRONO 1, and set ${user}'s elo again`);
                return undefined;
            }
            interaction.reply(elo);
        }
        // if set, change value of user (unless attempting to change someone else's rank and not admin)
        else if (user_option === 'set') {

            // if trying to set id of someone else and not admin, deny
            if (user_id !== interaction.user.id
                && !interaction.memberPermissions.has('ADMINISTRATOR')) return;

            // ensure that elo is provided
            let elo;
            if ((elo = interaction.options.getString('elo')) === null) {
                interaction.reply('Error: Elo is required for set function');
                return undefined;
            }

            // calculate the score based on the elo provided
            let score;
            if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
                interaction.reply('Error: invalid elo obtained, so cannot process. Please try again');
                return undefined;
            }

            // add data to temp database
            updateScoreOnce(user_id, score);
            interaction.reply(`updating ${user}'s rank to ${elo}`);
        }
    },
};