// module for ready event of client

module.exports = {
        // AYYO DICSORD JS GUIDE KINDA SUS
        // USE THIS: https://www.youtube.com/watch?v=-YxuSSG_O6g        
	name: 'INTERACTION_CREATE',
        ws: true,
	async execute(interaction, client) {
                // await interaction.defer();
                // await wait(4000);
                // await interaction.editReply('Pog!');
                const command = interaction.data.name;
                console.log(command);


                //  reply? TODO: since discord.js doesnt natively support it yet, doing it ugly
                client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                                type: 4, // CHANNEL_MESSAGE_WI  TH_SOURCE
                                data: {
                                        content: 'pog!',
                                }
                        }
                });

                // make sure it is an appropriate interaction
                // console.log(`command?`);
                // if (!interaction.isCommand()) return;
                // if (interaction.commandName === 'v') await interaction.reply('Pong!');
                // console.log(`interaction is ${interaction.name}`);
	},
}