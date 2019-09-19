const { Logger } = require('logger');
const { ACTIVITY_TYPE, PRESENCE_STATUS } = require('./constants'); 

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
      console.error(err);
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
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  }

  let result = "";
  for (const delta in time) {
    if (time[delta]) result = result.concat(' ', `${time[delta]} ${delta}`);
  }
  return result.trim();
};

const broadcastBotStatusChange = (updatedBot, { old: oldStatus, new: newStatus }, realmGuild, realm) => {
  let messageToSend = null;

  if (oldStatus == PRESENCE_STATUS.online && newStatus == PRESENCE_STATUS.offline) {
    realm.setLastOnline(updatedBot);
    messageToSend = `The bot ${updatedBot} has gone offline.`;
  } else if (oldStatus != PRESENCE_STATUS.online && newStatus == PRESENCE_STATUS.online) {
    if (/*bot has lastOnline time*/true) {
      // calculate time difference
      // delete lastOnline entry
      messageToSend = `The bot ${updatedBot} is now online. It has been offline for ${formatTimeDelta(offlineTime)}.`;
    } else {
      messageToSend = `The bot ${updatedBot} is now online.`;
    }
  }

  const channel = realm.client.channels.find(realmGuild.channel);
  channel.send(messageToSend)
    .catch(error => {
      if (error == 'DiscordAPIError: Unknown Channel') {
        updatedBot.guild.owner.send(`The bot **${updatedBot.displayName}** in the server **${updatedBot.guild.name}** has changed its status but I couldn't send a message to the channel you set-up previously. It has probably been deleted. Please, change the broadcasting channel in **${member.guild.name}** with **${config.prefix}channel** and mention the channel you want to set-up.`);
      } else if (error == 'DiscordAPIError: Missing Permissions') {
        updatedBot.guild.owner.send(`The bot **${updatedBot.displayName}** in the server **${updatedBot.guild.name}** has changed its status but I couldn't send a message to the channel you set-up previously because I don't have permissions to send messages there. Please, allow me to send messages in the set channel or change the broadcasting channel in **${member.guild.name}** with **${config.prefix}channel** and mention the channel you want to set-up.`);
      } else {
        updatedBot.guild.owner.send(`The bot **${updatedBot.displayName}** in the server **${updatedBot.guild.name}** has changed its status but I couldn't send a message to the channel you set-up because something unexpected went wrong.`);
        logger.error(`Something went wrong when handling ${updatedBot.guild.name}'s ${updatedBot.displayName} presence update.`);
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