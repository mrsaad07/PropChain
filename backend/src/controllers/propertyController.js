const Property = require('../models/Property');

// @desc    Register a new property
// @route   POST /api/properties/register
// @access  Private (Owner only)
exports.registerProperty = async (req, res) => {
  try {
    const { 
      propertyId, 
      ownerWallet, 
      propertyType, 
      address, 
      details, 
      listingType, 
      price, 
      maintenanceFee,
      tenantRequirements,
      blockchainTxHash 
    } = req.body;

    // Basic validation
    if (!propertyId || !ownerWallet || !price) {
      return res.status(400).json({ message: "Missing required fields: propertyId, ownerWallet, price." });
    }

    const property = await Property.create({
      propertyId,
      ownerWallet: ownerWallet.toLowerCase(),
      propertyType,
      address,
      details,
      listingType,
      price,
      maintenanceFee,
      tenantRequirements,
      blockchainTxHash
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error("Error in registerProperty controller:", error.message);
    res.status(500).json({ message: "Server error while registering property." });
  }
};

// @desc    Get all properties with filtering and pagination
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = async (req, res) => {
  try {
    const { city, propertyType, listingType, minPrice, maxPrice, page, limit } = req.query;
    
    let query = {};
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Pagination Logic
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9; // Default 9 items per page
    const startIndex = (pageNum - 1) * limitNum;
    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.json({
      success: true,
      count: properties.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: properties
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ propertyId: req.params.id });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property status and owner (after blockchain purchase)
// @route   PUT /api/properties/:id/transfer
// @access  Private
exports.transferOwnership = async (req, res) => {
  try {
    const { newOwnerWallet, status, txHash } = req.body;
    
    const property = await Property.findOne({ propertyId: req.params.id });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Update fields
    if (newOwnerWallet) property.ownerWallet = newOwnerWallet.toLowerCase();
    if (status) property.status = status;
    if (txHash) property.blockchainTxHash = txHash; // Track the purchase TX

    await property.save();

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get properties rented by the current user
// @route   GET /api/properties/my/rentals
// @access  Private
exports.getMyRentals = async (req, res) => {
  try {
    const userAddresses = req.user.wallets.map(w => w.address.toLowerCase());
    
    // Strategy: Find accepted deposits for these wallets
    // This assumes an 'accepted' deposit implies tenancy for this MVP.
    // Alternatively, we could check RentPayment history.
    const Deposit = require('../models/Deposit');
    
    const acceptedDeposits = await Deposit.find({
      depositorWallet: { $in: userAddresses },
      status: 'accepted'
    });

    const propertyIds = acceptedDeposits.map(d => d.propertyId);
    
    const properties = await Property.find({
      propertyId: { $in: propertyIds }
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get properties owned by current user
// @route   GET /api/properties/my/all
// @access  Private
exports.getMyProperties = async (req, res) => {
  try {
    // Get all wallet addresses associated with the user account
    const userAddresses = req.user.wallets.map(w => w.address.toLowerCase());
    
    // Find properties where ownerWallet matches ANY of the user's addresses
    const properties = await Property.find({ 
      ownerWallet: { $in: userAddresses } 
    });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
