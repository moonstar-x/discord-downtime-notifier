const Discord = require('discord.js');
const client = new Discord.Client();
let config;

if (!process.env.DISCORD_TOKEN) {
  config = require('./settings.json');
}

let listenBot, listenBotName, messageChannel;
let timeSinceOffline = undefined;

client.on('ready', () => {
  listenBot = client.guilds.get(process.env.SERVER_ID || config.server_id).members.get(process.env.BOT_ID || config.listen_bot_id);
  messageChannel = client.channels.get(process.env.CHANNEL_ID || config.notify_channel_id);
  updatePresence(listenBot);

  if (!listenBot.user.bot) {
    throw new Error('Specified user is not a bot. Make sure the "listen_bot_id" under the settings.json file has the correct bot id.');
  }

  console.log('Service started.');
  console.log(`Listening to bot: ${listenBotName}`);
  console.log(`Will send messages to the ${messageChannel.name} channel.`);
});

client.on('presenceUpdate', (oldMember, newMember) => {
  if (oldMember.id === (process.env.BOT_ID || config.listen_bot_id)) {
    let oldStatus = oldMember.presence.status;
    let newStatus = newMember.presence.status;

    if (oldStatus === 'online' && newStatus === 'offline') {
      timeSinceOffline = Date.now();
      messageChannel.send(`The bot ${listenBot} has gone offline.`);
    }
    // Bot could change from 'offline' to 'dnd'.
    if ((oldStatus !== 'online') && newStatus === 'online') {
      if (timeSinceOffline) {
        let offlineTime = Date.now() - timeSinceOffline;
        messageChannel.send(`The bot ${listenBot} is now online. It has been offline for ${displayTime(offlineTime)}.`);
      } else {
        messageChannel.send(`The bot ${listenBot} is now online.`);
      } 
    }
    console.log(`Status changed for ${listenBotName} from ${oldStatus} to ${newStatus}!`);
  }
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.id === (process.env.BOT_ID || config.listen_bot_id)) {
    updatePresence(newMember);
    console.log(`Bot name has changed from ${oldMember.nickname || oldMember.user.username} to ${newMember.nickname || newMember.user.username}!`);
  }
});

client.login(process.env.DISCORD_TOKEN || config.discord_token);

function displayTime(millis) {
  const totalTime = Math.floor(millis / 1000);
  const days = Math.floor(totalTime / 86400);
  const hours = Math.floor(totalTime / 3600) % 24;
  const minutes = Math.floor(totalTime / 60) % 60;
  const seconds = totalTime % 60;

  let result = [];
  const timeArr = [days, 'days', hours, 'hours', minutes, 'minutes', seconds, 'seconds'];
  for (let i = 0; i < timeArr.length; i+=2) {
    if (timeArr[i] !== 0) {
      result.push(timeArr[i], timeArr[i + 1]);
    }
  }
  return result.join(' ');
}

function updatePresence(member) {
  listenBotName = member.nickname || member.user.username;
  client.user.setPresence({
    game: {
      name: `${listenBotName}`,
      type: 'LISTENING'
    }
  });
}