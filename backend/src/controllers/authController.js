const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ethers } = require('ethers');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Helper to fund a new demo wallet
const fundWallet = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://ganache:8545');
    
    // Use the provided env variable or fallback to Ganache Account #0 default private key
    // This prevents the "invalid private key" error if the env var is missing in some contexts.
    const privateKey = process.env.ADMIN_PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    
    const adminWallet = new ethers.Wallet(privateKey, provider);
    
    // Fund with 100 ETH (Standard Ganache accounts have 1000 ETH total)
    const tx = await adminWallet.sendTransaction({
      to: address,
      value: ethers.parseEther("100.0")
    });
    
    await tx.wait();
    console.log(`[FUND] Funded ${address} with 100 ETH.`);
  } catch (error) {
    console.error("[FUND] CRITICAL: Funding failed.", error);
    // We log but do not throw, so the user creation doesn't fail just because funding failed (e.g. network down)
  }
};

// --- AUTH CONTROLLERS ---

exports.register = async (req, res, next) => {
  console.log('[AUTH] Register attempt received.');
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('[AUTH] Register failed: Missing username or password.');
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }
    console.log(`[AUTH] Checking if user '${username}' exists...`);
    const userExists = await User.findOne({ username });
    if (userExists) {
      console.log(`[AUTH] Register failed: User '${username}' already exists.`);
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    console.log(`[AUTH] User '${username}' does not exist. Creating new user.`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ username, password: hashedPassword, wallets: [] });
    console.log(`[AUTH] User '${username}' created successfully.`);
    
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error('[AUTH] Register controller error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  console.log('[AUTH] Login attempt received.');
  try {
    const { loginIdentifier, password } = req.body;
    if (!loginIdentifier || !password) {
      console.log('[AUTH] Login failed: Missing credentials.');
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }
    
    console.log(`[AUTH] Finding user with identifier: '${loginIdentifier}'`);
    const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] }).select('+password');
    
    if (!user) {
      console.log(`[AUTH] Login failed: User '${loginIdentifier}' not found in DB.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`[AUTH] User '${user.username}' found. Comparing passwords...`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`[AUTH] Login failed: Password for user '${user.username}' does not match.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`[AUTH] Password for '${user.username}' is correct. Login successful.`);
    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('[AUTH] Login controller error:', error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+wallets.privateKey');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// --- WALLET CONTROLLERS ---

exports.addWallet = async (req, res, next) => {
  try {
    const { walletType, address, alias } = req.body;
    const user = await User.findById(req.user.id);

    let newWallet;
    if (walletType === 'demo') {
      const demoWallet = ethers.Wallet.createRandom();
      newWallet = {
        address: demoWallet.address.toLowerCase(),
        alias: alias || `Demo Wallet #${user.wallets.length + 1}`,
        walletType: 'demo',
        privateKey: demoWallet.privateKey
      };
      // Fund the new demo wallet immediately
      await fundWallet(newWallet.address);
      
    } else if (walletType === 'metamask') {
      if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({ success: false, message: "A valid wallet address is required." });
      }
      if (user.wallets.some(w => w.address === address.toLowerCase())) {
        return res.status(400).json({ success: false, message: "This wallet is already added." });
      }
      newWallet = {
        address: address.toLowerCase(),
        alias: alias || `MetaMask Wallet`,
        walletType: 'metamask'
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid wallet type." });
    }

    user.wallets.push(newWallet);
    
    // If no active wallet, set this one as active
    if (!user.activeWallet) {
      user.activeWallet = newWallet.address;
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('+wallets.privateKey');
    res.status(201).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.setActiveWallet = async (req, res, next) => {
    try {
        const { address } = req.body;
        const user = await User.findById(req.user.id);
        if (!user.wallets.some(w => w.address === address)) {
            return res.status(400).json({ success: false, message: 'Wallet not found on your account.' });
        }
        user.activeWallet = address;
        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch(error) {
        next(error);
    }
};

exports.updateWalletAlias = async (req, res, next) => {
    try {
        const { address, alias } = req.body;
        if (!alias) return res.status(400).json({ success: false, message: 'Alias cannot be empty.' });
        
        const user = await User.findOneAndUpdate(
            { "_id": req.user.id, "wallets.address": address },
            { "$set": { "wallets.$.alias": alias } },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "Wallet not found." });
        res.status(200).json({ success: true, data: user });
    } catch(error) {
        next(error);
    }
};

exports.deleteWallet = async (req, res, next) => {
    try {
        const { address } = req.params;
        const user = await User.findById(req.user.id);
        
        const walletIndex = user.wallets.findIndex(w => w.address === address);
        if (walletIndex === -1) {
            return res.status(404).json({ success: false, message: "Wallet not found." });
        }

        user.wallets.splice(walletIndex, 1);

        // If the deleted wallet was active, reset active wallet
        if (user.activeWallet === address) {
            user.activeWallet = user.wallets.length > 0 ? user.wallets[0].address : null;
        }

        await user.save();
        res.status(200).json({ success: true, data: user, message: "Wallet removed successfully." });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    // Placeholder for change password logic if needed
    res.status(501).json({ message: 'Not implemented yet' });
};
