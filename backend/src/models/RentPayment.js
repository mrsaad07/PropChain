const mongoose = require('mongoose');

const rentPaymentSchema = new mongoose.Schema({
  rentId: {
    type: String,
    unique: true,
  },
  propertyId: String,
  tenantWallet: String,
  ownerWallet: String,
  month: String, // YYYY-MM
  amount: Number,
  paymentDate: Date,
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'overdue'],
    default: 'paid',
  },
  lateFee: {
    type: Number,
    default: 0,
  },
  receipt: String,
  blockchainTxHash: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('RentPayment', rentPaymentSchema);
