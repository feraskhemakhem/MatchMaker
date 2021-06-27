// js file for the match command

module.exports = {
    // command name
	name: 'match',
    // description of command
	description: 'Ping!',

    // actual command code
	execute(message, args) {
        const first_space = message.content.indexOf(' ');
        const second_space = message.content.indexOf(' ', first_space+1);

        let user_id = message.author.id;
        let elo;

        if (second_space === -1) {
            elo = message.content.substring(first_space + 1);
        }
        else if (message.member.hasPermission('ADMINISTRATOR')) { // if requesting to change another user as an admin
            elo = message.content.substring(first_space + 1, second_space);
            if (!message.mentions.users.size) { 
                message.reply('If you want to change a user\'s elo, follow the format: !setelo <elo> <@user>');
            }
            // get first person mentioned in message
            user_id = message.mentions.users.first();
        }
        else {
            message.reply('You do not have the permissions to change their rank');
            return;
        }
        console.log(`registering new elo for ${user_id}`);
        
        // calculate the score based on the elo provided
        elo = elo.charAt(0).toUpperCase() + elo.slice(1); // make first letter uppercase

        let score;
        if ((score = helper.eloToScore(elo)) === -1) { // if -1, then error, so return
            message.reply('Error: problem processing this rank');
            return;
        }

        // TODO: add entry with user key and score to server
        random_dict[user_id] = score;

        // send message to confirm score value
        message.reply(`your rank was registered`);
    },
};