const { PERMISSIONS } = require('../common/constants');

const getGuildEntryMessage = (guild, channelStore, prefix) => {
  if (!guild) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }

  if (!guild.channel) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }

  const definedChannel = channelStore.cache.find((channel) => channel.id === guild.channel);
  if (!definedChannel) {
    return `the broadcasting channel stored in the database no longer exists. Please update it with **${prefix}channel** and mention the text channel you want to set.`;
  }

  return `the broadcasting channel is currently set to ${definedChannel}.`;
};

const parseChannelMention = (channelStore, channelMention) => {
  const numberRegex = /[^0-9]+/gi;
  const channelID = channelMention.replace(numberRegex, '');
  return channelStore.cache.find((channel) => channel.id === channelID);
};

const validateNewChannel = (newChannel) => {
  const result = {
    error: false,
    message: null
  };

  if (!newChannel) {
    result.error = true;
    result.message = 'text channel does not exist on server.';
  } else if (newChannel.type !== 'text' && newChannel.type !== 'news') {
    result.error = true;
    result.message = 'the specified channel is not a text channel.';
  }

  return result;
};

module.exports = {
  name: 'channel',
  description: 'Define the channel to broadcast the downtime messages. When using this command, mention the text channel you want to set.',
  emoji: ':loudspeaker:',
  requiredPermissions: PERMISSIONS.administrator,
  execute(message, options) {
    const { mongo, prefix } = options;
    const [channelMention] = options.args;

    if (!channelMention) {
      mongo.getGuild(message.guild.id)
        .then((storedGuild) => {
          message.reply(getGuildEntryMessage(storedGuild, message.guild.channels, prefix));
        })
        .catch((error) => {
          throw error;
        });
      return;
    }

    const newChannel = parseChannelMention(message.guild.channels, channelMention);
    const newChannelValidation = validateNewChannel(newChannel);
    if (newChannelValidation.error) {
      message.reply(newChannelValidation.message);
      return;
    }

    mongo.setBroadcastChannel(newChannel, message.guild);
    message.reply(`you've changed the broadcasting channel to ${newChannel}.`);
  }
};
