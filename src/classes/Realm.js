const Realm = require('realm');
const { Logger } = require('logger');
const { BotSchema, GuildSchema } = require('../../data/model');

const logger = new Logger();

class RealmAdapter {
  constructor(client) {
    Realm.defaultPath = './data/guild_data.realm';
    this.realm = new Realm({ schema: [BotSchema, GuildSchema] });
    this.client = client;
  }

  // In case someone adds this bot to their server while it's offline,
  // or if someone removes this bot from their server.
  // Sync realm entries with current guilds.
  initializeRealm() {
    this.realm.write(() => {
      this.client.guilds.tap( guild => {
        this.realm.create('Guilds', {
          id: guild.id
        }, true);
      });
      logger.info('(REALM): Synced database with current guilds.');
    });
  }

  createGuild(guild) {
    this.realm.write(() => {
      this.realm.create('Guilds', {
        id: guild.id
      }, true);
      logger.info(`(REALM): Added entry for ${guild.name}.`);
    });
  }

  deleteGuild(guild) {
    this.realm.write(() => {
      const realmEntry = this.realm.objects('Guilds').filtered(`id = "${guild.id}"`);
      // TODO: for each member in listening, remove the entry of the bot.
      this.realm.delete(realmEntry);
      logger.info(`(REALM): Deleted entry for ${guild.name}.`);
    });
  }

  getGuild(id) {
    const receivedEntries = this.realm.objects('Guilds').filtered(`id = "${id}"`);
    return receivedEntries.length > 0 ? receivedEntries[0] : null;
  }

  setLastOnline(botMember) {
    this.realm.write(() => {
      const [realmEntry] = this.realm.objects('Guilds').filtered(`id = "${botMember.guild.id}"`);
      const realmBot = realmEntry.trackedBots.find(bot => bot.id === botMember.id);
      realmBot.lastOnline = Date.now();
    });
  }

  setBroadcastChannel(channel, guild) {
    this.realm.write(() => {
      this.realm.create('Guilds', {
        id: guild.id,
        channel: channel.id
      }, true);
      logger.info(`(REALM): Written guild ${guild.name} channel change to ${channel.name}.`);
    });
  }
}

module.exports = RealmAdapter;
