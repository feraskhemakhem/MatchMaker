
# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
## [2.7.0] - yyyy-mm-dd
 
This update exists as the first revisit of the codebase in over a year. With a fresh set of eyes, things are slowly being cleaned up and functionality of slash commands is taken with a fresh approach. discord.js v14 is introduced in this updated with v10 of the discord API, and most of the work in this iteration is to get the code up to speed to ensure it works with discord.js v14.

### Added

- @discordjs/builders, @discordjs/rest, and discord-api-types were all installed for support of loading commands to the discord bot [restiger_commands.js]
- Intents of client added as now required by discord.js v14 [bot.js]
- Added a folder `local_helpers/` for helper functions when testing locally. The only current file is `register_commands.js`, which is used for re-registering slash commands in a guild (guild command refresh faster than global commands, which makes it convenient for testing). This is useful for updating the guild commands list before running `node bot.js` when applicable. To make it run well, though, a secret must be added to `.env` for the guild ID of the server testing in [restiger_commands.js]
- nodemon as a dev depedency added for easier reloading
- @discordjs/voice added for future voice channel functionality
 
### Changed

- MessageAttachment class replacemd with AttachmentBuilder class for discord.js v14 [help.js, helper.js]
- client#fetchApplication function depricated in v14, so replaced with client#isReady function [ready.js]
- v.js output updated for clarity [v.js]
- README.md's installation instructions are updated for mistakes and clarity. In addition, a new section at the top is added for the most recent updates for a given patch [README.md]
- Magic numbers (enums) and certain strings are no longer accepted and require types to replace it, like setActivity's type [ready.js]
- client#message is deprecated in discord.js v14, so message.js has been transformed into messageCreate.js [messageCreate.js]
 
### Fixed

- help command failed 