const { Logger } = require('logger');
const logger = new Logger();

module.exports = {
  name: 'list',
  description: 'List the bots that are currently in the being listened to.',
  emoji: ':notepad_spiral:',
  requiredPermissions: null,
  execute(message, options) {
    const realmEntry = options.realm.objects('Guilds').filtered(`id = "${message.guild.id}"`);

    // Check if guild entry exists in realm.
    if (realmEntry.length == 0) {
      message.reply(`a broadcasting text channel is yet to be defined. You can define one by running **${options.config.prefix}channel** and mentioning the text channel you want to set.`);
      return;
    }

    // Check if listening list is empty.
    if (Object.keys(realmEntry[0].listening).length == 0) {
      message.reply('there are no bots in the list.');
      return;
    }

    // Here, we have a guild entry that has at least 1 entry in the listening list.
    let storedIDs = [];
    for (const index in realmEntry[0].listening) {
      storedIDs.push(realmEntry[0].listening[index]);
    }

    let storedBotMembers = [];
    message.member.guild.members
      .filter( user => storedIDs.includes(user.id))
      .each( user => storedBotMembers.push(user));

    // Check that every entry in the realm does correspond to a member in the guild.
    // If this check fails, it means that probably a bot that was previously added has been removed.
    if (storedIDs.length != storedBotMembers.length) {
      options.realm.write( () => {
        const fetchedIDs = storedBotMembers.map( user => user.id);
        for (const id of storedIDs) {
          const index = fetchedIDs.indexOf(id);
          if (index < 0) {
            realmEntry[0].listening.splice(index, 1);
            logger.warn(`(REALM): Removed extraneous bot entry in ${message.guild.name} with id ${id}.`);
          }
        }
      });
    }

    // storedBotMembers has GuildMember object of every bot, we can just send it as message.
    message.reply(`the list contains: ${storedBotMembers.join(' ')}.`);
  }
}