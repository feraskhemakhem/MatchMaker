// js file for the getting elo of tagged user

module.exports = {
    name: 'deploy',
    public: false,
    usage: '',
    description: 'deploys slash commands',

    async execute(message, args) {

        // for all commands to be deployed

        // https://gist.github.com/advaith1/287e69c3347ef5165c0dbde00aa305d2
        message.client.api.applications(message.client.user.id).guilds('625862970135805983').commands.post({type: 4, data: data1});

        message.reply('command deployed');

    },
};