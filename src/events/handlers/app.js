const logger = require('@greencoast/logger');
const { updatePresence, executeCommand, broadcastBotStatusChange } = require('../../common/utils');
const prefix = process.env.PREFIX || require('../../../config/settings.json').prefix;

const handleDebug = (info) => {
  logger.debug(info);
};

const handleError = (error) => {
  logger.error(error);
};

const handleGuildCreate = (guild, mongo) => {
  logger.info(`Joined the guild ${guild.name}!`);
  updatePresence(mongo.client);
  mongo.createGuild(guild);
};

const handleGuildDelete = (guild, mongo) => {
  logger.info(`Left the guild ${guild.name}!`);
  updatePresence(mongo.client);
  mongo.deleteGuild(guild);
};

const handleGuildUnavailable = (guild) => {
  logger.warn(`Guild ${guild.name} is currently unavailable!`);
};

const handleMemberDelete = (member, mongo) => {
  mongo.getGuild(member.guild.id)
    .then((guild) => {
      if (!guild) {
        return;
      }

      const shouldMemberBeDeleted = guild.trackedBots.some(bot => bot.id === member.id);

      if (!shouldMemberBeDeleted) {
        return;
      }

      mongo.removeBot(member, member.guild);
    })
    .catch((error) => {
      throw error;
    });
};

const handleInvalidated = () => {
  logger.fatal('Client connection invalidated, terminating execution with code 1.');
  process.exit(1);
};

const handleMessage = (message, mongo) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const options = {
    args,
    commands: mongo.client.commands,
    prefix,
    mongo
  };

  executeCommand(mongo.client, message, options, command);
};

const handlePresenceUpdate = (oldMember, newMember, mongo) => {
  const status = {
    old: oldMember.presence.status,
    new: newMember.presence.status
  };

  if (status.old === status.new) {
    return;
  }

  mongo.getGuild(newMember.guild.id)
    .then(guild => {
      if (!guild) {
        return;
      }

      const isBotTracked = guild.trackedBots.some(bot => bot.id === newMember.id);
      if (!isBotTracked) {
        return;
      }

      broadcastBotStatusChange(newMember, status, guild, mongo);
    })
    .catch(error => {
      throw error;
    });
};

const handleReady = (mongo) => {
  logger.info('Connected to Discord! - Ready.');
  updatePresence(mongo.client);
  mongo.initializeMongo();
};

const handleWarn = (info) => {
  logger.warn(info);
};

module.exports = {
  handleDebug,
  handleError,
  handleGuildCreate,
  handleGuildDelete,
  handleMemberDelete,
  handleGuildUnavailable,
  handleInvalidated,
  handleMessage,
  handlePresenceUpdate,
  handleReady,
  handleWarn
};
