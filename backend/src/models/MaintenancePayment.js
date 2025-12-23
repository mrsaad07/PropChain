const mongoose = require('mongoose');

const maintenancePaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
  },
  buildingId: String,
  apartmentNo: String,
  tenantWallet: String,
  month: String, // YYYY-MM
  amount: Number,
  paymentDate: Date,
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'overdue'],
    default: 'paid',
  },
  receipt: String, // IPFS hash or similar
  blockchainTxHash: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('MaintenancePayment', maintenancePaymentSchema);
