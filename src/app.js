const { Client, Collection } = require('discord.js');
const { Logger } = require('logger');
const fs = require('fs');
const { model } = require('../data/model');
const Realm = require('realm');
const http = require('http');

Realm.defaultPath = './data/guild_data.realm';

const client = new Client();
const logger = new Logger();
const realm = new Realm({ schema: [model] });

let config = undefined;
if (process.env.DISCORD_TOKEN) {
  config = {
    discord_token: process.env.DISCORD_TOKEN,
    prefix: process.env.PREFIX
  }
} else {
  config = require('../config/settings.json');
}

client.commands = new Collection();

const commandFiles = fs.readdirSync(__dirname + '/commands').filter( file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

let timesSinceOffline = { };

function updatePresence(numOfGuilds) {
  client.user.setPresence({
    activity: {
      name: `${numOfGuilds} servers!`,
      type: 'LISTENING'
    }
  }).then( () => {
    logger.info(`Presence updated to: ${numOfGuilds} guild(s).`);
  }).catch( err => {
    logger.error(err);
  });
}

function formatTimeDelta(millis) {
  const totalTime = Math.floor(millis / 1000);
  const days = Math.floor(totalTime / (60 * 60 * 24));
  const hours = Math.floor(totalTime / (60 * 60)) % 24;
  const minutes = Math.floor(totalTime / 60) % 60;
  const seconds = totalTime % 60;

  const time = {
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  }

  let result = "";
  for (const delta in time) {
    if (time[delta]) result = result.concat(' ', `${time[delta]} ${delta}`);
  }
  return result.trim();
}

// In case someone adds this bot to their server while it's offline,
// or if someone removes this bot from their server.
// Sync realm entries with current guilds.
function initializeRealm() {
  realm.write( () => {
    let guilds = [];
    client.guilds.each( guild => guilds.push(guild));
    for (const guild of guilds) {
      realm.create('Guilds', {
        id: guild.id
      }, true);
      timesSinceOffline[guild.id] = {};
    }
    logger.info('(REALM): Synced database with current guilds.');
  });
}

// Used to keep the Heroku dyno alive.
function keepAlive() {
  setInterval( () => {
    const info = {
      host: 'discord-downtime-notifier.herokuapp.com',
      port: 80,
      path: '/'
    }
    http.get(info, _ => {
      logger.info(`Heroku keep alive...`);
    }).on('error', err => {
      logger.error(err)
    });
  }, 20 * 60 * 1000); // Load every 20 minutes.
}

client.on('ready', () => {
  logger.info('Connected to Discord! - Ready.');
  updatePresence(client.guilds.size);
  initializeRealm();
});

client.on('message', async message => {
  if (!message.guild || !message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  const options = {
    args: args,
    config: config,
    commands: client.commands,
    realm: realm
  }

  function executeCommand() {
    try {
      logger.info(`User ${message.member.displayName} from guild ${message.guild.name} issued command ${command}.`);
      client.commands.get(command).execute(message, options);
    } catch (err) {
      logger.error(err);
      message.reply("there's been a problem executing your command.");
    }
  }

  const requiredPermissions = client.commands.get(command).requiredPermissions;
  if (requiredPermissions) {
    if (message.member.hasPermission(requiredPermissions)) {
      executeCommand();
    } else {
      message.reply('only **Administrators** can execute this command.');
    }
  } else {
    executeCommand();
  }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Check if we're interested in this member's presenceUpdate.
  if (!oldPresence || oldPresence.status == newPresence.status) return;

  // Check if the member updating does correspond to one stored in the realm.
  const realmEntry = realm.objects('Guilds').filtered(`id = "${newPresence.guild.id}"`);

  // Check if realmEntry is empty, which means it does not correspond to a stored guild.
  if (realmEntry.length == 0) return;

  // Check if member is stored in the realmEntry.
  const id = realmEntry[0].listening.find( entry => entry == newPresence.userID);
  if (!id) return;

  // Fetch the GuildMember with id.
  const member = newPresence.guild.members.filter( member => member.id == id ).first();

  // Check status change.
  let messageToSend = undefined;
  if (oldPresence.status == 'online' && newPresence.status == 'offline') {
    timesSinceOffline[newPresence.guild.id][id] = Date.now();
    messageToSend = `The bot ${member} has gone offline.`;
  } else if (oldPresence.status != 'online' && newPresence.status == 'online') {
    if (timesSinceOffline[newPresence.guild.id].hasOwnProperty(id)) {
      const offlineTime = Date.now() - timesSinceOffline[newPresence.guild.id][id];
      delete timesSinceOffline[newPresence.guild.id][id];
      messageToSend = `The bot ${member} is now online. It has been offline for ${formatTimeDelta(offlineTime)}.`;
    } else {
      messageToSend = `The bot ${member} is now online.`;
    }
  }

  // Here, we can assume that the realm entry will have a channel id stored.
  const channelID = realmEntry[0].channel;

  // Send the notification and handle permissions and unknown channel errors.
  client.channels.fetch(channelID)
    .then( channel => channel.send(messageToSend))
    .catch( err => {
      if (err == 'DiscordAPIError: Unknown Channel') {
        member.guild.owner.send(`The bot **${member.displayName}** in the server **${member.guild.name}** has changed its status but I couldn't send a message to the channel you set-up previously. It has probably been deleted. Please, change the broadcasting channel in **${member.guild.name}** with **${config.prefix}channel** and mention the channel you want to set-up.`);
      } else if (err == 'DiscordAPIError: Missing Permissions') {
        member.guild.owner.send(`The bot **${member.displayName}** in the server **${member.guild.name}** has changed its status but I couldn't send a message to the channel you set-up previously because I don't have permissions to send messages there. Please, allow me to send messages in the set channel or change the broadcasting channel in **${member.guild.name}** with **${config.prefix}channel** and mention the channel you want to set-up.`);
      } else {
        member.guild.owner.send(`The bot **${member.displayName}** in the server **${member.guild.name}** has changed its status but I couldn't send a message to the channel you set-up because something unexpected went wrong.`);
        logger.error(`Something went wrong when handling ${member.guild.name}'s ${member.displayName} presence update.`);
        logger.error(err);
      }
    });
});

client.on('guildCreate', guild => {
  logger.info(`Joined ${guild.name} guild!`);
  updatePresence(client.guilds.size);

  // Add the entry to realm.
  realm.write( () => {
    realm.create('Guilds', {
      id: guild.id
    }, true);
    logger.info(`(REALM): Added entry for ${guild.name}.`);
  });
  timesSinceOffline[guild.id] = {};
});

client.on('guildDelete', guild => {
  logger.info(`Left ${guild.name} guild!`);
  updatePresence(client.guilds.size);

  // Delete the entry from realm.
  realm.write( () => {
    const realmEntry = realm.objects('Guilds').filtered(`id = "${guild.id}"`);
    realm.delete(realmEntry);
    logger.info(`(REALM): Deleted entry for ${guild.name}.`);
  });
  delete timesSinceOffline[guild.id];
});

client.on('guildUnavailable', guild => {
  logger.warn(`Guild ${guild.name} is currently unavailable.`);
});

client.on('warn', info => {
  logger.warn(info);
});

client.on('resume', () => {
  logger.info('Client gateway resumed.');
});

client.on('invalidated', () => {
  logger.error('Client connection invalidated, terminating execution with code 1.')
  process.exit(1);
});

client.on('debug', info => {
  logger.debug(info);
});

client.login(config.discord_token);
if (process.env.DISCORD_TOKEN) keepAlive();