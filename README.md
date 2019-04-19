# Discord Downtime Notifier Bot

This is a small bot that notifies a server through a message when another bot goes offline. The main use is to let users know when a bot goes offline and becomes unusable. It also lets users know once said bot goes back online. This is useful mostly for server owners with self-hosted bots and need a way of getting notified when they bots go offline. For better results, this bot should be hosted on a service like [Heroku](https://www.heroku.com/).

## Requirements

You can self-host this bot or deploy it on a service like [Heroku](https://www.heroku.com/) for example. If you do decide to self-host, you'll need to install the following:

* [git](https://git-scm.com/)
* [node.js](https://nodejs.org/en/) *(Up to version 10, tested using Node 10.13.0)*

## Dependencies

| Dependency:                                           | Description:                                                             |
|-------------------------------------------------------|--------------------------------------------------------------------------|
| [discord.js](https://github.com/discordjs/discord.js) | A powerful JavaScript library for interacting with the Discord API.      |
| [fs](https://www.npmjs.com/package/fs)                | File system utilities for Node.js.                                       |
| [logger](https://github.com/moonstar-x/logger)        | A small logger module for Node.js.                                       |
| [realm](https://www.npmjs.com/package/realm)          | Realm is a mobile database: an alternative to SQLite & key-value stores. |

## Installation

### Self-Hosting

In order to self-host this bot, you'll need to clone this repository.

    git clone https://github.com/moonstar-x/discord-downtime-notifier.git

Then, rename the file *settings.json.example* to *settings.json* and edit the values according to your server (server ID, channel ID, bot ID and bot token).

    {
      "discord_token": "YOUR_DISCORD_TOKEN",
      "prefix": "YOUR_PREFIX_HERE"
    }

Install the dependencies:

    npm install

You can now run your bot:

    npm start

### Deploying to Heroku

To deploy to Heroku, you can click on the image below and login to your account.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/moonstar-x/discord-downtime-notifier)

You'll then need to add the config vars for your bot, head over to your app's *Dashboard*, click on *Settings* and *Reveal Config Vars*. You'll need to add the following vars with their respective values.

| CONFIG VAR    | VALUE                        |
|---------------|------------------------------|
| PREFIX        | YOUR PREFIX HERE.            |
| DISCORD_TOKEN | YOUR DISCORD BOT TOKEN HERE. |

*Copy the config var exactly as it is and only change the values.*

You can now go back to your app's *Overview*, make sure you disable the *web* dyno and enable the *bot* dyno. Your bot should now be up and running. Remember you can always check your bot's console if you access the *View Logs* in the *More* dropdown menu.

## Usage

For a more detailed usage message, run the following command in your server: `d!help`.
> Replace **d!** with the prefix that you've set-up (if you're hosting this yourself).

### Set-up a broadcasting channel

Before you can add bots to the list, you need to set-up which channel should the bot send messages to. Run the following command `d!channel` and mention the channel you want to select.

### Add a bot to the list

To add a bot to the list, simply run the command `d!add` and mention the bot you want to add.
> Only server **Administrators** can run this command.

### Remove a bot from the list

To remove a bot from the list, simply run the command `d!remove` and mention the bot you want to remove.
> Only server **Administrators** can run this command.

### List all the bots in the list

To get a list of all the bots that are being monitored, run the command `d!help`

## Add this bot to your server

You can add this bot to your server by clicking in the image below:
[![Add this bot to your server](https://i.imgur.com/EJM2CM0.png)](https://discordapp.com/oauth2/authorize?client_id=514136165138563073&scope=bot&permissions=2048)

## Author

This bot was made by [moonstar-x](https://github.com/moonstar-x).