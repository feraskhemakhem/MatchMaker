// js file for the getting elo of tagged user

module.exports = {
    name: 'deploy',
    public: false,
    usage: '',
    description: 'deploys slash commands',

    async execute(message, args) {

        // get data from args
        const data = [
            {
                name:'getelo', 
                description: 'Reacts with tagged <@user>\'s elo stored in database',
            },
        ];

        console.log(`guild id is ${message.guild.id}`);

        // get command from data        
        // const cl_app = await message.client.fetchApplication();

        const cl_app = await message.client.guilds.cache.get('625862970135805983');

        console.log(`guild is ${JSON.stringify(cl_app)}, and is ${cl_app.available} available`);
        
        const com = await cl_app.commands;

        console.log(`commands is ${JSON.stringify(com)}`);
        
        const command = await com.create(data);

        console.log(`final command is ${JSON.stringify(command)}`);
    },
};