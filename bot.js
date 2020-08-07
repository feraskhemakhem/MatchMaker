// IDEA:  add functionality to read names from a discord voice chat instead of waiting for reactions
// consts

const Discord = require('discord.js');
const { debug } = require('request');

const client = new Discord.Client();

const filter = (reaction, user) => {
	return reaction.emoji.name === '🇾' && user.id === message.author.id;
};
 
// actual code

client.on('message', async message => {
    if (message.content === '!react') {
        // message.react('👍');

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const reply = await message.channel.send('Please react :regional_indicator_y: if you wish to participate in the game');
            await reply.react('🇾');
        } catch (error) {
            debug.log('error replying and reacting');
        }

        // survey.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
        // .then(message.channel.send('Max capacity reached. Developing teams.'))
        // .catch(collected => {
        // 	console.log(`After a minute, only ${collected.size} out of 1 reacted.`);
        // });
    }
});




 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret