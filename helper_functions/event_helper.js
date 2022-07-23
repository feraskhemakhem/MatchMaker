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

        // POST V13 CODE (tweaked for v13)
        await interaction.reply(response);
        return await interaction.fetchReply();
    },
    followUp: async function(client, interaction, response) {
        new Discord.WebhookClient(client.user.id, interaction.token).send(response);
    }
};