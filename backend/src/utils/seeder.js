const Property = require('../models/Property');
const MaintenancePayment = require('../models/MaintenancePayment');
const { ethers } = require('ethers');

const seedData = async () => {
  try {
    // ALWAYS CLEAR DB ON RESTART FOR CLEAN DEMO
    await Property.deleteMany({});
    await MaintenancePayment.deleteMany({});
    console.log('Database cleared. Seeding new data...');

    const demoOwnerWallet = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'.toLowerCase();

    const properties = [
      // 1. CHEAP TEST PROPERTY
      {
        propertyId: ethers.id('cheap1'),
        ownerWallet: demoOwnerWallet,
        propertyType: 'Studio',
        address: {
          city: 'Test City',
          district: 'Debug District',
          street: 'Test St.',
          buildingNo: '1',
          apartmentNo: '1'
        },
        details: { rooms: 1, squareMeters: 30, floor: 0, furnished: true },
        listingType: 'rent',
        price: 100, // <--- 100 TL
        maintenanceFee: 10,
        status: 'available',
        blockchainTxHash: ethers.hexlify(ethers.randomBytes(32))
      },
      // 2. Normal Property
      {
        propertyId: ethers.id('prop1'),
        ownerWallet: demoOwnerWallet,
        propertyType: 'Apartment',
        address: {
          city: 'Istanbul',
          district: 'Kadikoy',
          street: 'Bagdat Cd.',
          buildingNo: '10',
          apartmentNo: '5'
        },
        details: { rooms: 3, squareMeters: 140, floor: 3, furnished: true },
        listingType: 'rent',
        price: 25000,
        maintenanceFee: 1500,
        status: 'available',
        blockchainTxHash: ethers.hexlify(ethers.randomBytes(32))
      },
      // 3. Expensive Property (Test Limits)
      {
        propertyId: ethers.id('prop4'),
        ownerWallet: demoOwnerWallet,
        propertyType: 'Villa',
        address: {
          city: 'Antalya',
          district: 'Muratpasa',
          street: 'Lara Cd.',
          buildingNo: '88',
          apartmentNo: '1'
        },
        details: { rooms: 6, squareMeters: 350, floor: 2, furnished: true },
        listingType: 'sale',
        price: 5000000,
        maintenanceFee: 2500,
        status: 'available',
        blockchainTxHash: ethers.hexlify(ethers.randomBytes(32))
      }
    ];

    await Property.insertMany(properties);
    console.log('Seeding completed: Added 100 TL Property and others.');

  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;
