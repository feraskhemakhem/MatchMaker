// js file for the match command

// info about the node.js project
const package = require('../../package.json');

module.exports = {
    // command name
	name: 'v',
    // description of command
	description: 'Replies with current release version of MatchMaker',

    // actual command code
	async execute(message, args) {
        // get version from package file
        message.reply(`MatchMaker ${package.version}`);
    },
};