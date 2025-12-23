const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  depositId: {
    type: String, // Blockchain hash
    unique: true,
    sparse: true,
  },
  propertyId: {
    type: String,
    required: true,
  },
  depositorWallet: {
    type: String,
    required: true,
  },
  anonymousId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  queuePosition: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  blockchainTxHash: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Deposit', depositSchema);
