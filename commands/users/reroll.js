// js file for the match command

module.exports = {
    // command name
	name: 'match',
    // description of command
	description: 'Ping!',

    // actual command code
	execute(message, args) {
        if (Object.entries(cached_players).length === 0) { // check if cached team is empty
            message.reply('No player lists cached. Please use \"!match <player count>" instead');
            return;
        }
        if (!helper.makeTeams(cached_players, message, client, Discord, mm_mulan, stdev_ratio)) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
            return;
        }
    },
};