// this is a helper file for all things related to the database

const database_path = './temp/temp_db.json';
const fs = require('fs');

module.exports = {
    readData: function() {
        return require(database_path);
    },
    addElo: function (data, user_id, elo) {
        data.player_elos[user_id] = elo;
        return data;
    },
    writeData: function (data)  {
        fs.writeFile(database_path, JSON.stringify(data), err => {
            
            // Checking for errors
            if (err) console.log('error storing to database'); 
        
            // if you've reached this point, update db successfully
            console.log('db update complete'); 
        });
    }
};