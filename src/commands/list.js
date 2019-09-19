const getRealmEntryMessage = (realmGuild, prefix) => {
  if (!realmGuild || !realmGuild.channel) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  } else if (Object.keys(realmGuild.trackedBots).length < 1) {
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
    const realmGuild = realm.getGuild(message.guild.id);
    
    const realmGuildMessage = getRealmEntryMessage(realmGuild, prefix);
    if (realmGuildMessage) {
      message.reply(realmGuildMessage);
      return;
    }

    const storedBotsInGuild = Object.keys(realmGuild.trackedBots).reduce((botsFromGuild, key) => {
      const currentID = realmGuild.trackedBots[key].id;
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

    realm.removeExtraneousEntries(storedBotsInGuild.extraneousIDs, realmGuild, message.guild);

    message.reply(`the list contains: ${storedBotsInGuild.storedBots.join(' ')}.`);
  }
}