const MaintenancePayment = require('../models/MaintenancePayment');

exports.payMaintenance = async (req, res) => {
  try {
    const payment = await MaintenancePayment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await MaintenancePayment.find({ buildingId: req.params.buildingId });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTenantHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { tenantWallet: req.params.wallet.toLowerCase() };
    const total = await MaintenancePayment.countDocuments(query);

    const history = await MaintenancePayment.find(query)
      .sort({ paymentDate: -1 })
      .skip(startIndex)
      .limit(limit);
    
    res.json({ 
      success: true, 
      count: history.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: history 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get building payment report for a specific month
// @route   GET /api/maintenance/building-report/:buildingId/:month
// @access  Private (Manager)
exports.getBuildingReport = async (req, res) => {
  try {
    const { buildingId, month } = req.params;
    
    const payments = await MaintenancePayment.find({ 
      buildingId: new RegExp(buildingId, 'i'), // Case insensitive search
      month: month,
      status: 'paid'
    });

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      buildingId,
      month,
      count: payments.length,
      totalAmount: totalPaid,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};