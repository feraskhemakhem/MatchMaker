// IDEAs:  add functionality to read names from a discord voice chat instead of waiting for reactions


// consts

const Discord = require('discord.js');
const { debug } = require('request');

const client = new Discord.Client();
 
// actual code

client.on('message', async message => {
    if (message.content.startsWith('!match')) {

        // extract number of players
        var digits = /\d+/;
        var num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (num_players < 0) {
            await message.channel.send('Only non-negative numbers allowed');
            return;
        }

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const reply = await message.channel.send('x.Please react :white_check_mark: if you wish to participate in the game');
            await reply.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅';
            };

            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            reply.awaitReactions(filter, { max: num_players, time: 10000, errors: ['time'] }) // waiting 1 minute for 1 responses
                .then(collected => console.log(collected.size))//message.channel.send('x.Max capacity reached. Developing teams.'))
                .catch(collected => {
            	console.log('x.After a minute, only ${collected.size} out of 2 reacted.');
            });
        } catch (error) {
            console.log('x.error replying and reacting');
        }

    }
    // set the elo of yourself
    // WARNING: THIS ONLY WORKS FOR VALORANT RN
    else if (message.content.startsWith('!setelo')) {

        console.log('registering new elo');
        // extract relevant info from string
        var elo = message.content.substring(message.content.indexOf(' ') + 1);
        var elo_bracket = elo.substring(0, elo.indexOf(' '));
        var elo_number = parseInt(elo.substring(elo.indexOf(' ') + 1)) || -1;


        console.log(elo, elo_bracket, elo_number);
        // small error checking
        if (elo_number < 0 || elo_number > 3) {
            await message.channel.send('Only valid inputs are allowed');
            return;
        }

        var score = 0;
        // set initial score based on bracket
        // NOTE: probably cleaner with an enum equivilent
        switch(elo_bracket) {
            case "iron":
                score = 0;
                break;
            case "bronze":
                score = 1;
                break;
            case "silver":
                score = 2;
                break;
            case "gold":
                score = 3;
                break;
            case "platinum":
            case "plat":
                score = 4;
                break;
            case "diamond":
                score = 5;
                break;
            case "immortal":
                score = 6;
                break;
            case "radiant":
                score = 7;
                break;
            case "unranked": // unranked is negative as to ignore the rank in the future
                score = -10;
                break;
            default: // if we get this far, there's an error
                await message.channel.send('Only valid inputs are allowed');
                return;
        }

        // now consider number for elo
        score *= 3;
        score += elo_number;

        await message.channel.send('your score is ' + score);
    }
});




 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret
