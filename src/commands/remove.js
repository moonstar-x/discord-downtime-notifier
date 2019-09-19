const { PERMISSIONS } = require('../common/constants');

const getEarlyErrorMessage = (realmEntry, memberMention, prefix) => {
  if (!realmEntry) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }
  if (!memberMention) {
    return `to remove a bot from the list, use **${prefix}remove** and mention the bot you want to remove.`;
  }
};

const parseBotMention = (memberStore, memberMention) => {
  const numberRegex = /[^0-9]+/gi;
  const mentionedID = memberMention.replace(numberRegex, '');
  return memberStore.find(member => member.id === mentionedID);
};

const validateBotBeforeRemoving = (botToRemove, realmEntry) => {
  const result = {
    error: false,
    message: null,
    indexToRemove: -1
  };

  const indexToRemove = realmEntry.trackedBots.findIndex(entry => entry.id === botToRemove.id);

  if (!botToRemove) {
    result.error = true;
    result.message = 'the mentioned user is not in this server.';
  } else if (indexToRemove < 0) {
    result.error = true;
    result.message = `the user ${botToRemove} is not in the list.`;
  }
  result.indexToRemove = indexToRemove;

  return result;
}

module.exports = {
  name: 'remove',
  description: 'Remove a bot from the downtime check list.',
  emoji: ':x:',
  requiredPermissions: PERMISSIONS.administrator,
  execute(message, options) {
    const { realm, prefix } = options;
    const [memberMention] = options.args;
    const realmEntry = realm.getGuild(message.guild.id);

    const earlyErrorMessage = getEarlyErrorMessage(realmEntry, memberMention, prefix);
    if (earlyErrorMessage) {
      message.reply(earlyErrorMessage);
      return;
    }

    const botToRemove = parseBotMention(message.guild.members, memberMention);
    const botToRemoveValidation = validateBotBeforeRemoving(botToRemove, realmEntry);

    if (botToRemoveValidation.error) {
      message.reply(botToRemoveValidation.message);
      return;
    }

    const { indexToRemove } = botToRemoveValidation;
    realm.removeBot(indexToRemove, realmEntry, message.guild, botToRemove);
    message.reply(`successfully removed ${botToRemove} from the list.`);
  }
}