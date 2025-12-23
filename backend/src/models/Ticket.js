const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  userWallet: String, // Who created it
  propertyId: String, // Related property (optional)
  subject: String,
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  responses: [{
    sender: String,
    message: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
