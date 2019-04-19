const { Logger } = require('logger');
const logger = new Logger();

module.exports = {
  name: 'remove',
  description: 'Remove a bot from the downtime check list.',
  emoji: ':x:',
  requiredPermissions: 'ADMINISTRATOR',
  execute(message, options) {
    const realmEntry = options.realm.objects('Guilds').filtered(`id = "${message.guild.id}"`);

    // Check if guild entry exists in realm.
    if (realmEntry.length == 0) {
      message.reply(`a broadcasting text channel is yet to be defined. You can define one by running **${options.config.prefix}channel** and mentioning the text channel you want to set.`);
      return;
    }

    // Check if argument is empty.
    if (!options.args[0]) {
      message.reply(`to remove a bot from the list, use **${options.config.prefix}remove** and mention the bot you want to remove.`);
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

    const botToRemove = message.guild.members.filter( user => user.id == botID).first();

    // Undefined if user is not on guild.
    if (!botToRemove) {
      message.reply('the mentioned user is not in this server.');
      return;
    }

    // Here, botToRemove exists and is GuildMember (a bot, since we were able to add it in the first place).
    // Since we arrived here, realmEntry does represent the guild entry in the realm.
    // Check if botID is already in the realm list.
    // For this, we'll try to look for the index of the id in the array, if it doesn't exist, we can terminate the command.
    const botToRemoveIndex = realmEntry[0].listening.findIndex( entry => entry == botID)
    if (botToRemoveIndex < 0) {
      message.reply(`the bot ${botToRemove} is not in the list.`);
      return;
    }

    // Here, botID is in the realm list, now we can delete it.
    options.realm.write( () => {
      realmEntry[0].listening.splice(botToRemoveIndex, 1);
      logger.info(`(REALM): Written guild ${message.guild.name} list deletion of ${botToRemove.displayName}.`);
      message.reply(`successfully removed ${botToRemove} from the list.`);
    }); 
  }
}