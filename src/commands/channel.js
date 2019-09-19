const { PERMISSIONS } = require('../common/constants');

const getRealmEntryMessage = (realmEntry, message, prefix) => {
  if (!realmEntry) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }

  if (!realmEntry.channel) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  }

  const definedChannel = message.guild.channels.find(channel => channel.id === realmEntry.channel);
  if (!definedChannel) {
    return `the broadcasting channel stored in the database no longer exists. Please update it with **${prefix}channel** and mention the text channel you want to set.`;
  }

  return `the broadcasting channel is currently set to ${definedChannel}.`;
};

const parseChannelMention = (channelStore, channelMention) => {
  const numberRegex = /[^0-9]+/gi;
  const channelID = channelMention.replace(numberRegex, '');
  return channelStore.find(channel => channel.id === channelID);
};

const validateNewChannel = (newChannel) => {
  const result = {
    error: false,
    message: null
  };

  if (!newChannel) {
    result.error = true;
    result.message = 'text channel does not exist on server.';
  } else if (!newChannel.type === 'text') {
    result.error = true;
    result.message = 'the specified channel is not a text channel.';
  }

  return result;
}

module.exports = {
  name: 'channel',
  description: 'Define the channel to broadcast the downtime messages. When using this command, mention the text channel you want to set.',
  emoji: ':loudspeaker:',
  requiredPermissions: PERMISSIONS.administrator,
  execute(message, options) {
    const { realm, prefix } = options;
    const [channelMention] = options.args;

    if (!channelMention) {
      const realmEntry = realm.getGuild(message.guild.id);
      message.reply(getRealmEntryMessage(realmEntry, message, prefix));
      return;
    }

    const newChannel = parseChannelMention(message.guild.channels, channelMention);
    const newChannelValidation = validateNewChannel(newChannel);
    if (newChannelValidation.error) {
      message.reply(newChannelValidation.message);
      return;
    }

    realm.setBroadcastChannel(newChannel, message.guild);
    message.reply(`you've changed the broadcasting channel to ${channel}.`);
  }
}