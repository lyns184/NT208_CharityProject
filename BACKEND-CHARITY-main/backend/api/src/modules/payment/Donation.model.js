/**
 * Payment Module - Models
 */

const mongoose = require('mongoose')
const crypto = require('crypto')

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    transferContent: {
      type: String,
      unique: true,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    sepayTxId: {
      type: String,
    },
    blockchainTxHash: {
      type: String,
    },
    blockchainStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'IGNORED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Donation', donationSchema)
