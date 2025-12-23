const Message = require('../models/Message');
const Notification = require('../models/Notification');
const SystemLog = require('../models/SystemLog');
const Contract = require('../models/Contract');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');
const { ethers } = require('ethers');

// Helper Logger
const createLog = async (type, action, details, userWallet, txHash) => {
    try {
        await SystemLog.create({
            type,
            action,
            details,
            userWallet,
            blockchainTxHash: txHash
        });
    } catch (e) {
        console.error("Logging failed:", e);
    }
};

// --- Reviews ---
exports.createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const review = await Review.create({
      propertyId,
      userWallet: req.user.activeWallet, // Use activeWallet
      rating,
      comment
    });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Tickets ---
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, propertyId } = req.body;
    const ticket = await Ticket.create({
      ticketId: ethers.id(req.user.activeWallet + Date.now()),
      userWallet: req.user.activeWallet,
      propertyId,
      subject,
      description,
      priority
    });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userWallet: req.user.activeWallet }).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Logs ---
exports.getSystemLogs = async (req, res) => {
  try {
    const logs = await SystemLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLogEntry = async (req, res) => { 
  try {
    const { type, action, details, txHash } = req.body;
    await createLog(type, action, details, req.user ? req.user.activeWallet : 'Anonymous', txHash);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Messages ---
exports.getMessages = async (req, res) => {
  try {
    const { contact } = req.query; 
    const wallet = req.user.activeWallet;
    
    if (!wallet) return res.json({ success: true, data: [] });

    let query = {
      $or: [
        { sender: wallet },
        { receiver: wallet }
      ]
    };
    
    if (contact) {
      query = {
        $or: [
          { sender: wallet, receiver: contact },
          { sender: contact, receiver: wallet }
        ]
      };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, isOffer, offerAmount } = req.body;
    const sender = req.user.activeWallet;

    if (!sender) return res.status(400).json({ message: "No active wallet set." });

    const message = await Message.create({
      sender,
      receiver,
      content,
      isOffer: isOffer || false,
      offerAmount: offerAmount || null,
      offerStatus: isOffer ? 'pending' : undefined
    });
    
    await Notification.create({
      recipient: receiver,
      title: isOffer ? 'New Offer Received!' : 'New Message',
      message: isOffer ? `You received an offer of ${offerAmount} TL from ${sender.substring(0, 6)}...` : `You have a new message from ${sender.substring(0, 6)}...`
    });

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.respondToOffer = async (req, res) => {
  try {
    const { messageId, status } = req.body;
    const message = await Message.findById(messageId);
    
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.receiver !== req.user.activeWallet) return res.status(403).json({ message: "Not authorized" });

    message.offerStatus = status;
    await message.save();

    await Notification.create({
      recipient: message.sender,
      title: `Offer ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your offer of ${message.offerAmount} TL was ${status}.`,
      type: status === 'accepted' ? 'success' : 'error'
    });

    res.json({ success: true, data: message });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// --- Notifications ---
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.activeWallet }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Contracts ---
exports.saveContract = async (req, res) => {
  try {
    const { contractId, propertyId, ownerWallet, pdfHash, blockchainTxHash, contentData, type, price } = req.body;
    
    const contract = await Contract.create({
      contractId,
      propertyId,
      tenantWallet: req.user.activeWallet,
      ownerWallet,
      pdfHash,
      blockchainTxHash,
      contentData,
      type: type || 'rent', // Default to rent if missing, but should be sent
      price: price || 0,
      status: 'active', // Mark as active since it's signed
      signedDate: new Date()
    });

    await createLog('CONTRACT', 'CONTRACT_SIGNED', `Contract signed for Property ${propertyId}`, req.user.activeWallet, blockchainTxHash);

    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [{ tenantWallet: req.user.activeWallet }, { ownerWallet: req.user.activeWallet }]
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: contracts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { contractId, status } = req.body;
    const contract = await Contract.findOne({ contractId });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    if (contract.tenantWallet !== req.user.activeWallet && contract.ownerWallet !== req.user.activeWallet) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    contract.status = status;
    await contract.save();
    
    await createLog('CONTRACT', 'CONTRACT_UPDATED', `Contract ${status} by ${req.user.activeWallet}`, req.user.activeWallet, null);

    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};