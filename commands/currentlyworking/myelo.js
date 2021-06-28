// js file for the match command

module.exports = {
    // command name
	name: 'myelo',
    // description of command
	description: 'Reacts with user\'s elo stored in database',

    // actual command code
	execute(message, args) {
        console.log(`!myelo by ${message.author.id}`);
        if (!random_dict[message.author.id]) { // if rank doesnt exists, print it

            message.react('🚫');
            return;
        }
        // find the emoji we want given guild and elo
        const emoji = await helper.findValorantEmoji(helper.scoreToElo(random_dict[message.author.id]), message.guild);

        // otherwise, calculate rank and react with an emoji for that rank
        message.react(emoji);
    },
};