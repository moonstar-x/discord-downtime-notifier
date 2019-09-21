const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  channel: {
    type: String,
    default: null
  },
  trackedBots: [{
    id: {
      type: String,
      required: true
    },
    lastOnline: {
      type: Number,
      default: null
    }
  }]
});

module.exports = guildSchema;
