// this is a helper file for all things related to the database

const read_path = '../temp/temp_db.json';
const write_path = './temp/temp_db.json';
const fs = require('fs');

module.exports = {
    readData: function() {
        return require(read_path);
    },
    addElo: function (data, user_id, elo) {
        data.player_elos[user_id] = elo;
        return data;
    },
    writeData: function (data)  {
        fs.writeFile(write_path, JSON.stringify(data), err => {
            
            // Checking for errors
            if (err) console.log(`error storing to database in writeData function with error ${err}`);
        
            // if you've reached this point, update db successfully
            else console.log('db update complete'); 
        });
    }
};