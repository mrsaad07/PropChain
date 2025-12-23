const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractId: { type: String, required: true, unique: true },
  propertyId: { type: String, required: true },
  
  // Parties
  tenantWallet: { type: String, required: true }, // Buyer/Tenant
  ownerWallet: { type: String, required: true },  // Seller/Landlord
  
  // Details
  type: { type: String, enum: ['rent', 'sale'], required: true },
  price: { type: Number, required: true },
  
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'pending_payment', 'active', 'terminated', 'completed'], 
    default: 'draft' 
  },
  
  // Signatures
  tenantSigned: { type: Boolean, default: false },
  ownerSigned: { type: Boolean, default: false },
  
  // Blockchain Data
  pdfHash: String,
  blockchainTxHash: String,
  paymentTxHash: String,
  contentData: String,
  signedDate: Date
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contract', contractSchema);