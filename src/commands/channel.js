const { Logger } = require('logger');
const logger = new Logger();

module.exports = {
  name: 'channel',
  description: 'Define the channel to broadcast the downtime messages. When using this command, mention the text channel you want to set.',
  emoji: ':loudspeaker:',
  requiredPermissions: 'ADMINISTRATOR',
  execute(message, options) {
    // Check if argument is empty.
    if (!options.args[0]) {
      // Check if there's a guild realm entry.
      const realmEntry = options.realm.objects('Guilds').filtered(`id = "${message.guild.id}"`);
      if (realmEntry.length == 0) {
        message.reply(`a broadcasting text channel is yet to be defined. You can define one by running **${options.config.prefix}channel** and mentioning the text channel you want to set.`);
      } else {
        // Check if there's a channel realm entry.
        if (!realmEntry[0].channel) {
          message.reply(`a broadcasting text channel is yet to be defined. You can define one by running **${options.config.prefix}channel** and mentioning the text channel you want to set.`);
          return;
        }

        const definedChannel = message.guild.channels.find( channel => channel.id == realmEntry[0].channel);

        // If for some reason, the definedChannel ends up being null (if the server deletes the channel previously set).
        if (!definedChannel) {
          message.reply(`the broadcasting channel stored in the database no longer exists. Please update it with **${options.config.prefix}channel** and mention the text channel you want to set.`);
          return;
        }

        message.reply(`the broadcasting channel is currently set to ${definedChannel}.`);
      }
      return;
    }

    // Check if argument is a valid id.
    const numberRegex = /[^0-9]+/gi;
    const textChannel = options.args[0].replace(numberRegex, '');

    // Argument empty after applying regex. (If it had only letters.)
    if (!textChannel) {
      message.reply('text channel does not exist on server.');
      return;
    }

    const newChannel = message.guild.channels.filter( channel => channel.id == textChannel ).first();

    // Undefined if channel is not found.
    if (!newChannel) {
      message.reply('text channel does not exist on server.')
      return;
    }
    
    // Here, newChannel exists and is GuildChannel.
    // Check if channel is text channel.
    if (!newChannel.type == 'text') {
      message.reply('the specified channel is not a text channel.');
      return;
    }

    // Check if the bot can access the text channel.
    if (!newChannel.viewable) {
      message.reply(`I can't see the ${newChannel} text channel. Maybe I don't have permissions to access it?`);
      return;
    }

    // Here, newChannel is a text channel and is viewable by the bot.
    // Here, we're creating the guild entry if it didn't exist and updating it.
    // This way, this command is in a way, mandatory, before adding any bots to the list.
    options.realm.write( () => {
      options.realm.create('Guilds', {
        id: message.guild.id,
        channel: newChannel.id
      }, true);
      logger.info(`(REALM): Written guild ${message.guild.name} channel change to ${newChannel.name}.`);
      message.reply(`you've changed the broadcasting channel to ${newChannel}.`)
    });
  }
}