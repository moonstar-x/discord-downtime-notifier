// id contains the guild id.
// channel contains the channel id to broadcast the messages.
// listening contains a JSON stringified array containing the ids of the bots to listen to.

const model = {
  name: 'Guilds',
  primaryKey: 'id',
  properties: {
    id: 'string',
    channel: 'string?',
    listening: {
      type: 'string?[]',
      default: []
    }
  }
}

module.exports = {
  model
}