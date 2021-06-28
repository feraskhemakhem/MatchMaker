// js file for the match command

// self-defined helper functions
const helper = require('../helper.js');

module.exports = {
    // command name
	name: 'setup',
    args: 1, // TODO: need to signify at least 1 arg, but can be more
    admin: true,
    usage: '<#channel> <message>',
    // description of command
	description: 'Sends setup message of content <message> to <#channel> and prepares reactions for assigning elo. Message is optional, with default message as stand-in. Quotes around message are also optional (e.g. \'/setup #roles "React your elo here"\'). WARNING: THIS COMMAND SHOULD ONLY BE USED ONCE, UNLESS THE PREVIOUS MESSAGE IS DELETED',

    // actual command code
	async execute(message, args, data, client) {

        // make sure server is available, suggested by documentation
        if (!message.guild.available) {
            console.log(`Guild not available for setup`);
            return undefined;
        }

        const default_text = 'Please choose your rank by selecting the reaction that corresponds to it.';
        let setup_message;
        
        if (!(setup_message = await helper.setup(message, default_text))) {
            console.log(`ahaha sending setup message failed :)))`);
            return;
        }

        // reaction collector for setting elos
        const collector_filter = (reaction, user) => helper.isValorantEmoji(reaction.emoji.name) && user.id !== client.user.id;
        // also create reaction collector for assigning elos
        const elo_collector = setup_message.createReactionCollector(collector_filter);
        // collect elo reactions
        elo_collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            // process elo reaction (this is the hardest line to figure out in all of my code)
            random_dict[user.id] = helper.processEloReaction(reaction, user);
        });
        console.log(`setup message resolved`);

        // if reactions do not exist, add them to server
        // first, get a list of emojis with 'Valorant(rank)' names
        let valorant_emojis = message.guild.emojis.cache.filter(emoji => emoji.name.startsWith('Valorant'));
        valorant_emojis = Array.from(valorant_emojis.values());

        let emoji_names = [];
        valorant_emojis.forEach(element => emoji_names.push(element.name));

        // for each emoji that does not exist, add it to the server
        let ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'];
        for (const element of ranks) { // not the best but cleanest way to ensure order and linearity
            let new_emoji;
            if (emoji_names.indexOf(`Valorant${element}`) === -1) { // if not found, add it then react
                new_emoji = await message.guild.emojis.create(`./assets/Valorant${element}.webp`, `Valorant${element}`, {reason:'For use with the MatchMaker bot'});
            }
            else { // if emoji aready exists, react
                new_emoji = valorant_emojis[emoji_names.indexOf(`Valorant${element}`)];
            }
            await setup_message.react(new_emoji);
        }

        message.reply(`Setup message sent`); 
    },
};