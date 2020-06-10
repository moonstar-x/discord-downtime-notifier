const { Client, Collection } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const Mongo = require('./classes/Mongo');
const appEvents = require('./events/app');
const appHandlers = require('./events/handlers/app');
const token = process.env.DISCORD_TOKEN || require('../config/settings.json').discord_token;

const client = new Client();
client.commands = new Collection();
const mongo = new Mongo(client);

const commandFiles = fs.readdirSync(path.join(__dirname, '/commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(__dirname, '/commands', file));
  client.commands.set(command.name, command);
}

client.on(appEvents.error, appHandlers.handleError);
client.on(appEvents.guildCreate, (guild) => appHandlers.handleGuildCreate(guild, mongo));
client.on(appEvents.guildDelete, (guild) => appHandlers.handleGuildDelete(guild, mongo));
client.on(appEvents.guildUnavailable, appHandlers.handleGuildUnavailable);
client.on(appEvents.guildMemberRemove, (member) => appHandlers.handleMemberDelete(member, mongo));
client.on(appEvents.invalidated, appHandlers.handleInvalidated);
client.on(appEvents.message, (message) => appHandlers.handleMessage(message, mongo));
client.on(appEvents.presenceUpdate, (oldMember, newMember) => appHandlers.handlePresenceUpdate(oldMember, newMember, mongo));
client.on(appEvents.ready, () => appHandlers.handleReady(mongo));
client.on(appEvents.warn, appHandlers.handleReady);

if (process.argv[2] === '--debug') {
  client.on(appEvents.debug, appHandlers.handleDebug);
}

client.login(token);
