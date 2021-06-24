// https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js


// just some puns
const puns = ['It was a match made in heaven', 'we make matches, not lighters', 'the match of the century'];
const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];


module.exports = {
    // function for getting valorant rank emoji for specific elo
    // parameters: guild reference (server), string of elo
    // prints: N/A
    // returns: guild emoji for associated rank in the server
    findValorantEmoji: async function(elo, guild) {
        let valorant_emojis = guild.emojis.cache.filter(emoji => emoji.name.startsWith(`Valorant${elo}`));
        valorant_emojis = Array.from(valorant_emojis.values());
        // console.log(valorant_emojis);
        let emoji_names = [];
        valorant_emojis.forEach(element => emoji_names.push(element.name));
        // console.log(valorant_emojis);
        
        if (emoji_names.indexOf(`Valorant${elo}`) === -1) { // if not found, add it then react
            new_emoji = await guild.emojis.create(`./assets/Valorant${elo}.webp`, `Valorant${elo}`, {reason:'For use with the MatchMaker bot'});
        }
        else { // if emoji aready exists, react
            new_emoji = valorant_emojis[emoji_names.indexOf(`Valorant${elo}`)];
        }
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
        return ranks.some(rank => reaction_name.startsWith(`Valorant${rank}`)); // apparently for each doesnt work but this is cleaner
    },
    // function for parsing !setup command and sending setup message
    // parameters: original !setup message, default text if no text is given
    // prints: setup message in requested channel
    // returns: setup message, or undefined if failed
    setup: async function(message, defaultText) {
        // some string parsing for reading the message content
        let first_space;
        if ((first_space = message.content.indexOf(' ')) === -1) { // if first space not found
            message.channel.send('Please follow the format: \"!setup <channel> <message>');
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
        // extract relevant info from string
        // let elo_bracket = elo.substring(0, elo.indexOf(' '));
        // let elo_number = parseInt(elo.substring(elo.indexOf(' ') + 1)) || -1;

        // edge case for no subrank number
        // if (elo === 'radiant' || elo === 'unranked' || elo === 'immortal') {
        //     elo_bracket = elo;
        //     elo_number = 0;
        // }
        // small error checking
        /*else */if (elo === -1) { // this occurs when elo isnt given
            /*message.channel.send('Please follow the format: \"!setelo <rank bracket> <subrank number>'); */
            console.log(`Elo isn's given?... : ${elo}`);
            return -1;
        }
        // in case number is out of range
        // else if (elo_number < 0 || elo_number > 3) {
        //     message.channel.send('Please enter a valid subrank number');
        //     return -1;
        // }

        // let score = 0;
        // set initial score based on bracket

        // plat is same as platinum
        if (elo === 'Plat') {
            elo = 'Platinum';
        }

        let score = ranks.indexOf(elo);

        // console.log(`Score if ${elo} is ${score}`);
        // switch(elo_bracket) {
        //     case "Iron":
        //         score = 0;
        //         break;
        //     case "Bronze":
        //         score = 1;
        //         break;
        //     case "silver":
        //         score = 2;
        //         break;
        //     case "gold":
        //         score = 3;
        //         break;
        //     case "platinum":
        //     case "plat":
        //         score = 4;
        //         break;
        //     case "diamond":
        //         score = 5;
        //         break;
        //     case "immortal":
        //         score = 6;
        //         break;
        //     case "radiant":
        //         score = 7;
        //         break;
        //     case "unranked": // unranked is negative as to ignore the rank in the future
        //         score = -10;
        //         break;
        //     default: // if we get this far, there's an error
        //         // message.channel.send('Only valid ranks are allowed');
        //         return -1;
        // }

        // now consider number for elo
        // score *= 3;
        // score += elo_number;

        // return final score
        return score;
    },
    // function for printing teams using embed message
    // parameters: channel reference for sending
    // prints: teamsi in embed message
    // returns: N/A
    printTeams: async function(t1_string, t2_string, team_ad_string, channel, Discord, icon) {
        team_ad_string = team_ad_string + '\n\u200B';
        // print teams in an embedded message
        // https://stackoverflow.com/questions/49334420/discord-js-embedded-message-multiple-line-value
        const teams_embed = await this.templateEmbed(Discord);

        teams_embed
        .setFooter(puns[Math.floor(Math.random() * puns.length)])  // add a little pun at the bottom
        .setTitle('Teams')
        .addFields(
            {name: 'Team 1', value: `${t1_string}`, inline: true},
            {name: '\u200B', value: '\u200B', inline: true},
            {name: 'Team 2', value: `${t2_string}`, inline: true},
            {name: '\u200B', value: '\u200B'},
            {name: 'Advantage', value: team_ad_string},
        );

        channel.send({files: [icon], embed: teams_embed});
    },
    // function for creating initial template for embed messages
    // parameters: discord reference
    // prints: N/A
    // returns: reference to embed message
    templateEmbed: async function(Discord) {
        // template embed for all MatchMaker messages
        // https://discordjs.guide/popular-topics/embeds.html#attaching-images-2
        return commands_embed = await new Discord.MessageEmbed()
            .setColor('#ffb7c5') // cherry blossom pink
            .setAuthor('MatchMaker Bot', 'attachment://matchmakermulan.jpg', 'https://www.youtube.com/watch?v=fO263dPKqns') // link to 2nd best mulan song :)
            .setTimestamp(); // to distinguish between embeds

    },
    // function for calculating the optimal teams
    // parameters: objects containing pairs of player ids and ranks (strings : Integers), message reference for replying, client
    // prints: teams
    // returns: bool for success
    makeTeams: function(player_data, message, client, Discord, icon, stdev_ratio) {

        // step 0: create initial team lists
        // NOTE: ASSUMING ONLY 2 TEAMS
        let player_ids = Object.keys(player_data);
        let t1 = [];
        let t2 = [];
        let curr_team_scores = [];

        // step 1: calculate the average player score ("aps") and stdev
        let num_players = Object.keys(player_data).length;
        let team_size = num_players / 2;

        // i. calculate average player score ("aps")
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
        num_players = Object.keys(player_data).length; // set num players back to what it was before

        // set unranked players' values to average (aps)
        for (let key in player_data) {
            if (player_data[key] < 0) {
                player_data[key] = aps;
            }
        }

        console.log(`aps is ${aps}`);
        console.log(`players are ${JSON.stringify(player_data)}`);

        // ii. calculate stdev
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
                    
                    // i. find target score to reach this iteration
                    let target_score = aps * i;

                    // ii. calculate ideal player score for this iteration
                    let ideal_player_score = target_score - curr_team_score;

                    // iii. find existing player with value closest to ideal player score
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

                // step 4: if team score is more than 1 stdev from expected total, restart algorithm
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
        let team_diff = curr_team_scores[0] - curr_team_scores[1];
        let team_advantage = 2; // default that team 2 has advantage
        let team_ad_string = '';
        if (team_diff === 0) { // if no diff, equal
            team_ad_string = 'Teams are perfectly balanced, as all things should be';
        }
        else if (team_diff > 0) { // if difference is negative, first team has advantage
            team_advantage = 1;
        }
        // print warnings based on how large the team diff is
        if (team_diff <= 1.3 && team_diff >= -1.3) {
            team_ad_string = `Team ${team_advantage} has a slight advantage`;
        }
        else {
            team_ad_string = `Team ${team_advantage} has a large advantage`;
        }

        // collect users into string for printing
        // https://stackoverflow.com/questions/63069415/discord-js-how-to-get-a-discord-username-from-a-user-id
        let t1_string = '';
        t1.forEach(element => {
            let person = client.users.cache.get(element).username;
            console.log(`person is: ${person}`);
            t1_string = t1_string + '\n' + person;
        });

        let t2_string = '';
        t2.forEach(element => {
            let person = client.users.cache.get(element).username;
            console.log(`person is: ${person}`);
            t2_string = t2_string + '\n' + person;
        });

        // print results
        this.printTeams(t1_string, t2_string, team_ad_string, message.channel, Discord, icon);

        return true; // if you've made it this far, you're either really sneaky or just a valid entry
    }
};