const Deposit = require('../models/Deposit');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Submit a deposit
// @route   POST /api/deposits/submit
// @access  Private
exports.submitDeposit = async (req, res) => {
  try {
    const { 
      propertyId, 
      depositorWallet, 
      anonymousId, 
      amount, 
      queuePosition,
      blockchainTxHash 
    } = req.body;

    // --- Prevent multiple active deposits ---
    const existingDeposit = await Deposit.findOne({
      propertyId,
      depositorWallet: depositorWallet.toLowerCase(),
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingDeposit) {
      return res.status(400).json({ message: 'You already have an active deposit for this property.' });
    }
    // --- End of check ---

    const deposit = await Deposit.create({
      depositId: blockchainTxHash, // Use TxHash as unique ID
      propertyId,
      depositorWallet: depositorWallet.toLowerCase(),
      anonymousId,
      amount,
      queuePosition,
      blockchainTxHash,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: deposit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deposit queue for a property
// @route   GET /api/deposits/queue/:propertyId
// @access  Public
exports.getQueue = async (req, res) => {
  try {
    const queue = await Deposit.find({ 
      propertyId: req.params.propertyId,
      status: { $in: ['pending', 'accepted'] }
    }).sort('queuePosition');
    
    const publicQueue = queue.map(d => ({
      _id: d._id, // Needed for frontend actions
      anonymousId: d.anonymousId,
      queuePosition: d.queuePosition,
      amount: d.amount,
      timestamp: d.createdAt,
      status: d.status,
      depositorWallet: d.depositorWallet // In real app, hide this if not owner
    }));

    res.json({
      success: true,
      data: publicQueue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deposits made by current user
// @route   GET /api/deposits/my
// @access  Private
exports.getMyDeposits = async (req, res) => {
  try {
    // Search across all user wallets
    const userAddresses = req.user.wallets.map(w => w.address.toLowerCase());
    const deposits = await Deposit.find({ depositorWallet: { $in: userAddresses } });
    res.json({
      success: true,
      data: deposits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get deposits RECEIVED by current user (for owners)
// @route   GET /api/deposits/received
// @access  Private
exports.getReceivedDeposits = async (req, res) => {
  try {
    // 1. Get all properties owned by this user
    const userAddresses = req.user.wallets.map(w => w.address.toLowerCase());
    const properties = await Property.find({ ownerWallet: { $in: userAddresses } });
    const propertyIds = properties.map(p => p.propertyId);

    // 2. Find deposits for these properties
    const deposits = await Deposit.find({ propertyId: { $in: propertyIds } })
                                  .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: deposits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update deposit status (Accept/Reject/Withdraw)
// @route   PUT /api/deposits/:id/status
// @access  Private
exports.updateDepositStatus = async (req, res) => {
  try {
    const { status, txHash } = req.body;
    
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    // Simplified auth check: In real app check if req.user is owner of property (for accept/reject) 
    // or depositor (for withdraw)

    deposit.status = status;
    if (txHash) deposit.blockchainTxHash = txHash;
    
    await deposit.save();

    if (status === 'accepted') {
      await Notification.create({
        recipient: deposit.depositorWallet,
        title: 'Deposit Accepted!',
        message: `Your deposit for property ${deposit.propertyId} has been accepted. You can now proceed to purchase or rent the property.`,
        type: 'success'
      });
    }

    res.json({
      success: true,
      data: deposit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
