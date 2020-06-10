const getGuildEntryMessage = (storedGuild, prefix) => {
  if (!storedGuild || !storedGuild.channel) {
    return `a broadcasting text channel is yet to be defined. You can define one by running **${prefix}channel** and mentioning the text channel you want to set.`;
  } else if (Object.keys(storedGuild.trackedBots).length < 1) {
    return 'there are no bots in the list.';
  }
};

module.exports = {
  name: 'list',
  description: 'List the bots that are currently in the being listened to.',
  emoji: ':notepad_spiral:',
  requiredPermissions: null,
  execute(message, options) {
    const { mongo, prefix } = options;
    mongo.getGuild(message.guild.id)
      .then(guild => {
        const storedGuildMessage = getGuildEntryMessage(guild, prefix);
        if (storedGuildMessage) {
          message.reply(storedGuildMessage);
          return;
        }

        const storedBotsInGuild = Object.keys(guild.trackedBots).reduce((botsFromGuild, key) => {
          const currentID = guild.trackedBots[key].id;
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

        mongo.removeExtraneousEntries(storedBotsInGuild.extraneousIDs, message.guild);

        message.reply(`the list contains: ${storedBotsInGuild.storedBots.join(' ')}.`);
      })
      .catch(error => {
        throw error;
      });
  }
};
