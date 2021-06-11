// function for calculating the optimal teams
// parameters: array of ids (strings), objects containing pairs of player ids and ranks (strings : Integers)
// output: ids of players on team 1, and team 2
function findTeams(player_ids, player_data) {

    // step 0: create initial team lists
    // NOTE: ASSUMING ONLY 2 TEAMS
    var t1 = [];
    var t2 = [];
    var curr_team_scores = [];

    // step 1: calculate the average player score ("aps") and stdev
    var num_players = Object.keys(player_data).length;
    var team_size = num_players / 2;

    // i. calculate average player score ("aps")
    var aps = 0;
    for (var key in player_data) {
        aps = aps + player_data[key];
    }
    aps = aps / num_players;

    // ii. calculate stdev
    var stdev = 0;
    for (var key in player_data) {
        stdev = stdev + Math.pow(player_data[key] - aps, 2);
    }
    stdev = stdev / num_players;
    stdev = Math.sqrt(stdev);


    /************* redo all steps starting here if step 4 fails **************/
    var bad_teams = false; // whether the teams are bad or not
    var num_failures = 0; // number of failures
    do {
        // if we fail to make teams at least 10 times, give up
        if (num_failures >= 10) {
            return false;
        }

        // reset the variables every time it fails
        curr_team_scores = [];
        t1 = [];
        t2 = [];
        var remaining_players = player_data; // TODO: make into a deep copy?

        // step 2: choose first player for each team ("seeds")
        var first_player = Math.floor(Math.random() * num_players);
        var second_player = Math.floor(Math.random() * num_players);

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
        for (var t = 0; t < 2; t++) {
            
            // step 3: choose players for each team
            var curr_team_score = 0; // TODO: set initial player sum to the score of the first player...
            for (var i = 2; i < team_size; i++) {

                // i. find target score to reach this iteration
                var target_score = aps * i;

                // ii. calculate ideal player score for this iteration
                var ideal_player_score = target_score - player_sum;

                // iii. find existing player with value closest to ideal player score
                // TODO: IT MIGHT BE OPTIMAL IN THE FUTURE TO DETERMINE IF SAME DISTANCE ABOVE OR BELOW
                // IS BETTER. MAYBE DEPENDENT ON WHETHER THE TEAM HAS BETTER PLAYERS OVERALL OR NOT?
                var closest_id = "";
                var closest_distance = 10000;
                for (var id in remaining_players) {
                    var player_distance = Math.abs(ideal_player_score - reamining_players[id]);
                    if (player_distance < closest_distance) {
                        closest_id = id;
                        closest_distance = player_distance;
                    }
                }

                // iv. add player to team and update player sum
                t1.push_back(closest_id);
                curr_team_score = curr_team_score + remaining_players[closest_id];
                delete remaining_players[closest_id];
            }

            // step 4: if team score is more than 1 stdev from expected total, restart algorithm
            if (Math.abs(curr_team_score - (aps * num_players)) > stdev) {
                bad_teams = true;
                num_failures++;
                continue;
            }
            curr_team_scores.append(curr_team_score);
        }

    } while (bad_teams);
    /****************************** TEAMS ARE MADE ******************************/

    // step 5: determine advantage score based on team score and report
    var team_diff = curr_team_scores[0] - curr_team_scores[1];
    var team_advantage = 2; // default that team 2 has advantage
    if (team_diff === 0) { // if no diff, equal
        console.log('TEAMS ARE EQUAL POG');
        return true;
    }
    else if (team_diff < 0) { // if difference is negative, first team has advantage
        team_advantage = 1;
    }

    // print warnings based on how large the team diff is
    if (team_diff >= 8 || team_diff <= -8) {
        console.log(`Warning: Team ${team_advantage} has a large advantage`);
    }
    else if (team_diff >= 4 || team_diff <= -4) {
        console.log(`Warning: Team ${team_advantage} has a slight advantage`);
    }

    return true;
}