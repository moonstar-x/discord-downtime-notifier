const { Logger } = require('logger');
const { updatePresence, executeCommand, broadcastBotStatusChange } = require('../../common/utils');

const prefix = process.env.PREFIX || require('../../../config/settings.json').prefix;

const logger = new Logger();

const handleDebug = (info) => {
  logger.debug(info);
};

const handleError = (error) => {
  logger.error(error);
};

const handleDisconnect = (event) => {
  logger.error(`The WebSocket connection has closed with code ${event.code} and won't try reconnect.`);
  logger.error(event.reason);
  process.exit(1);
};

const handleGuildCreate = (guild, realm) => {
  logger.info(`Joined ${guild.name} guild!`);
  updatePresence(realm.client);
  realm.createGuild(guild);
};

const handleGuildDelete = (guild, realm) => {
  logger.info(`Left ${guild.name} guild!`);
  updatePresence(realm.client);
  realm.deleteGuild(guild);
};

const handleGuildUnavailable = (guild) => {
  logger.warn(`Guild ${guild.name} is currently unavailable!`);
};

const handleMemberDelete = (member, realm) => {
  const realmGuild = realm.getGuild(member.guild.id);
  const storedBotIndex = realmGuild.trackedBots.findIndex(bot => bot.id === member.id);

  if (!storedBotIndex) {
    return;
  }

  realm.removeBot(storedBotIndex, realmGuild, member.guild, member);
};

const handleMessage = (message, realm) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const options = {
    args,
    commands: realm.client.commands,
    prefix,
    realm
  };

  executeCommand(realm.client, message, options, command);
};

const handlePresenceUpdate = (oldMember, newMember, realm) => {
  const status = {
    old: oldMember.presence.status,
    new: newMember.presence.status
  }

  if (status.old === status.new) return;

  const realmGuild = realm.getGuild(newMember.guild.id);
  if (!realmGuild) return;

  const updatedBotID = realmGuild.trackedBots.find(entry => entry.id === newMember.id);
  if (!updatedBotID) return;

  broadcastBotStatusChange(newMember, status, realmGuild, realm);
};

const handleReady = (realm) => {
  logger.info('Connected to Discord! - Ready.');
  updatePresence(realm.client);
  realm.initializeRealm();
};

const handleReconnecting = () => {
  logger.warn('Lost connection to the WebSocket. Attempting to reconnect...');
};

const handleResume = () => {
  logger.info('Connection to the WebSocket has been resumed.');
};

const handleWarn = (info) => {
  logger.warn(info);
};

module.exports = {
  handleDebug,
  handleError,
  handleDisconnect,
  handleGuildCreate,
  handleGuildDelete,
  handleMemberDelete,
  handleGuildUnavailable,
  handleMessage,
  handlePresenceUpdate,
  handleReady,
  handleReconnecting,
  handleResume,
  handleWarn
};