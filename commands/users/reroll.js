// js file for the reroll match command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'reroll',
    args: 0,
    admin: false,
    public: true,
    cooldown: 60,
    usage: '',
    // description of command
	description: 'Reattempts matchmaking with the same players as the last /match pool. For example, if teams are made with 8 set people, !reroll will make new teams with those exact same people',

    // actual command code
	async execute(message, args, data) {
        if (Object.entries(data.cached_players).length === 0) { // check if cached team is empty
            message.reply('No player lists cached. Please use \"/match <player count>\" instead');
            return;
        }

        // use ids from cached players to look up scores
        const ids = Array.from(data.cached_players);
        let player_vals = {};
        ids.forEach(id => {
            if (data.player_elos[id]) { // if info exists, use that
                player_vals[id] = data.player_elos[id];
            }
            else { // if elo isnt stored, use any negative number
                player_vals[id] = -69;
            }
        });

        // make the teams
        if (!helper.makeTeams(player_vals, message, message.client, data.stdev_ratio)) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
        }
        return undefined;
    },
};