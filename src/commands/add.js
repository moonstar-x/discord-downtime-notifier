const { PERMISSIONS } = require('../common/constants');

const getEarlyErrorMessage = (guild, memberMention, prefix) => {
  if (!guild) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }

  if (!guild.channel) {
    return `before adding any bots, you need to define in which channel I should send the notifications. Please define the broadcasting text channel with **${prefix}channel** and mention the text channel you want to set.`;
  }

  if (!memberMention) {
    return `to add a bot to the list, use **${prefix}add** and mention the bot you want to add.`;
  }
};

const parseBotMention = (memberStore, memberMention) => {
  const numberRegex = /[^0-9]+/gi;
  const mentionedID = memberMention.replace(numberRegex, '');
  return memberStore.find(member => member.id === mentionedID);
};

const validateNewBot = (newBot, guild) => {
  const result = {
    error: false,
    message: null
  };

  if (!newBot) {
    result.error = true;
    result.message = 'the mentioned user is not in this server.';
  } else if (!newBot.user.bot) {
    result.error = true;
    result.message = `the user ${newBot} is not a bot. You can only add bots to this list.`;
  }

  const storedBotID = guild.trackedBots.find(entry => entry.id === newBot.id);
  if (storedBotID) {
    result.error = true;
    result.message = `the bot ${newBot} is already in the list.`;
  }

  return result;
};

module.exports = {
  name: 'add',
  description: 'Add a new bot to the downtime check list.',
  emoji: ':heavy_plus_sign: ',
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

        const newBot = parseBotMention(message.guild.members, memberMention);
        const newBotValidation = validateNewBot(newBot, guild);

        if (newBotValidation.error) {
          message.reply(newBotValidation.message);
          return;
        }

        mongo.addNewBot(newBot, message.guild);
        message.reply(`successfully added ${newBot} to the list.`);
      })
      .catch(error => {
        throw error;
      });
  }
};
