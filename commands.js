https://stackoverflow.com/questions/50426635/exporting-importing-in-node-js-discord-js

// function for calculating the optimal teams
// parameters: objects containing pairs of player ids and ranks (strings : Integers), and message reference for replying
// output: ids of players on team 1, and team 2

module.exports = {  
    makeTeams: function(player_data, message) {

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
            aps = aps + player_data[key];
        }
        aps = aps / num_players;

        console.log(`aps is ${aps}`);

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
        if (team_diff === 0) { // if no diff, equal
            message.channel.send('TEAMS ARE EQUAL POG');
            return true;
        }
        else if (team_diff > 0) { // if difference is negative, first team has advantage
            team_advantage = 1;
        }
        // print warnings based on how large the team diff is
        if (team_diff <= 4 && team_diff >= -4) {
            message.channel.send(`Warning: Team ${team_advantage} has a slight advantage`);
        }
        else {
            message.channel.send(`Warning: Team ${team_advantage} has a large advantage`);
        }

        // print values for testing
        message.channel.send(`Team 1\'s ${t1.length} players consists of: ${t1}`);
        message.channel.send(`Team 2\'s first ${t2.length} players consists of: ${t2}`);

        return true;
    }
};