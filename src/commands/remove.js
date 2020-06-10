const { PERMISSIONS } = require('../common/constants');

const getEarlyErrorMessage = (guild, memberMention, prefix) => {
  if (!guild) {
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

const validateBotBeforeRemoving = (botToRemove, guild) => {
  const result = {
    error: false,
    message: null,
  };

  const indexToRemove = guild.trackedBots.findIndex(entry => entry.id === botToRemove.id);

  if (!botToRemove) {
    result.error = true;
    result.message = 'the mentioned user is not in this server.';
  } else if (indexToRemove < 0) {
    result.error = true;
    result.message = `the user ${botToRemove} is not in the list.`;
  }

  return result;
};

module.exports = {
  name: 'remove',
  description: 'Remove a bot from the downtime check list.',
  emoji: ':x:',
  requiredPermissions: PERMISSIONS.administrator,
  execute(message, options) {
    const { mongo, prefix } = options;
    const [memberMention] = options.args;

    mongo.getGuild(message.guild.id)
      .then(guild => {
        const earlyErrorMessage = getEarlyErrorMessage(guild, memberMention, prefix);
        if (earlyErrorMessage) {
          message.reply(earlyErrorMessage);
          return;
        }

        const botToRemove = parseBotMention(message.guild.members, memberMention);
        const botToRemoveValidation = validateBotBeforeRemoving(botToRemove, guild);

        if (botToRemoveValidation.error) {
          message.reply(botToRemoveValidation.message);
          return;
        }

        mongo.removeBot(botToRemove, message.guild);
        message.reply(`successfully removed ${botToRemove} from the list.`);
      })
      .catch(error => {
        throw error;
      });
  }
};
