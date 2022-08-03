// https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js
// helper file for emoji, setup, and elo functions

/****************************** CONSTS ******************************/

const { AttachmentBuilder, EmbedBuilder } = require('discord.js'); // discord api reference
const mm_mulan = new AttachmentBuilder('./assets/matchmakermulan.jpg'); // for hosting mulan image

// just some puns
const puns = ['It was a match made in heaven', 'we make matches, not lighters', 'the match of the century'];
const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];

// important formatting decisions
const emoji_prefix = 'MMValorant';


/****************************** FUNCTIONS ******************************/

module.exports = {
    // function for getting valorant rank emoji for specific elo
    // parameters: guild reference (server), string of elo
    // prints: N/A
    // returns: guild emoji for associated rank in the server
    findValorantEmoji: async function(elo, guild) {
        // CHECK IF GUILD IS AVAILABLE FIRST
        if (!guild.available) return null;

        // find emoji in guild cache
        let valorant_emojis = guild.emojis.cache.filter(emoji => emoji.name.startsWith(`${emoji_prefix}${elo}`));
        valorant_emojis = Array.from(valorant_emojis.values());

        // collect emoji names
        let emoji_names = [];
        valorant_emojis.forEach(element => emoji_names.push(element.name));
        
        // if emoji not found, then add it before returning
        if (emoji_names.indexOf(`${emoji_prefix}${elo}`) === -1) { 
            new_emoji = await guild.emojis.create({attachment:`./assets/Valorant${elo}.webp`, name:`${emoji_prefix}${elo}`, reason:'For use with the MatchMaker bot'});
        }
        // return emoji
        return new_emoji;
    },
    // function for processing elo reaction in !setup message
    // parameters: reaction reference, user that reacted
    // prints: N/A
    // returns: score of valorant rank reactions
    processEloReaction: function(reaction, user) {
        // register player at given elo
        let elo = 'no rank found';
        
        // look through each rank and find one rank in reaction name
        ranks.forEach(rank => {
            // if found, set elo to it and break loop
            if (reaction.emoji.name.indexOf(rank) !== -1) {
                elo = rank;
            } 
        });

        // calculate score from elo
        let score = this.eloToScore(elo);

        console.log(`Elo is ${elo} with score if ${score}`);

        // finally, remove reaction
        // messagereaction -> reaction user manager -> remove()
        reaction.users.remove(user);

        return score;

    },
    // function for determining whether emoji is a valorant rank emoji or not
    // parameters: string of reaction name
    // prints: N/A
    // returns: bool of whether reaction is a valorant rank emoji
    isValorantEmoji: function(reaction_name) {
        // check if any name starts with "Valorant(rank)"
        return ranks.some(rank => reaction_name.startsWith(`${emoji_prefix}${rank}`)); // apparently for each doesnt work but this is cleaner
    },
    // function for parsing !setup command and sending setup message
    // parameters: original !setup message, default text if no text is given
    // prints: setup message in requested channel
    // returns: setup message, or undefined if failed
    setup: async function(message, defaultText) {

        // if guild unavailable, no point in trying
        if (!message.guild.available) return undefined;

        // some string parsing for reading the message content
        let first_space;
        if ((first_space = message.content.indexOf(' ')) === -1) { // if first space not found
            message.channel.send('Please follow the format: \"/setup <channel> <message>\"');
            return undefined;
        }

        let message_for_users;
        let second_space;
        let target_channel_name;
        if ((second_space = message.content.indexOf(' ', first_space+1)) === -1) { // if no second space, use default message
            message_for_users = defaultText;
            target_channel_name = message.content.substring(first_space + 1);
        }
        else { // if second space, use that message
            target_channel_name = message.content.substring(first_space + 1, second_space);
            message_for_users = message.content.substring(second_space + 1).trim(); // also trim extra spaces around :)
            // if quotes around message, remove them
            if (message_for_users.charAt(0) === '\"' && message_for_users.slice(-1) === '\"') {
                message_for_users = message_for_users.substring(1, message_for_users.length - 1);
            }
        }

        // parse channel string to clean it up
        let target_channel;
        if (target_channel_name.startsWith('<#')) { // if a tagged channel highlighted, remove <# and >
            target_channel_name = target_channel_name.substring(2, target_channel_name.length - 1); 
            console.log(`modified channel name is ${target_channel_name}`);
            target_channel = message.guild.channels.cache.get(target_channel_name);
        }
        else if (target_channel_name.startsWith('#')) { // if with a tag but not highlighted, just remove tag
            target_channel_name = target_channel_name.substring(1);
            target_channel = message.guild.channels.cache.find(channel => channel.name === target_channel_name);

            // if not highlighted, make sure it exists
            if (!target_channel) {
                message.channel.send('Error: Invalid channel name');
                return undefined;
            }
        }
        else { // if just a string
            // https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/frequently-asked-questions.md
            target_channel = message.guild.channels.cache.find(channel => channel.name === target_channel_name);
            if (!target_channel) {
                message.channel.send('Error: Invalid channel name');
                return undefined;
            }
        }
        console.log(`channel name is ${target_channel_name}, and message is "${message_for_users}".`);

        // send message
        return await target_channel.send(message_for_users);
    },
    // function for calculating string elo of player based on score
    // parameters: numeric score of player
    // prints: N/A
    // returns: string of elo based on score
    scoreToElo: function(score) {
        if (score < 0 || score > 8) { // outside boundary
            console.log(`out of bounds score is ${score}`);
            return undefined;
        }
        return ranks[score];
    },
    // function for calculating numeric score of player based on elo
    // parameters: string of elo
    // prints: N/A
    // returns: numeric score of provided elo
    eloToScore: function(elo) {
        // small error checking
        if (elo === -1) { // this occurs when elo isnt given
            /*message.channel.send('Please follow the format: \"!setelo <rank bracket> <subrank number>'); */
            console.log(`Elo isn's given?... : ${elo}`);
            return -1;
        }

        // get score from array and return
        return ranks.indexOf(elo);
    },
    // function for printing teams using embed message
    // parameters: channel reference for sending
    // prints: teamsi in embed message
    // returns: N/A
    printTeams: async function(user_requesting, t1_string, t2_string, team_ad_string, channel) {
        team_ad_string = team_ad_string + '\n\u200B';
        // print teams in an embedded message
        // https://stackoverflow.com/questions/49334420/discord-js-embedded-message-multiple-line-value
        const teams_embed = await this.templateEmbed();

        teams_embed
        .setFooter({ text: puns[Math.floor(Math.random() * puns.length)] })  // add a little pun at the bottom
        .setTitle(`${user_requesting}'s Match is Made!`)
        .addFields(
            {name: 'Team 1', value: `${t1_string}`, inline: true},
            {name: '\u200B', value: '\u200B', inline: true},
            {name: 'Team 2', value: `${t2_string}`, inline: true},
            {name: '\u200B', value: '\u200B'},
            {name: 'Advantage', value: team_ad_string},
        );

        const content_string = 'Here are the teams!';

        channel.send({content: content_string, embeds: [teams_embed], files: [mm_mulan]});
    },
    // function for creating initial template for embed messages
    // parameters: discord reference
    // prints: N/A
    // returns: reference to embed message
    templateEmbed: async function() {
        // template embed for all MatchMaker messages
        // https://discordjs.guide/popular-topics/embeds.html#attaching-images-2
        return commands_embed = await new EmbedBuilder()
            .setColor('#ffb7c5') // cherry blossom pink
            .setAuthor({name: 'MatchMaker Bot', iconURL: 'attachment://matchmakermulan.jpg', url: 'https://www.youtube.com/watch?v=fO263dPKqns'}) // link to 2nd best mulan song :)
            .setTimestamp(); // to distinguish between embeds

    },
    // function for calculating the optimal teams
    // parameters: collection of users with (user_id : user object) pairs, objects containing pairs of player ids and ranks (strings : Integers), message reference for replying, standard deviation ratio to accept team
    // prints: teams
    // returns: bool for success
    makeTeams: function(users, player_data, interaction, stdev_ratio) {

        // error checking: if either users or player_data is less than 2 (need at least 2 to make a team)
        if (users.size < 2 || Object.keys(player_data).length < 2) {
            interaction.channel.send(`Error: Not enough players. Please try again with more players`);
            return false;
        }

        // step 0: create initial team lists
        // NOTE: ASSUMING ONLY 2 TEAMS
        let player_ids = Object.keys(player_data);
        let t1 = [];
        let t2 = [];
        let curr_team_scores = [];

        // step 1: calculate the average player score ("aps") and stdev
        let num_players = Object.keys(player_data).length;
        let team_size = num_players / 2;

        // 1i. calculate average player score ("aps")
        let aps = 0;
        for (let key in player_data) {
            if (player_data[key] < 0) { // if unranked, disclude from average and give its value the average
                num_players = num_players - 1;
            }
            else {
                aps = aps + player_data[key];
            }
        }
        aps = aps / num_players;

        // in the edge case that all are unranked, set aps to 0
        if (num_players === 0) {
            aps = 0;
        }

        num_players = Object.keys(player_data).length; // set num players back to what it was before

        // set unranked players' values to average (aps)
        for (let key in player_data) {
            if (player_data[key] < 0) {
                player_data[key] = aps;
            }
        }

        // print average player score for debugging
        console.log(`aps is ${aps}`);
        console.log(`players are ${JSON.stringify(player_data)}`);

        // 1ii. calculate stdev
        let stdev = 0;
        for (let key in player_data) {
            stdev = stdev + Math.pow(player_data[key] - aps, 2);
        }
        stdev = stdev / num_players;
        stdev = Math.sqrt(stdev);

        console.log(`stdev is ${stdev}`);

        /************* redo all steps starting here if step 4 fails **************/
        let bad_teams = false; // whether the teams are bad or not
        let num_failures = 0; // number of failures
        do {
            bad_teams = false;
            // if we fail to make teams at least 10 times, give up
            if (num_failures >= 10) {
                // send a failure message if cannot make teams
                interaction.channel.send('Unable to make teams with these players given their elos. Sorry :(');
                return false;
            }

            // reset the variables every time it fails
            curr_team_scores = [];
            t1 = [];
            t2 = [];
            let remaining_players = JSON.parse(JSON.stringify(player_data)); // TODO: use lodash to improve?

            // step 2: choose first player for each team ("seeds")
            let first_player = Math.floor(Math.random() * num_players);
            let second_player = Math.floor(Math.random() * num_players);

            // to avoid ties // TODO: get the keys, not the indicies
            if (first_player === second_player) {
                second_player = (second_player + 1) % num_players;
            }

            t1.push(player_ids[first_player]);
            t2.push(player_ids[second_player]);

            // remove from list of contenders
            delete remaining_players[player_ids[first_player]];
            delete remaining_players[player_ids[second_player]];
            
            // for each team
            for (let t = 0; t < 2; t++) {
                
                // step 3: choose players for each team
                let curr_team_score = 0;
                if (t === 0) { // set initial score based on score of first player
                    curr_team_score = player_data[t1[0]];
                }
                else {
                    curr_team_score = player_data[t2[0]];                    
                }
                for (let i = 2; i <= team_size; i++) {
                    
                    // 3i. find target score to reach this iteration
                    let target_score = aps * i;

                    // 3ii. calculate ideal player score for this iteration
                    let ideal_player_score = target_score - curr_team_score;

                    // 3iii. find existing player with value closest to ideal player score
                    // TODO: IT MIGHT BE OPTIMAL IN THE FUTURE TO DETERMINE IF SAME DISTANCE ABOVE OR BELOW
                    // IS BETTER. MAYBE DEPENDENT ON WHETHER THE TEAM HAS BETTER PLAYERS OVERALL OR NOT?
                    let closest_id = "";
                    let closest_distance = 10000;
                    for (let id in remaining_players) {
                        let player_distance = Math.abs(ideal_player_score - remaining_players[id]);
                        if (player_distance < closest_distance) {
                            closest_id = id;
                            closest_distance = player_distance;
                        }
                    }

                    // iv. add player to team and update player sum
                    if (t === 0) {
                        t1.push(closest_id);
                    }
                    else {
                        t2.push(closest_id);
                    }

                    curr_team_score = curr_team_score + remaining_players[closest_id];
                    delete remaining_players[closest_id];
                }

                // step 4: if team score is more than (stdev_ratio * stdev) from average, restart algorithm
                if (Math.abs(curr_team_score - (aps * team_size)) > stdev * stdev_ratio) {
                    bad_teams = true;
                    num_failures++;
                    continue;
                }
                curr_team_scores.push(curr_team_score);
            }

        } while (bad_teams);
        /****************************** TEAMS ARE MADE ******************************/
        console.log(`Team totals are ${curr_team_scores[0]} and ${curr_team_scores[1]}, respectively`);
        
        // step 5: determine advantage score based on team score and report
        let team_diff = Math.abs(curr_team_scores[0] - curr_team_scores[1]);
        let team_advantage = curr_team_scores[0] > curr_team_scores[1] ? 1 : 2; // advantage based on which team has higher score (if equal, 2, but it doesn't matter)
        let team_ad_string = '';
        if (team_diff === 0) { // if no diff, equal
            team_ad_string = 'Teams are perfectly balanced, as all things should be';
        }
        else if (team_diff <= 1.3) { // if team diff is small, mention it
            team_ad_string = `Team ${team_advantage} has a slight advantage`;
        }
        else if (team_diff > 1.3) { // if team diff is big, mention it
            team_ad_string = `Team ${team_advantage} has a large advantage`;
        }
        else { // team_diff should never be negative because we use abs
            interaction.channel.send(`Error: Unexpected behaviour on our end. Please try again and contact ${interaction.client.my_maker} with ERRORNO 4`);
            return false;
        }

        // collect users into string for printing from their ids
        // https://stackoverflow.com/questions/63069415/discord-js-how-to-get-a-discord-username-from-a-user-id
        // users -> collection of users
        // users.get(user_id) -> user instance (.username to get username)
        let t1_string = '';
        t1.forEach(user_id => {
            let person = users.get(user_id);
            if (person === undefined) {
                interaction.channel.send(`Error: One or more players have not been in the server for long enough. Please try again at a later time when the player is cached as a server member`);
                return false;
            }
            console.log(`makeTeams: person in t1 is: ${person.username}`);
            t1_string = t1_string + '\n' + person.username;
        });

        let t2_string = '';
        t2.forEach(user_id => {
            let person = users.get(user_id);
            if (person === undefined) {
                interaction.channel.send(`Error: One or more players have not been in the server for long enough. Please try again at a later time when the player is cached as a server member`);
                return false;
            }
            console.log(`makeTeams: person in t2 is: ${person.username}`);
            t2_string = t2_string + '\n' + person.username;
        });

        // print results
        this.printTeams(interaction.user.username, t1_string, t2_string, team_ad_string, interaction.channel);

        return true; // if you've made it this far, you're either really sneaky or just a valid entry
    },
    // function for getting option choices for elos
    // parameters: N/A
    // prints: N/A
    // returns: choices for the elo option
    getEloChoices: function() {

        choices = [];
        // add each rank to choices array
        for (const rank of ranks) {
            choices.push({name: rank, value: rank});
        }

        return choices;
    }
};