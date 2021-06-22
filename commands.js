// https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js


// just some puns
const puns = ['It was a match made in heaven', 'we make matches, not lighters', 'the match of the century'];

// function for calculating the optimal teams
// parameters: objects containing pairs of player ids and ranks (strings : Integers), and message reference for replying
// output: ids of players on team 1, and team 2
module.exports = { 
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
        else {
            target_channel_name = message.content.substring(first_space + 1, second_space);
            message_for_users = message.content.substring(second_space + 1);
        }


        let target_channel;
        // parse channel string to clean it up
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
    eloToScore: function(message) {
        // extract relevant info from string
        let elo = message.content.substring(message.content.indexOf(' ') + 1);
        let elo_bracket = elo.substring(0, elo.indexOf(' '));
        let elo_number = parseInt(elo.substring(elo.indexOf(' ') + 1)) || -1;

        // edge case for no subrank number
        if (elo === 'radiant' || elo === 'unranked' || elo === 'immortal') {
            elo_bracket = elo;
            elo_number = 0;
        }
        // small error checking
        else if (elo === -1) { // this occurs when elo isnt given
            message.channel.send('Please follow the format: \"!setelo <rank bracket> <subrank number>');
            return -1;
        }
        // in case number is out of range
        else if (elo_number < 0 || elo_number > 3) {
            message.channel.send('Please enter a valid subrank number');
            return -1;
        }

        let score = 0;
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
                message.channel.send('Only valid ranks are allowed');
                return -1;
        }

        // now consider number for elo
        score *= 3;
        score += elo_number;

        // return final score
        return score;
    },
    printTeams: function(message, t1_string, t2_string, team_ad_string) {
        // print teams in an embedded message
        // https://stackoverflow.com/questions/49334420/discord-js-embedded-message-multiple-line-value
        message.channel.send({embed: {
                color: '#ffb7c5', // cherry blossom hex
                title: 'Teams:', // title could be better, but this is it for now...
                fields: [ // actual team info
                    {name: 'Team 1', value: `${t1_string}`, inline: true},
                    {name: '\u200B', value: '\u200B', inline: true},
                    {name: 'Team 2', value: `${t2_string}`, inline: true},
                    {name: '\u200B', value: '\u200B'},
                    {name: 'Advantage', value: team_ad_string},
                ],
                timestamp: new Date(), // to distinguish between matchings
                footer: { // add a little pun at the bottom
                    text: puns[Math.floor(Math.random() * puns.length)]
                }
            }
        });
    },
    makeTeams: function(player_data, message, client) {

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
                if (Math.abs(curr_team_score - (aps * team_size)) > stdev) {
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
        if (team_diff <= 4 && team_diff >= -4) {
            // message.channel.send(`Warning: Team ${team_advantage} has a slight advantage`);
            team_ad_string = `Team ${team_advantage} has a slight advantage`;
        }
        else {
            // message.channel.send(`Warning: Team ${team_advantage} has a large advantage`);
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
        this.printTeams(message, t1_string, t2_string, team_ad_string);

        return true; // if you've made it this far, you're either really sneaky or just a valid entry
    }
};