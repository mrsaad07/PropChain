const mongoose = require('mongoose');

// This is the simplest possible schema to avoid the indexing bug.
// Uniqueness will be handled at the application level when adding a wallet,
// not at the database level during user creation.

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple users to not have an email
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  roles: {
    type: [String],
    default: ['tenant'],
  },
  // The wallets array is just a simple array. No unique index here.
  wallets: [{
    address: String,
    alias: String,
    walletType: String,
    privateKey: { type: String, select: false },
  }],
  activeWallet: {
    type: String,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: { // Track activity for chat status
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
