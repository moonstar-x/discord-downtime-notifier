const BotSchema = {
  name: 'Bot',
  properties: {
    id: 'string',
    lastOnline: 'int?'
  }
}

const GuildSchema = {
  name: 'Guilds',
  primaryKey: 'id',
  properties: {
    id: 'string',
    channel: 'string?',
    trackedBots: {
      type: 'Bot[]',
      default: []
    }
  }
}

module.exports = {
  BotSchema,
  GuildSchema
}
