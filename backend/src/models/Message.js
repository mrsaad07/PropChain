const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Wallet address
  receiver: { type: String, required: true }, // Wallet address
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  
  // New fields for Offer System
  isOffer: { type: Boolean, default: false },
  offerAmount: { type: Number },
  offerStatus: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);