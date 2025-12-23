const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String, // Blockchain hash
    required: true,
    unique: true,
  },
  ownerWallet: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
  },
  address: {
    city: String,
    district: String,
    street: String,
    buildingNo: String,
    apartmentNo: String,
  },
  details: {
    rooms: Number,
    squareMeters: Number,
    floor: Number,
    furnished: Boolean,
  },
  listingType: {
    type: String,
    enum: ['rent', 'sale'],
    required: true,
  },
  price: Number,
  maintenanceFee: Number,
  tenantRequirements: { // Owner's preference for tenant
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'rented', 'sold'],
    default: 'available',
  },
  blockchainTxHash: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Property', propertySchema);
