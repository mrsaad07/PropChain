const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BLOCKCHAIN', 'TRANSACTION', 'SYSTEM', 'USER_ACTION', 'CONTRACT'],
    required: true
  },
  action: String,
  details: String,
  actor: String, // Wallet or User ID
  txHash: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt/updatedAt
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
