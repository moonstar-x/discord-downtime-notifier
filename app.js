const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./settings.json');

let listenBot, messageChannel;

client.on('ready', () => {
  listenBot = client.guilds.get(process.env.SERVER_ID || config.server_id).members.get(process.env.BOT_ID || config.listen_bot_id);
  messageChannel = client.channels.get(process.env.CHANNEL_ID || config.notify_channel_id);

  if (!listenBot.user.bot) {
    throw new Error('Specified user is not a bot. Make sure the "listen_bot_id" under the settings.json file has the correct bot id.');
  }

  client.user.setPresence({
    game: {
      name: `${listenBot.nickname}`,
      type: 'LISTENING'
    }
  });

  console.log('Service started.');
  console.log(`Listening to bot: ${listenBot.nickname}`);
  console.log(`Will send messages to the ${messageChannel.name} channel.`);
});

client.on('presenceUpdate', (oldMember, newMember) => {
  if (oldMember.id === config.listen_bot_id) {
    let oldStatus = oldMember.presence.status;
    let newStatus = newMember.presence.status;
    if (oldStatus === 'online' && newStatus === 'offline') {
      messageChannel.send(`The bot ${listenBot} has gone offline.`);
    }
    // Bot could change from 'offline' to 'dnd'.
    if ((oldStatus !== 'online') && newStatus === 'online') {
      messageChannel.send(`The bot ${listenBot} is now online.`);
    }
    console.log(`Status changed for ${listenBot.nickname} from ${oldStatus} to ${newStatus}!`);
  }
});

client.login(process.env.DISCORD_TOKEN || config.discord_token);