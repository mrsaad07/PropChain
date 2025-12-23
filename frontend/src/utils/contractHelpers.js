import { ethers } from 'ethers';
import PropertyRegistry from '../contracts/PropertyRegistry.json';
import DepositQueue from '../contracts/DepositQueue.json';
import MaintenanceFee from '../contracts/MaintenanceFee.json';
import RentPayment from '../contracts/RentPayment.json';

const getContract = (contractJson, runner) => {
  // 1. Try to find the deployed network in the artifact
  const networks = contractJson.networks;
  const networkIds = Object.keys(networks);
  
  // If no deployment found in the JSON artifact
  if (networkIds.length === 0) {
    console.error(`Contract ${contractJson.contractName} has no network configuration. Did you run 'truffle migrate'?`);
    return null;
  }

  // 2. Just pick the last deployed network ID (Usually the correct one in local dev)
  // This bypasses the mismatch between Metamask (1337) and Ganache (5777)
  const latestId = networkIds[networkIds.length - 1];
  const deployedNetwork = networks[latestId];
  
  if (deployedNetwork && deployedNetwork.address) {
    return new ethers.Contract(
      deployedNetwork.address,
      contractJson.abi,
      runner // This is the Signer or Provider
    );
  } else {
    console.error(`Contract ${contractJson.contractName} address not found.`);
    return null;
  }
};

export const getPropertyRegistryContract = (runner) => getContract(PropertyRegistry, runner);
export const getDepositQueueContract = (runner) => getContract(DepositQueue, runner);
export const getMaintenanceFeeContract = (runner) => getContract(MaintenanceFee, runner);
export const getRentPaymentContract = (runner) => getContract(RentPayment, runner);
