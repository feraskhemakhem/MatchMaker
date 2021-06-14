// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)


// includes

// consts
const Discord = require('discord.js');
const commands = require('./commands.js');
const { debug } = require('request');

const client = new Discord.Client();

// temp const for testing
const random_dict = {
    'jeff' : 9,
    'maddie' : 3,
    'cherry' : 9,
    'jesus' : 7,
    'damon' : 1,
    'max' : 15,
    'andrew' : 6,
    'tammi' : 7,
};

 
// constantly running callback for when a message is sent
client.on('message', async message => {
    if (message.content.startsWith('!match')) {

        // extract number of players
        var digits = /\d+/;
        var num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (num_players < 0 || isNaN(num_players)) {
            await message.channel.send('Only non-negative numbers allowed');
            return;
        }
        console.log(num_players);

        let ids = [];

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const reply = await message.channel.send('x.Please react :white_check_mark: if you wish to participate in the game');
            await reply.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅';
            };

            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            reply.awaitReactions(filter, { max: num_players, time: 10000, errors: ['time'] }) // waiting 1 minute for 1 responses
                .then(collected => {
                    message.channel.send('x.Responses recorded...');

                    // extract IDs of reactors
                    ids = Array.from(collected.values());
                    ids = Array.from(ids[0].users.keys());

                    message.channel.send('x.Polling is complete. Making teams...');

                    // make the teams
                    // findTeams(ids, random_dict);

                    // print ids at discord users
                    // message.channel.send('x.Team1:');

                })
                .catch(collected => { 
            	console.log(`x.After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log('x.error replying and reacting');
        }


        // look up elos based on ids and store in temp array for calculation
        // for now, just hard code I guess?
        


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
                await message.channel.send('Only valid ranks are allowed');
                return;
        }

        // now consider number for elo
        score *= 3;
        score += elo_number;

        // TODO: add entry with user key and score to server

        // send message to confirm score value
        await message.channel.send('your score is ' + score);
    }

    else if (message.content.startsWith('!reroll')) { // in case we don't like the teams, we can reroll
        let are_teams_made = commands.makeTeams(random_dict, message);
        if (!are_teams_made) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
        }
    }

});




 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret
