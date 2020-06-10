const { MessageEmbed } = require('discord.js');
const { MESSAGE_EMBED } = require('../common/constants');

module.exports = {
  name: 'help',
  description: 'Show a help message with the available commands.',
  emoji: ':question:',
  requiredPermissions: null,
  execute(message, options) {
    const { commands, prefix } = options;
    const helpMessage = commands.reduce((message, command) => {
      message += `${command.emoji} **${prefix}${command.name}** - ${command.description}\n`;
      return message;
    }, '');

    const embed = new MessageEmbed()
      .setTitle('Downtime Notifier Help')
      .setColor(MESSAGE_EMBED.color)
      .setThumbnail(MESSAGE_EMBED.thumbnail)
      .addField('List of available commands:', helpMessage)
      .addField('Spotted a bug?',
      `This bot is far from perfect, so in case you found a bug, please report it in this bot's [**GitHub Issues Page**](${MESSAGE_EMBED.issuesURL}).`);

    message.channel.send(embed);
  }
};
