// IDEAs:  - add functionality to read names from a discord voice chat instead of waiting for reactions
//         - add option to move people to given channels (automatically move to Val and Val2)
//         - make setting elo reaction-based

// Next:
// - (DONE) Tweak the UI for displaying (esp advantage). it doesnt feel full enough... find more stuff to put idk
// - (DONE) Dont let people make matches with 1 or less people (eventually i guess?)
// - Look into SQL Lite and see if it's worth it for this scope
// - Look into making elo-setting reaction-based
// - (DONE) Alter team-making algorithm to treat unrated as the average
// - Add option for teams to be totally random instead of rank-based (e.g. '-unranked')
// - Add option in setup to check tags instead of checking server
// - Add "!help" or "!commands" to let people know the available commands

// consts
const Discord = require('discord.js');
const commands = require('./commands.js');
const dotenv = require('dotenv');
const client = new Discord.Client();

//https://coderrocketfuel.com/article/how-to-load-environment-variables-from-a-.env-file-in-nodejs
dotenv.config();

// temp const for testing
const random_dict = {};

// cached last players (only caches 1 team across all servers - would have to add to database for multiserver use)
let cached_players = {};

const debug = true; // BOOLEAN FOR DEBUGGING :DD

// ON CREATION, PUT A MESSAGE IN THE SERVER ASKING FOR RANKS
client.on('ready', () => {
    console.log(`I'm ready!`);
});

// client.on('raw', console.log);// just for seeing how raw works
 
// constantly running callback for when a message is sent
client.on('message', async message => {
    if (message.content.startsWith('!match')) {

        // extract number of players
        let digits = /\d+/;
        let num_players = parseInt(message.content.match(digits));

        // small error checking for number of players
        if (isNaN(num_players)) {
            message.channel.send('Please follow the format: \"!match <number of players>\"');
            return;
        }
        if (!debug) {
            if (num_players < 2) {
                message.channel.send('At least 2 people required to make a match');
                return;
            }
        }

        let ids = [];

        // using await (https://discordjs.guide/additional-info/async-await.html#execution-with-discord-js-code)
        try {
            const reply = await message.channel.send('Please react :white_check_mark: if you wish to participate in the game');
            await reply.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅';
            };

            // structure inspired by https://stackoverflow.com/questions/50058056/how-to-use-awaitreactions-in-guildmemberadd
            reply.awaitReactions(filter, { max: num_players, time: 60000, errors: ['time'] }) // waiting 1 minute for 1 responses
                .then(collected => {
                    console.log('Responses recorded...');

                    // extract IDs of reactors
                    // KEY IS THE EMOJI
                    // https://discord.js.org/#/docs/main/stable/class/MessageReaction
                    // https://discord.js.org/#/docs/main/stable/class/ReactionUserManager
                    let temp_count = collected.first().count;
                    ids = Array.from(collected.first().users.cache.firstKey(temp_count)); // apparently i need all of this for ids

                    // if bot's ID exists in list, remove (commented out when debugging)
                    if (!debug) {
                        let index_of_my_id;
                        if ((index_of_my_id = ids.indexOf(client.user.id)) !== -1) {
                            ids.splice(index_of_my_id, 1);
                        }
                    }

                    message.channel.send('Polling has closed. Making teams...');


                    // find these ids in the list and make a dictionary of their elos
                    let elos = {};
                    ids.forEach(element => {
                        if (random_dict[element]) {
                            elos[element] = random_dict[element];
                        }
                        else { // if rank is not found, set to unranked
                            elos[element] = -30;
                            random_dict[element] = -30;
                        }
                    });

                    console.log(`elos are: ${JSON.stringify(elos)}`);


                    // make the teams
                    if (!commands.makeTeams(elos, message, client)) { // if teams aren't made, let them know
                        message.channel.send('Unable to make teams with these players. Sorry :(');
                    }

                    // cache last set of players used
                    cached_players = elos;
                })
                .catch(collected => { 
                message.channel.send('Polling has closed. Not enough people have chosen to participate.');
            	console.log(`Collected is ${collected}. After a minute, only ${collected.size} out of ${num_players} reacted.`);
            });
        } catch (error) {
            console.log('error replying and reacting');
        }        

    }
    // set the elo of yourself
    // WARNING: THIS ONLY WORKS FOR VALORANT RN
    else if (message.content.startsWith('!setelo')) {

        console.log('registering new elo');
        
        // calculate the score based on the elo provided
        let score;
        if ((score = commands.eloToScore(message)) === -1) { // if -1, then error, so return
            return;
        }

        // TODO: add entry with user key and score to server
        random_dict[message.author.id] = score;

        // send message to confirm score value
        await message.channel.send(`your rank was registered`);
    }

    else if (message.content.startsWith('!reroll')) { // in case we don't like the teams, we can reroll
        if (Object.entries(cached_players).length === 0) { // check if cached team is empty
            message.channel.send('No player lists cached. Please use \"!match <player count>" instead');
            return;
        }
        if (!commands.makeTeams(cached_players, message, client)) { // if teams aren't made, let them know
            message.channel.send('Unable to make teams with these players. Sorry :(');
            return;
        }
    }
    
    else if (message.content === '!v') { // prints the version of matchmaker
        message.channel.send('MatchMaker v1.3');
    }

    else if (message.content === '!ping') { // just something for testing
        commands.printTeams(message, `t1`, `t2`, `no ad`);

        // message.channel.send(message.member.hasPermission('ADMINISTRATOR'));

        // message.channel.send(message.author.id);

        // let emoji = message.guild.emojis.cache.get('856342795341922335');
        // message.channel.send(`${emoji.id} id, ${emoji.identifier} identifier, ${emoji.name} name, ${emoji.url} url`);

        // let emojis = message.guild.emojis.cache.filter(emoji => emoji.name.startsWith('match'));
        // emojis = Array.from(emojis.values());
        // console.log(`emojis: ${emojis}`);

        // let emoji_names = [];
        // emojis.forEach(element => emoji_names.push(element.name));

        // console.log(`emoji names: ${emoji_names}`);

        // let ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];
        // ranks.pop();
        // message.channel.send(typeof(ranks));
        // let word = 'stinky';
        // message.guild.emojis.create('https://i.pinimg.com/originals/75/ab/5f/75ab5f38995a03bc9559d0210e6efc25.jpg', `uhoh${word}`, {reason:'For use with the MatchMaker bot'})
        // .then(emoji => {
        //     message.react(emoji);
        //     console.log(JSON.stringify(emoji));
        //     let new_message = message.channel.send(`howdy :D`);
        //     new_message.then(nm => nm.react(emoji));
        // })
        // .catch(console.error);
        // console.log(`ping done`);

    //     let word = 'Iron';
    //     message.guild.emojis.create('./valorantRankIcons/ValorantIron.webp', `Valorant${word}`, {reason:'For use with the MatchMaker bot'})
    //     .then(emoji => {
    //         message.react(emoji);
    //         console.log(JSON.stringify(emoji));
    //    })
    //     .catch(console.error);
    }

    else if (message.content === '!myelo') { // prints elo if user
        if (random_dict[message.author.id]) { // if rank exists, print it
            message.channel.send(`Your elo is ${random_dict[message.author.id]}`);
        }
        else { // otherwise indicate that rank doesnt exist
            message.channel.send(`No elo is recorded under your username`);
        }
    }

    else if (message.content.startsWith('!setup') && // https://discord.js.org/#/docs/main/stable/class/Permissions
        message.member.hasPermission('ADMINISTRATOR')) { // set up reactions for assigning elos to players

        if (!message.guild.available) {
            console.log(`Guild not available for setup`);
            return;
        }

        let default_text = 'Please choose your rank by selecting the reaction that corresponds to it. If you want to unselect a rank, click the same rank again';
        let setup_message;
        if (!(setup_message = commands.setup(message, default_text))) {
            console.log(`!setup failure`);
            return;
        }

        console.log(`setup message type is ${JSON.stringify(setup_message)}`);

        // if reactions do not exist, add them to server
        // first, get a list of emojis with 'Valorant(rank)' names
        let valorant_emojis = message.guild.emojis.cache.filter(emoji => emoji.name.startsWith('Valorant'));
        valorant_emojis = Array.from(valorant_emojis.values());

        // console.log(`pre-existing valorant emojis: ${valorant_emojis}`);

        let emoji_names = [];
        valorant_emojis.forEach(element => emoji_names.push(element.name));

        // console.log(`emoji names: ${emoji_names}`);

        // for each emoji that does not exist, add it to the server
        let ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];
        for (const element of ranks) { // not the best but cleanest way to ensure order and linearity
            let new_emoji;
            if (emoji_names.indexOf(`Valorant${element}1`) === -1) { // if not found, add it then react
                new_emoji = await message.guild.emojis.create(`./valorantRankIcons/Valorant${element}.webp`, `Valorant${element}`, {reason:'For use with the MatchMaker bot'});
            }
            else { // if emoji aready exists, react
                new_emoji = valorant_emojis[emoji_names.indexOf(`Valorant${element}`)];
            }
            await setup_message
            .then(value => { // promise to ensure setup complete
                value.react(new_emoji);
            })
            .catch(result => console.log(result));
         
        }

        message.channel.send(`Message sent`);
    }
    // else if (message.content === '!clear reactions') {
    //     let emojis = Array.from(message.guild.emojis.cache.values());
    //     emojis.forEach(element => {
    //         element.delete('Clearing for more testing with MatchMaker');
    //     });
    // }
});




 

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN); //BOT_TOKEN is the Client Secret