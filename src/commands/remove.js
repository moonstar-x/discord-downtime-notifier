const { PERMISSIONS } = require('../common/constants');

const getEarlyErrorMessage = (realmGuild, memberMention, prefix) => {
  if (!realmGuild) {
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

const validateBotBeforeRemoving = (botToRemove, realmGuild) => {
  const result = {
    error: false,
    message: null,
    indexToRemove: -1
  };

  const indexToRemove = realmGuild.trackedBots.findIndex(entry => entry.id === botToRemove.id);

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
    const realmGuild = realm.getGuild(message.guild.id);

    const earlyErrorMessage = getEarlyErrorMessage(realmGuild, memberMention, prefix);
    if (earlyErrorMessage) {
      message.reply(earlyErrorMessage);
      return;
    }

    const botToRemove = parseBotMention(message.guild.members, memberMention);
    const botToRemoveValidation = validateBotBeforeRemoving(botToRemove, realmGuild);

    if (botToRemoveValidation.error) {
      message.reply(botToRemoveValidation.message);
      return;
    }

    const { indexToRemove } = botToRemoveValidation;
    realm.removeBot(indexToRemove, realmGuild, message.guild, botToRemove);
    message.reply(`successfully removed ${botToRemove} from the list.`);
  }
}