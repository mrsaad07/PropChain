const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

const provider = new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL || 'http://localhost:8545');
const web3 = new Web3(provider);

const getContract = (contractName) => {
  const artifactPath = path.resolve(__dirname, `../../../blockchain/build/contracts/${contractName}.json`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  const networkId = Object.keys(artifact.networks)[0];
  if (!networkId) {
    throw new Error(`Contract ${contractName} not deployed on any network`);
  }
  
  return new web3.eth.Contract(artifact.abi, artifact.networks[networkId].address);
};

module.exports = {
  web3,
  getContract,
  PropertyRegistry: () => getContract('PropertyRegistry'),
  DepositQueue: () => getContract('DepositQueue'),
  MaintenanceFee: () => getContract('MaintenanceFee'),
  RentPayment: () => getContract('RentPayment'),
};
