// this is a helper file for all things related to the database

const read_path = '../temp/temp_db.json';
const write_path = './temp/temp_db.json';
const fs = require('fs');

module.exports = {
    // returns the data of the file
    readData: function() {
        return require(read_path);
    },
    // updates data with the elo of user
    addElo: function (data, user_id, elo) {
        data.player_elos[user_id] = elo;
        return data;
    },
    // function for writing given data to a file
    writeData: function (data)  {
        fs.writeFile(write_path, JSON.stringify(data), err => {
            
            // Checking for errors
            if (err) console.log(`error storing to database in writeData function with error ${err}`);
        
            // if you've reached this point, update db successfully
            else console.log('db update complete'); 
        });
    },
    // function for adding a single elo
    updateEloOnce: function (stdev_ratio) {
        // read and update data
        const data = this.readData();
        data.player_elos[user_id] = elo;
        // write to file
        this.writeData(data);
    },
    // function for updating stdev once
    updateStdevOnce: function (new_ratio) {
        // read and update data
        const data = this.readData();
        data.stdev_ratio = new_ratio;
        // write to file
        this.writeData(data);
    },
    updateCachedPlayers: function (ids) {
        // read and update data
        const data = this.readData();
        data.cached_players = ids;
        // write to file
        this.writeData(data);
    }
};