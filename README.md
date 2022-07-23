# MatchMaker v2.7.0

A discord bot that creates rank-based teams from a pool of players.

### New In This Patch

v2.7.0 sees a fresh review after slash commands are fully implemented. `discord.js` v12 is outdated and does not natively support slash commands, so the codebase is updated to support v14 in this patch. Some previously broken slash commands are fixed, and `README.md` gets a bit of love. In addition, `CHANGELOG.md` is added to the codebase to keep up with changes made in each version, and a new directory `local_helpers` is added to add resources for local testing of the project.

Full details in `CHANGELOG.md`.

## Games Supported

Currently, functionality is only for Valorant. Values for matchmaking are tuned for Valorant only because it is the only game I am comformtable with that does 10-mans. Other games will be added in the future, but that will require outside reference for how the difference between ranks "feels" in those games. Additionally, some games like League of Legends have more specialized roles than Valorant, functionality for that might need to be considered.

### Currently Supported Games:
- Valorant

### Next Games, In Order:
- CS:GO
- Leauge of Legends
- Overwatch/Overwatch 2 (will support 6v6 _and_ 5v5 for each game's unique format)

## Inspiration

This bot's main goal is to take a small pool of people and make teams. Although not limited to this, the audience in mind is scrimmaging discord servers (sometimes known as "10-mans" or "10-man servers") where people meet to play in custom lobbies. A common issue in these servers is that people have trouble picking teams when they do not know the others in the player pool, or when people are too indecisive. Player ranks are considered to make teams as balanced as possible, with some randomness still seeded in to ensure that the same pool of players will yield different teams every time.

This inspiration evolved as Valorant become a popular game in my active Discord servers. 10 minutes can easily fly by when people are trying to pick team captains and teams. Knowing each other so well makes it hard for us to pick out of a pool of people. This is either we people do not want to offend those left for last, or think too much about balancing teams. Although this idea started before Valorant was announced, these interactions gave the bot direction. MatchMaker fixes all of these issues, while also catering to the original audience.

## Usage

### Adding MatchMaker to Your Discord Server

If you want to add this bot a server you're in, ask an admin [or yourself if you are one ;)] to use this link for inviting MatchMaker. [Click this to add the bot to your server :)](https://discord.com/oauth2/authorize?client_id=721167637006123088&permissions=3709861105&scope=bot%20applications.commands)

### Once MatchMaker Has Joined

Hopefully I'm still talking to the admin. `!commands` will show you all of the avaiable commands for MatchMaker (using this as an admin will show more commands than a regular user), but the most important thing for setting up a collection system for player elo/ranks. This command is the `!setup` reaction, and should ***ONLY BE USED ONCE EVER. The only exception is if you delete the old message, and hopefully you've done that for a good reason***. 

Okay... the rest applies to all users, not just the admin. Once the admin has setup the bot, a message somewhere asking for your rank should show up, along with reactions. React to the message with your elo/rank in the appropriate, and it should be registered. Here's a bit about the other commands:

_User Commands:_

- `!match {num players}` begins process of matchmaking with an expected {num players} players in the pool (e.g. `!match 10`). The MatchMaker will ask for a reaction from all player to be included, starting the processing of matchmaking.
- `!reroll` reattempts matching with the same players as the last `!match` pool. For example, if teams are made with 8 set people, `!reroll` will make new teams with those exact same people
- `!setelo {elo}` sets the elo of user to {elo}. {elo} is a string which supports capitalisation and lowercase (e.g. `!setelo Radiant`)
- `!v` replies with the current release version of MatchMaker
  
_Admin Commands:_

- `!setup {#channel} {message}` sends setup message of content {message} to {#channel} and prepares reactions for assigning elo. Message is optional, with default message as stand-in. Quotes around message are also optional (e.g. '!setup #roles "React your elo here"').    
   - WARNING: THIS COMMAND SHOULD ONLY BE USED ONCE, UNLESS THE PREVIOUS MESSAGE IS DELETED
   - Default message: "Please choose your rank by selecting the reaction that corresponds to it."
- `!setelo <@user> {elo}` sets the elo of {@user} to {elo}. {elo} is a string which supports capitalisation and lowercase (e.g. `!setelo @cherry_blossom gold`)

A reminder that for further guidance, `!commands` will provide details on each command.

## How to Setup Your Own MatchMaker
In order to download the code and make it your own, do the following:

1. Download this repo from GitHub (look at releases for stable versions of this repo).
2. Prepare your Node.js environment (npm init, npm install, all that jazz).
3. Go to [discord.com/deveopers](discord.com/developers) and follow [these instructions](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot). 
4. Once you generate your token, add it to your local build of the app. The `dotenv` library is supported in the code, so just create a `.env` file with a secret consisting of your token. The secret name is `BOT_TOKEN`, but you can change it if you want at the very bottom of the `bot.js` file. You can opt to use a `config.json` file (like they do (here)[https://discordjs.guide/creating-your-bot/configuration-files.html]), but I prefer the `.env` because Heroku's secret is stored with the same variable `process.env.BOT_TOKEN` as `dotenv`. NOTE: Your token is a private key that you should share with nobody! Make sure any files that contain your token are not pushed to GitHub (`.env` is included in the `.gitignore` by default). In addition, your token will not be accessible through the developer portal once you generate it, so make sure to record it; otherwise, you may have to reset your token.
5. To run your code locally, run `node bot.js` in the base directory of this project. This project also includes `nodemon` as a dev dependency, so `nodemon bot.js` should work natively. `nodemon` is recommended for development as it ensures proper reloading of the application between saves.
6. If you wish to host it on a server, it does not take too many resources at all. I'm using a free Heroku instance currently. Just make sure to set a config variable for your token secret, as well as a buildpack for Node.

With that, you should be up and running your own server! As the project expands, more will be added.

For any questions, suggestions, or comments, contact me at feraskhemakhem@gmail.com.
