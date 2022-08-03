// js file for the viewing version command

// info about the node.js project
const { reply } = require('../../helper_functions/comm_helper.js');
const package = require('../../package.json');

module.exports = {
    // command name
	name: 'v',
    args: 0,
    admin: false,
    public: true,
    cooldown: 5,
    // description of command
	description: 'Replies with current release version of MatchMaker',

    // actual command code
	async execute(interaction, args, client) {
        // get version from package file
        reply(interaction, `MatchMaker v${package.version}`);
    },
};