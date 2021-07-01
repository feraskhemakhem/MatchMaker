// js file for the getting elo of tagged user

module.exports = {
    name: 'deploy',
    public: false,
    usage: '',
    description: 'deploys slash commands',

    async execute(message, args) {

        const { client } = message;

        // if no args, deploy every command
        if (!args.length) {

        }
        else { // find command given arg name and add it
            // https://gist.github.com/advaith1/287e69c3347ef5165c0dbde00aa305d2

            // if name is not a command, ignore
            if (!client.commands.has(args[0])) return;

            // find command reference
            const command = client.commands.get(args[0]);

            // add command to list of commands
            client.api.applications(client.user.id).guilds('625862970135805983').commands.post({data: {
                name: command.name,
                description: command.description,
            }});

            message.reply(`command ${args[0]} deployed`);
        }

        return undefined;
    },
};