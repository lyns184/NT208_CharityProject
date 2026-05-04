/**
 * Disbursement Module - Model
 */

const mongoose = require('mongoose')

const disbursementSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  requestQrImage: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING_VERIFY', 'COMPLETED'],
    default: 'PENDING_VERIFY'
  },
  transferTxHash: String,
  transferProofImage: String,
  transferProofHash: String,
  proofImages: { type: [String], default: [] },
  proofETags: { type: [String], default: [] },
  proofCaption: { type: String, default: '' },
  blockchainStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  blockchainTxHash: String,
  reportHash: String
}, { timestamps: true })

module.exports = mongoose.model('Disbursement', disbursementSchema)
