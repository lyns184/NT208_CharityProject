const mongoose = require('mongoose')

const assistantUsageSchema = new mongoose.Schema({
  identity: { type: String, required: true },
  day: { type: String, required: true },
  count: { type: Number, default: 0 },
}, { timestamps: true })

assistantUsageSchema.index({ identity: 1, day: 1 }, { unique: true })
assistantUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 35 })

module.exports = mongoose.model('AssistantUsage', assistantUsageSchema)
