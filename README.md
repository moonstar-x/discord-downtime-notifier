# Discord Downtime Notifier Bot

This is a small bot that notifies a server through a message when another bot goes offline. The main use is to let users know when a bot goes offline and becomes unusable. It also lets users know once said bot goes back online. This is useful mostly for server owners with self-hosted bots and need a way of getting notified when they bots go offline. For better results, this bot should be hosted on a service like [Heroku](https://www.heroku.com/).

## Requirements

You can self-host this bot or deploy it on a service like [Heroku](https://www.heroku.com/) for example. If you do decide to self-host, you'll need to install the following:

* [git](https://git-scm.com/)
* [node.js](https://nodejs.org/en/) *(Up to version 10, tested using Node 10.13.0)*

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

This version of the bot will have some issues when hosting it from Heroku because it uses an embedded realm database. When using Heroku, the realm file will be deleted every time the Heroku dyno goes to sleep.

The `master` branch contains a version that uses MongoDB instead, you can use that to deploy to Heroku.

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
