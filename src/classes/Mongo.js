const mongoose = require('mongoose');
const logger = require('@greencoast/logger');
const mongodbURI = process.env.MONGODB_URI || require('../../config/settings.json').mongodb_uri;
const mongoEvents = require('../events/mongo');
const mongoHandlers = require('../events/handlers/mongo');
const { GuildSchema }= require('../../data/schemas');
const { MONGO_ERROR_CODES } = require('../common/constants');

class MongoAdapter {
  constructor(client) {
    this.mongo = mongoose.createConnection(mongodbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    this.client = client;

    this.MongoGuild = this.mongo.model('Guild', GuildSchema);

    this.mongo.on(mongoEvents.connected, mongoHandlers.handleConnected);
    this.mongo.on(mongoEvents.connecting, mongoHandlers.handleConnecting);
    this.mongo.on(mongoEvents.disconnected, mongoHandlers.handleDisconnect);
    this.mongo.on(mongoEvents.error, (error) => mongoHandlers.handleError(error));
    this.mongo.on(mongoEvents.reconnected, mongoHandlers.handleReconnected);
  }

  initializeMongo() {
    this.client.guilds.cache.forEach((guild) => {
      this.createGuild(guild);
    });
  }

  createGuild(guild) {
    const mongoGuild = new this.MongoGuild({
      id: guild.id
    });

    mongoGuild.save((error) => {
      if (error) {
        if (error.code !== MONGO_ERROR_CODES.duplicate) {
          logger.error(error);
        }
        return;
      }
      logger.info(`(MONGO): Saved document for ${guild.name}.`);
    });
  }

  deleteGuild(guild) {
    this.MongoGuild.findOneAndDelete({
      id: guild.id
    }, (error) => {
      if (error) {
        logger.error(error);
        return;
      }
      logger.info(`(MONGO): Deleted document for ${guild.name}.`);
    });
  }

  getGuild(id) {
    return new Promise((resolve, reject) => {
      this.MongoGuild.findOne({
        id
      }, (error, fetchedGuild) => {
        if (error) {
          reject(error);
        }
        resolve(fetchedGuild);
      });
    });
  }

  setLastOnline(botMember, timestamp) {
    const { guild : { id: guildID, name: guildName }, displayName: botName, id: botID } = botMember;

    this.MongoGuild.findOne({
      id: guildID
    }, (error, fetchedGuild) => {
      if (error) {
        logger.error(`(MONGO): There was an error when trying to set lastOnline for ${botName} from ${guildName}.`, error);
        return;
      }

      const storedBot = fetchedGuild.trackedBots.find((bot) => bot.id === botID);
      storedBot.lastOnline = timestamp;

      fetchedGuild.save((error) => {
        if (error) {
          if (error.code !== MONGO_ERROR_CODES.duplicate) {
            logger.error(error);
          }
          return;
        }
        logger.info(`(MONGO): Updated lastOnline for ${botName} from ${guildName}.`);
      })
    });
  }

  setBroadcastChannel(channel, guild) {
    const { id: guildID, name: guildName } = guild;
    const { id: channelID, name: channelName } = channel;

    this.MongoGuild.findOneAndUpdate({
      id: guildID
    },{
      channel: channelID
    }, (error) => {
      if (error) {
        logger.error(`(MONGO): There was an error when trying to change the broadcasting channel for ${guildName}.`, error);
        return;
      }
      logger.info(`(MONGO): Updated broadcasting channel for ${guildName} to ${channelName}.`);
    });
  }

  addNewBot(newBot, guild) {
    const { id: botID, displayName: botName } = newBot;
    const { id: guildID, name: guildName } = guild;

    this.MongoGuild.findOne({
      id: guildID
    }, (error, fetchedGuild) => {
      if (error) {
        logger.error(`(MONGO): There was an error when trying to fetch the guild document for ${guildName}.`, error);
        return;
      }

      fetchedGuild.trackedBots.push({
        id: botID,
        lastOnline: null
      });

      fetchedGuild.save((error) => {
        if (error) {
          logger.error(`(MONGO): There was an error when trying to add ${botName} to the ${guildName} bots list.`, error);
          return;
        }
        logger.info(`(MONGO): Added ${botName} to the ${guildName} bots list.`);
      });
    });
  }

  removeExtraneousEntries(entries, guild) {
    const { id: guildID, name: guildName } = guild;

    this.MongoGuild.findOne({
      id: guildID
    }, (error, fetchedGuild) => {
      if (error) {
        logger.error(`(MONGO): There was an error when trying to fetch the guild document for ${guildName}.`, error);
        return;
      }

      const newTrackedBots = fetchedGuild.trackedBots.filter(storedBot => entries.indexOf(storedBot.id) < 0);
      if (newTrackedBots.length === fetchedGuild.trackedBots.length) {
        return;
      }
      fetchedGuild.trackedBots = newTrackedBots;

      fetchedGuild.save((error) => {
        if (error) {
          logger.error(`(MONGO): There was an error when trying to clean-up the tracked bots list for ${guildName}.`);
          return
        }
        logger.warn(`(MONGO): Removed extraneous entries from ${guildName} tracked bots list.`);
      });
    });
  }

  removeBot(botToRemove, guild) {
    const { id: botID, displayName: botName } = botToRemove;
    const { id: guildID, name: guildName } = guild;

    this.MongoGuild.findOne({
      id: guildID
    }, (error, fetchedGuild) => {
      if (error) {
        logger.error(`(MONGO): There was an error when trying to fetch the guild document for ${guildName}.`, error);
        return;
      }

      fetchedGuild.trackedBots = fetchedGuild.trackedBots.filter((storedBot) => storedBot.id !== botID);

      fetchedGuild.save((error) => {
        if (error) {
          logger.error(`(MONGO): There was an error when trying to remove ${botName} from ${guildName} tracked bots list.`, error);
          return;
        }
        logger.info(`(MONGO): Removed ${botName} from ${guildName} tracked bots list.`);
      });
    });
  }
}

module.exports = MongoAdapter;
