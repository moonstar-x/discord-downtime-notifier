const { Logger } = require('logger');
const logger = new Logger();

module.exports = {
  name: 'add',
  description: 'Add a new bot to the downtime check list.',
  emoji: ':heavy_plus_sign: ',
  requiredPermissions: 'ADMINISTRATOR',
  execute(message, options) {
    const realmEntry = options.realm.objects('Guilds').filtered(`id = "${message.guild.id}"`);

    // Check if guild entry exists in realm.
    if (realmEntry.length == 0) {
      message.reply(`a broadcasting text channel is yet to be defined. You can define one by running **${options.config.prefix}channel** and mentioning the text channel you want to set.`);
      return;
    }

    // Check if there's a channel entry in realm.
    if (!realmEntry[0].channel) {
      message.reply(`before adding any bots, you need to define in which channel I should send the notifications. Please define the broadcasting text channel with **${options.config.prefix}channel** and mention the text channel you want to set.`);
      return;
    }

    // Check if argument is empty.
    if (!options.args[0]) {
      message.reply(`to add a bot to the list, use **${options.config.prefix}add** and mention the bot you want to add.`);
      return;
    }

    // Check if argument is a valid id.
    const numberRegex = /[^0-9]+/gi;
    const botID = options.args[0].replace(numberRegex, '');

    // Argument empty after applying regex. (If it had only letters.)
    if (!botID) {
      message.reply('the mentioned user is not in this server.');
      return;
    }

    const newBot = message.guild.members.filter( user => user.id == botID).first();

    // Undefined if user is not on guild.
    if (!newBot) {
      message.reply('the mentioned user is not in this server.');
      return;
    }

    // Here, newBot exists and is GuildMember
    // Check if user is a bot.
    if (!newBot.user.bot) {
      message.reply(`the user ${newBot} is not a bot. You can only add bots to this list.`);
      return;
    }

    // Here, newBot is in fact, a bot.
    // Since we've arrived here, realmEntry does represent the guild entry in the realm.
    // Check if botID is already in the realm list.
    const storedBotID = realmEntry[0].listening.find( entry => entry == botID);
    if (storedBotID) {
      message.reply(`the bot ${newBot} is already in the list.`);
      return;
    }

    // Here, botID is not in the realm list, we'll add it and then write to realm.
    options.realm.write( () => {
      realmEntry[0].listening.push(botID);
      logger.info(`(REALM): Written guild ${message.guild.name} list addition of ${newBot.displayName}.`);
      message.reply(`successfully added ${newBot} to the list.`);
    });
  }
}