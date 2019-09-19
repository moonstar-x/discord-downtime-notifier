const getRealmEntryMessage = (realmEntry, prefix) => {
  if (!realmEntry || !realmEntry.channel) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  } else if (Object.keys(realmEntry.trackedBots).length < 1) {
    return 'there are no bots in the list.';
  }
};

module.exports = {
  name: 'list',
  description: 'List the bots that are currently in the being listened to.',
  emoji: ':notepad_spiral:',
  requiredPermissions: null,
  execute(message, options) {
    const { realm, prefix } = options;
    const realmEntry = realm.getGuild(message.guild.id);
    
    const realmEntryMessage = getRealmEntryMessage(realmEntry, prefix);
    if (realmEntryMessage) {
      message.reply(realmEntryMessage);
      return;
    }

    const storedBotsInGuild = Object.keys(realmEntry.trackedBots).reduce((botsFromGuild, key) => {
      const currentID = realmEntry.trackedBots[key].id;
      const foundBot = message.guild.members.find(member => member.id === currentID);
      if (foundBot) {
        botsFromGuild.storedBots.push(foundBot);
      } else {
        botsFromGuild.extraneousIDs.push(currentID);
      }
      return botsFromGuild;
    }, {
      storedBots: [],
      extraneousIDs: []
    });

    realm.removeExtraneousEntries(storedBotsInGuild.extraneousIDs, realmEntry, message.guild);

    message.reply(`the list contains: ${storedBotsInGuild.storedBots.join(' ')}.`);
  }
}