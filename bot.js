// IDEA:  add functionality to read names from a discord voice chat instead of waiting for reactions
// consts

const Discord = require('discord.js');

const client = new Discord.Client();

const filter = (reaction, user) => {
	return reaction.emoji.name === ':regional_indicator_y' && user.id === message.author.id;
};
 
// actual code

if (message.content === '!react') {
	message.react(':regional_indicator_y:');
}

message.awaitReactions(filter, { max: 10, time: 60000, errors: ['time'] }) // waiting 1 minute for 10 responses
	.then(collected => console.log(collected.size))
	.catch(collected => {
		console.log(`After a minute, only ${collected.size} out of 10 reacted.`);
	});



 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret