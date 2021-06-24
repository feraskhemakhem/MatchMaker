# MatchMaker
### A discord bot that creates rank-based teams from a pool of players.

## Adding to Your Discord Server



## How to Setup Your Own MatchMaker
In order to download the code and make it your own, do the following:

1. Download this repo from GitHub (look at releases for stable versions of this repo).
2. Prepare your Node.js environment (npm init, npm install, all that jazz).
3. Go to [discord.com/deveopers](discord.com/developers) and follow [these instructions](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot). 
4. When you get your token, incorporate it into your add. `dotenv` is already included in the code, so just create a `.env` file and create a secret with your token. The secret name is `BOT_TOKEN`, but you can change it if you want at the very bottom of the `bot.js` file.
5. To run your code locally, run `npm bot.js` in a terminal when in the same directory as the Node project.
6. If you wish to host it on a server, it does not take too many resources at all. I'm using a free Heroku instance for it. Just make sure to set a config variable for your token secret, as well as a buildpack for Node.

With that, you should be up and running your own server! As the project expands, more instructions will be added.


## Usage

