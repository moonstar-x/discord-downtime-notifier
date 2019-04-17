# Discord Downtime Notifier Bot

This is a small bot that notifies a server through a message when another bot goes offline. The main use is to let users know when a music bot goes offline and becomes unusable. It also lets users know once said bot goes back online. This is useful mostly for server owners with self-hosted bots and need a way of getting notified when they bots go offline. For better results, this bot should be hosted on a service like [Heroku](https://www.heroku.com/).

## Requirements

You can self-host this bot or deploy it on a service like [Heroku](https://www.heroku.com/) for example. If you do decide to self-host, you'll need to install the following:

* [git](https://git-scm.com/)
* [node.js](https://nodejs.org/en/)

## Installation

### Self-Hosting

In order to self-host this bot, you'll need to clone this repository.

    git clone https://github.com/moonstar-x/discord-downtime-notifier.git

Then, rename the file *settings.json.example* to *settings.json* and edit the values according to your server (server ID, channel ID, bot ID and bot token).

    {
      "discord_token": "YOUR_DISCORD_TOKEN",
      "server_id": "YOUR_SERVER_ID",
      "listen_bot_id": "YOUR_BOT_ID",
      "notify_channel_id": "YOUR_CHANNEL_ID"
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
| BOT_ID        | YOUR BOT ID HERE.            |
| CHANNEL_ID    | YOUR CHANNEL ID HERE.        |
| SERVER ID     | YOUR SERVER ID HERE.         |
| DISCORD_TOKEN | YOUR DISCORD BOT TOKEN HERE. |

*Copy the config var exactly as it is and only change your values.*

You can now go back to your app's *Overview*, make sure you disable the *web* dyno and enable the *bot* dyno. Your bot should now be up and running. Remember you can always check your bot's console if you access the *View Logs* in the *More* dropdown menu.

## Usage

On its current state, the bot does not have an *usage*, you simply turn it on and forget about it

## Author

This bot was made by [moonstar-x](https://github.com/moonstar-x).