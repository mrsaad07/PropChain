const { ethers } = require('ethers');
const PropertyRegistryArtifact = require('../src/contracts/PropertyRegistry.json');

const debug = async () => {
    try {
        const provider = new ethers.JsonRpcProvider('http://ganache:8545');
        const netId = '5777';
        const deployedNetwork = PropertyRegistryArtifact.networks[netId];
        const contract = new ethers.Contract(
            deployedNetwork.address,
            PropertyRegistryArtifact.abi,
            provider
        );

        const propertyId = "0x359e9338af44e3ca713729b412747d62ffa60a056f5a7e978a1661a1ea60efaf"; // Tiny House ID from log
        
        console.log("Checking Property:", propertyId);
        
        try {
            const prop = await contract.getProperty(propertyId);
            console.log("Property Found:");
            console.log("Owner:", prop.owner);
            console.log("Price:", prop.price.toString());
            console.log("Status:", prop.status);
            console.log("Exists:", prop.exists);
        } catch (e) {
            console.error("getProperty failed (likely revert if not exists):", e.message);
        }

    } catch (e) {
        console.error("Debug Error:", e);
    }
};

debug();