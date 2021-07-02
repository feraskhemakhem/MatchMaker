// js file for setting stdev_ratio value for testing

// filesystem reference
const fs = require('fs');
const db_helper = require('../../helper_functions/db_helper.js');

module.exports = {
    name: 'stdev_ratio',
    cooldown: 3,
    public: false,
    usage: '<value>',
    description: 'sets stdev_ratio  to <value> or gets it',

    async execute(message, args) {
        // read old stdev_ratio
        const data = db_helper.readData();

        // if arg given, change to this arg
        if (args.length) {
            console.log(`arg0 is "${args[0]}"`);
            const new_ratio = parseFloat(args[0]);
            if (isNaN(new_ratio)) {
                message.reply('please respond with an appropriate ratio value');
                return;
            }
            data.stdev_ratio = new_ratio;
            db_helper.writeData(data);

            message.reply(`stdev ratio changed to ${new_ratio}`);
        }
        else { // if arg is not given, print stdev ratio
            message.reply(data.stdev_ratio);
        }
    },
};