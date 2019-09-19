const { Client, Collection } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');
const appEvents = require('./events/appEvents');
const appHandlers = require('./events/handlers/app');
const Realm = require('./classes/Realm');

const token = process.env.DISCORD_TOKEN || require('../config/settings.json').discord_token;

const client = new Client();
client.commands = new Collection();
const realm = new Realm(client);

const commandFiles = fs.readdirSync(path.join(__dirname, '/commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(__dirname, '/commands', file));
  client.commands.set(command.name, command);
}

client.on(appEvents.disconnect, (event) => appHandlers.handleDisconnect(event));
client.on(appEvents.error, (error) => appHandlers.handleError(error));
client.on(appEvents.guildCreate, (guild) => appHandlers.handleGuildCreate(guild, realm));
client.on(appEvents.guildDelete, (guild) => appHandlers.handleGuildDelete(guild, realm));
client.on(appEvents.guildUnavailable, (guild) => appHandlers.handleGuildUnavailable(guild));
client.on(appEvents.message, (message) => appHandlers.handleMessage(message, realm));
client.on(appEvents.presenceUpdate, (oldMember, newMember) => appHandlers.handlePresenceUpdate(oldMember, newMember, realm));
client.on(appEvents.ready, () => appHandlers.handleReady(realm));
client.on(appEvents.reconnecting, () => appHandlers.handleReconnecting());
client.on(appEvents.resume, () => appHandlers.handleResume());
client.on(appEvents.warn, (info) => appHandlers.handleReady(info));

if (process.argv[2] === '--debug') {
  client.on(appEvents.debug, (info) => appHandlers.debug(info));
}

client.login(token);