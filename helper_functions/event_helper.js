// helper functions for client events

module.exports = {
    reply : async function(client, interaction, response) {
        let data = {
                content: response,
        };

        // check for embeds
        if (typeof response === 'object') {
                data = await createAPIMessage(interaction, response);
        }

        // POST V13 CODE
        // await interaction.reply(response);
        // return await interaction.fetchReply();

        //  reply? TODO: since discord.js doesnt natively support it yet, doing it ugly
        await client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                        data: data,
                }
        });

        const app = client.fetchApplication();
        const reply = await client.api.webhooks(client.user.id, interaction.token).messages('@original').get();

        console.log(`reply sent for response: ${response} and ${typeof{reply}}, ${JSON.stringify(reply)}`);
        return reply;
    },
    followUp: async function(client, interaction, response) {
        new Discord.WebhookClient(client.user.id, interaction.token).send(response);
    }
};