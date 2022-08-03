
# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)

## [2.6.6] - 2022-08-02

This patch's focus is on the abstraction of the match command's functionality into a helper function named matchMaker.

### Added

- matchMaker() added to new file, match_helper.js. The functionality is abstracted from the match.js file to easily share functionality with other functions [match.js, match_helper.js]
- Allowed time to react added to prints [match.js]
 
### Changed

- Reverted num_players variable to extract from integer option (was hardcoded for debugging :skull:) [match.js]
- Embed now includes the requestor's name to be more specific [helper.js]
 
### Removed

(nothing)


## [2.6.5] - 2022-08-02

This patch's focus is the match command, in match.js.

### Added

- Added match helper file to abstract matchmaking functionality from the match command. This is a form of future-proofing as future versions of MatchMaker will find other ways to matchmake outside of the match command [match_helper.js]
- maxValue and minValue now exist as parts of the option num_players [match.js]
- reply_and_react() added for faster reaction after posting reply [comm_helper.js, match.js]
- Added nodemon configuration to ignore saving of files in the temp folder. The temp folder holds temporary json databases locally, so this will make testing much easier [package.json]
- Error checking added throughout makeTeams() to make it more resilient against unforseeable bugs [helper.js]
 
### Changed

- event_helper.js name changed to comm_helper.js to better reflect its utility [comm_helper.js]
- The match command changed to work with the native interaction type instead of message and args [match.js]
- message#awaitReactions parameters modified for updated design [match.js]
- Console log prints now include the file/function they are in for easier backtracking when debugging [many files]
- Typing of options changed from magic numbers to a more sustainable enum ApplicationCommandOptionType [match.js]
- reply()'s parameters were cleaned up [comm_helper.js, many others]
- reply()'s functionality changed from awaiting promises to using a .then.catch structure to ensure faster functionality [comm_helper.js]
- The bot's own id is filtered out before processing of emojis and not during the processing to remove potential errors [match.js]
- makeTeams() now accepts a collection of users mapped (user_id : user object) in place of client to directly look up the user instead of relying on client cache [match.js, helper.js]
- Updated old embed methods to use EmbedBuilder instead of MessageEmbed as well as typing for setting author and footer [helper.js]
- Case in makeTeams() where team 2 has an advantage is not considered when calculating advantage, which is fixed [helper.js]
- reply_and_react() was reverted to original implementation due to the necessity of the await for message reaction (to avoid reacting after collection started) [comm_helper.js]
 
### Removed

- Check for argument formatting removed as discord automatically does that now [interactionCreate.js]
- Manual range checks for num_players removed [match.js]
- Updating of cached players (updateCachedPlayers) no longer necessary in match.js as we now pass all relevant cached players into makeTeams [match.js]


## [2.6.4] - 2022-07-24
 
With a crusade to update all slash functionality, the elo command is the focus of v2.6.4. In this update we see elo.js updated to work with the interaction class, and some database functionality is shuffled around.

### Added

- Extra error checking is added for elo commands in case of invalid inputs or unexpected resutls [elo.js]
- getScore command added to obtain a single score from a database [db_helper.js]
 
### Changed

- Changed all references to "elo" in the database to "score" for clarity. This includes function names and database references [db_helper.js, reroll.js, elo.js, match.js, setup.js]
- Database checks abstracted out of elo function and into db_helper to better organize file priorities [elo.js, db_helper.js]
- The elo command changed to work with the native interaction type instead of message and args [elo.js]
 
### Removed

(nothing)

 
## [2.6.3] - 2022-07-22
 
This update exists as the first revisit of the codebase in over a year. With a fresh set of eyes, things are slowly being cleaned up and functionality of slash commands is taken with a fresh approach. discord.js v14 is introduced in this updated with v10 of the discord API, and most of the work in this iteration is to get the code up to speed to ensure it works with discord.js v14.

### Added

- @discordjs/builders, @discordjs/rest, and discord-api-types were all installed for support of loading commands to the discord bot [restiger_commands.js]
- Intents of client added as now required by discord.js v14 [bot.js]
- nodemon as a dev depedency added for easier reloading
- @discordjs/voice added for future voice channel functionality
 
### Changed

- MessageAttachment class replacemd with AttachmentBuilder class for discord.js v14 [help.js, helper.js]
- client#fetchApplication function depricated in v14, so replaced with client#isReady function [ready.js]
- v.js output updated for clarity [v.js]
- README.md's installation instructions are updated for mistakes and clarity. In addition, a new section at the top is added for the most recent updates for a given patch [README.md]
- Magic numbers (enums) and certain strings are no longer accepted and require types to replace it, like setActivity's type [ready.js]
- client#message is deprecated in discord.js v14, so message.js has been transformed into messageCreate.js [messageCreate.js]
- The interactionCreate event is migrated from an API call to a client event part of discord.js. This leads to changes in the implementation of interactionCreate.js as new data types are included [iteractionCreate.js]
- The introduction of options as part of an interaction resulted in some functions changing their args to just obtaining the interaction and using the options property for all args information. v.js does not use options, but other commands will integrate it as we progress [interactionCreate.js]
- reply function got a huge facelift to become essentially a 2-line function with the introduction of interactions in v14 [event_helper.js]
 
### Removed

(nothing)