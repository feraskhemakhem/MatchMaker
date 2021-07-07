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

        //  reply? TODO: since discord.js doesnt natively support it yet, doing it ugly
        client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                        data: data,
                }
        });
    }
};