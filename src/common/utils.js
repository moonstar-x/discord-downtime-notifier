const { Logger } = require('logger');
const { ACTIVITY_TYPE, PRESENCE_STATUS, MESSAGE_SEND_ERRORS } = require('./constants');

const prefix = process.env.PREFIX || require('../../config/settings.json').prefix;

const logger = new Logger();

/**
 * Updates the presence of the Discord bot.
 * @param {Discord.Client} client The Discord client to update the presence.
 * @returns {void}
 */
const updatePresence = (client) => {
  const presence = `${client.guilds.size} servers!`;
  client.user.setPresence({
    game: {
      name: presence,
      status: ACTIVITY_TYPE.listening
    }
  }).then(() => {
    logger.info(`Presence updated to: ${presence}`);
  }).catch((err) => {
    logger.error(err);
  });
};

/**
 * Executes the specified command.
 * @param {Discord.Client} client The client instance of the bot.
 * @param {Discord.Message} message The message object that triggered this method.
 * @param {Object} options The object containing the data that the command may need.
 * @param {String} commandName The name of the command being run.
 * @returns {void}
 */
const executeCommand = (client, message, options, commandName) => {
  const author = message.guild ? message.member.displayName : message.author.username;
  const origin = message.guild ? message.guild.name : `DM with ${author}`;

  const command = client.commands.get(commandName);
  if (!command) return;

  const { requiredPermissions } = command;

  if (!requiredPermissions || message.member.hasPermission(requiredPermissions)) {
    try {
      logger.info(`User ${author} issued command ${commandName} in ${origin}.`);
      command.execute(message, options);
    } catch (err) {
      logger.error(err);
      message.reply("there's been a problem executing your command.");
    }
  } else {
    message.reply('only **Administrators** can execute this command.');
  } 
};

const formatTimeDelta = (millis) => {
  const totalTime = Math.floor(millis / 1000);
  const days = Math.floor(totalTime / (60 * 60 * 24));
  const hours = Math.floor(totalTime / (60 * 60)) % 24;
  const minutes = Math.floor(totalTime / 60) % 60;
  const seconds = totalTime % 60;

  const time = {
    days,
    hours,
    minutes,
    seconds
  }

  const result = Object.keys(time).reduce((timeString, key) => {
    if (time[key]) {
      timeString += `${time[key]} ${key} `;
    }
    return timeString;
  }, '');
  
  return result.trim();
};

const broadcastBotStatusChange = (updatedBot, { old: oldStatus, new: newStatus }, realmGuild, realm) => {
  let messageToSend = '';

  if (oldStatus === PRESENCE_STATUS.online && newStatus === PRESENCE_STATUS.offline) {
    realm.setLastOnline(updatedBot, realmGuild, Date.now());
    messageToSend = `The bot ${updatedBot} has gone offline.`;
  } else if (oldStatus !== PRESENCE_STATUS.online && newStatus === PRESENCE_STATUS.online) {
    const storedBot = realmGuild.trackedBots.find(bot => bot.id === updatedBot.id);

    if (storedBot.lastOnline) {
      const offlineTime = Date.now() - storedBot.lastOnline;
      realm.setLastOnline(updatedBot, realmGuild, null);
      messageToSend = `The bot ${updatedBot} is now online. It has been offline for ${formatTimeDelta(offlineTime)}.`;
    } else {
      messageToSend = `The bot ${updatedBot} is now online.`;
    }
  }

  const channel = realm.client.channels.find(channel => channel.id === realmGuild.channel);
  channel.send(messageToSend)
    .catch(error => {
      const { displayName: botName, guild: { name: guildName } } = updatedBot;
      if (error === MESSAGE_SEND_ERRORS.unknown) {
        updatedBot.guild.owner.send(`The bot **${botName}** in the server **${guildName}** has changed its status but I couldn't send a message to the channel you set-up previously. It has probably been deleted. Please, change the broadcasting channel in **${guildName}** with **${prefix}channel** and mention the channel you want to set-up.`);
      } else if (error === MESSAGE_SEND_ERRORS.permissions) {
        updatedBot.guild.owner.send(`The bot **${botName}** in the server **${guildName}** has changed its status but I couldn't send a message to the channel you set-up previously because I don't have permissions to send messages there. Please, allow me to send messages in the set channel or change the broadcasting channel in **${guildName}** with **${prefix}channel** and mention the channel you want to set-up.`);
      } else {
        updatedBot.guild.owner.send(`The bot **${botName}** in the server **${guildName}** has changed its status but I couldn't send a message to the channel you set-up because something unexpected went wrong.`);
        logger.error(`Something went wrong when handling ${guildName}'s ${botName} presence update.`);
        logger.error(error);
      }
    });
};

module.exports = {
  updatePresence,
  executeCommand,
  formatTimeDelta,
  broadcastBotStatusChange
};