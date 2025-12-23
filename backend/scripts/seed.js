const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Property = require('../src/models/Property');

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/propchain?authSource=admin';
    await mongoose.connect(uri);
    
    console.log('[Seed] Clearing and seeding database...');
    // Always clear users and properties to ensure sync with new contracts
    await User.deleteMany({});
    await Property.deleteMany({});

    const PropertyRegistryArtifact = require('../src/contracts/PropertyRegistry.json');
    
    // Reuse provider for contract interaction
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://ganache:8545');
    const privateKey = process.env.ADMIN_PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'; 
    const funder = new ethers.Wallet(privateKey, provider);

    // Manual nonce management
    let currentNonce = await provider.getTransactionCount(funder.address, 'latest');

    // Helper to fund wallets
    const fundWallet = async (address) => {
        try {
            const tx = await funder.sendTransaction({
                to: address,
                value: ethers.parseEther("100.0"),
                nonce: currentNonce++
            });
            await tx.wait();
            console.log(`[Seed] Funded ${address} with 100 ETH`);
        } catch (e) {
            console.error(`[Seed] Failed to fund ${address}:`, e.message);
        }
    };

    const adminWallet = ethers.Wallet.createRandom();
    const testWallet = ethers.Wallet.createRandom();
    
    // Fund them immediately
    await fundWallet(adminWallet.address);
    await fundWallet(testWallet.address);

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin', salt);
    const testPasswordHash = await bcrypt.hash('test', salt);

    // 1. Create Super Admin User
    const adminUser = await User.create({
        username: 'admin',
        password: adminPasswordHash,
        roles: ['admin', 'owner', 'manager'], // Full permissions
        wallets: [{
          address: adminWallet.address.toLowerCase(),
          alias: 'Super Admin Wallet',
          walletType: 'demo',
          privateKey: adminWallet.privateKey
        }],
        activeWallet: adminWallet.address.toLowerCase(),
    });
    console.log(`[Seed] Created 'admin' user (pass: admin).`);

    // 2. Create Test Tenant User
    await User.create({
        username: 'test',
        password: testPasswordHash,
        roles: ['tenant'],
        wallets: [{
          address: testWallet.address.toLowerCase(),
          alias: 'Test Tenant Wallet',
          walletType: 'demo',
          privateKey: testWallet.privateKey
        }],
        activeWallet: testWallet.address.toLowerCase(),
    });
    console.log(`[Seed] Created 'test' user (pass: test).`);

    // 3. Register Properties on Blockchain & DB
    // Get deployed address from artifact (Network 5777)
    const netId = '5777';
    const deployedNetwork = PropertyRegistryArtifact.networks[netId];
    
    if (!deployedNetwork) {
        console.error("[Seed] Contract not deployed on network 5777. Run 'truffle migrate' first.");
        process.exit(1);
    }

    const adminSigner = new ethers.Wallet(adminWallet.privateKey, provider);
    const registryContract = new ethers.Contract(
        deployedNetwork.address,
        PropertyRegistryArtifact.abi,
        adminSigner // Sign as Admin
    );

    console.log(`[Seed] Using PropertyRegistry at: ${deployedNetwork.address}`);
    
    // Check if code exists at address
    const code = await provider.getCode(deployedNetwork.address);
    if (code === '0x') {
        throw new Error(`[Seed] No code found at ${deployedNetwork.address}. Contract not deployed or network mismatch.`);
    }

    // Get admin nonce for property registration
    let adminNonce = await provider.getTransactionCount(adminWallet.address, 'latest');

    const rawProperties = [
        // 2 Houses for Sale
        {
            propertyType: 'House',
            address: { city: 'Istanbul', district: 'Sariyer', street: 'Bosphorus View 1' },
            details: { rooms: 5, squareMeters: 250, floor: 1, furnished: true },
            listingType: 'sale',
            price: 15000000,
            maintenanceFee: 0
        },
        {
            propertyType: 'House',
            address: { city: 'Bodrum', district: 'Kalkan', street: 'Seaside Villa 4' },
            details: { rooms: 4, squareMeters: 200, floor: 1, furnished: true },
            listingType: 'sale',
            price: 12000000,
            maintenanceFee: 0
        },
        // 2 Apartments for Rent
        {
            propertyType: 'Apartment',
            address: { city: 'Ankara', district: 'Cankaya', street: 'Diplomatic St. 10' },
            details: { rooms: 3, squareMeters: 140, floor: 3, furnished: true },
            listingType: 'rent',
            price: 25000,
            maintenanceFee: 1500
        },
        {
            propertyType: 'Apartment',
            address: { city: 'Izmir', district: 'Alsancak', street: 'Kordon Boyu 5' },
            details: { rooms: 2, squareMeters: 90, floor: 5, furnished: false },
            listingType: 'rent',
            price: 18000,
            maintenanceFee: 1000
        },
        // Low Price Properties for Testing
        {
            propertyType: 'Tiny House',
            address: { city: 'Bursa', district: 'Uludag', street: 'Mountain Path 1' },
            details: { rooms: 1, squareMeters: 30, floor: 0, furnished: true },
            listingType: 'sale',
            price: 1000, // Low price
            maintenanceFee: 0
        },
        {
            propertyType: 'Studio',
            address: { city: 'Eskisehir', district: 'Odunpazari', street: 'Student St. 4' },
            details: { rooms: 1, squareMeters: 40, floor: 2, furnished: true },
            listingType: 'rent',
            price: 1000, // Low rent
            maintenanceFee: 200
        }
    ];

    const propertiesToSave = [];

    for (const p of rawProperties) {
        try {
            const locationStr = `${p.address.street}, ${p.address.district}, ${p.address.city}`;
            // Register on Blockchain
            const tx = await registryContract.registerProperty(
                p.propertyType,
                locationStr,
                p.price,
                p.maintenanceFee,
                { nonce: adminNonce++ }
            );
            const receipt = await tx.wait();
            
            // Safer parsing for Ethers v6
            let realPropertyId;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = registryContract.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === 'PropertyRegistered') {
                        realPropertyId = parsedLog.args[0];
                        break;
                    }
                } catch (e) {
                    // Ignore logs that don't match this interface
                }
            }

            if (!realPropertyId) {
                console.error("DEBUG: Logs found:", receipt.logs);
                throw new Error("Could not find PropertyRegistered event in logs");
            }

            propertiesToSave.push({
                propertyId: realPropertyId,
                ownerWallet: adminUser.wallets[0].address,
                propertyType: p.propertyType,
                address: p.address,
                details: p.details,
                listingType: p.listingType,
                price: p.price,
                maintenanceFee: p.maintenanceFee,
                status: 'available',
                blockchainTxHash: receipt.hash
            });
            console.log(`[Seed] Registered ${p.propertyType} on chain: ${realPropertyId}`);
        } catch (err) {
            console.error(`[Seed] Failed to register ${p.propertyType}:`, err.message);
        }
    }

    if (propertiesToSave.length > 0) {
        await Property.insertMany(propertiesToSave);
        console.log(`[Seed] Saved ${propertiesToSave.length} properties to DB.`);
    }

    console.log('[Seed] Seeding process completed successfully!');

  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase().then(() => mongoose.connection.close());
}

module.exports = seedDatabase;