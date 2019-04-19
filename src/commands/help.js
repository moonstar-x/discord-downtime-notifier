const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show a help message with the available commands.',
  emoji: ':question:',
  requiredPermissions: null,
  execute(message, options) {
    // Since there will be only about 4 commands, we can safely assume the helpMessage won't go over 1024 characters (DiscordAPI limit).
    let helpMessage = "";
    for (const command of options.commands) {
      helpMessage = helpMessage.concat('\n', `${command[1].emoji} **${options.config.prefix}${command[1].name}** - ${command[1].description}`);
    }

    const embed = new MessageEmbed()
      .setTitle('Downtime Notifier Help')
      .setColor('#ffcb5c')
      .setThumbnail('https://i.imgur.com/Tqnk48j.png')
      .addField('List of available commands:', helpMessage)
      .addField('Spotted a bug?', 
      "This bot is far from perfect, so in case you found a bug, \
      please report it in this bot's [**GitHub Issues Page**](https://github.com/moonstar-x/discord-downtime-notifier/issues).");
    
    message.channel.send(embed);
  }
}