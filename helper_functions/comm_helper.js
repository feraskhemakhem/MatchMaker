// helper functions for communication-related things

module.exports = {
    // function for replying and reacting to interaction
    // parameters: original interaction to reply to, the written response for reply, and the reaction to occur after reply
    // prints: nothing
    // returns: reply
    reply : async function(interaction, response) {
        // if not the correct interaction type, ignore
        if (!interaction.isChatInputCommand()) return undefined;
        
        // let data = {
        //     content: response,
        // };

        // // check for embeds
        // if (typeof response === 'object') {
        //     data = await createAPIMessage(interaction, response);
        // }

        // POST V13 CODE (tweaked for v14)
        interaction.reply({content: response, fetchReply: true})
            .then(repl => {return repl;})
            .catch (collected => {
                console.log(`event helper: Collected is ${collected}. Error in reply and react`);
                return undefined;
            });
    },
    // function for replying and reacting to interaction
    // parameters: original interaction to reply to, the written response for reply, and the reaction to occur after reply
    // prints: nothing
    // returns: reply
    reply_and_react : async function(interaction, response, reaction) {
        // if not the correct interaction type, ignore
        if (!interaction.isChatInputCommand()) return undefined;

        // POST V13 CODE (tweaked for v14)
        const message = await interaction.reply({content: response, fetchReply: true})
            .catch (collected => {
                console.log(`event helper: Collected is ${collected}. Error in reply and react`);
            });
        // although not a fan of doing it like this, the await will ensure that the bot reacts before collecting further reactions
        await message.react(reaction);
        return message;
    },
    followUp: async function(client, interaction, response) {
        new Discord.WebhookClient(client.user.id, interaction.token).send(response);
    }
};