const RentPayment = require('../models/RentPayment'); exports.payRent = async (req, res) => { try { const payment = await RentPayment.create(req.body); res.status(201).json({ success: true, data: payment }); } catch (error) { res.status(500).json({ message: error.message }); } }; exports.getTenantHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { tenantWallet: req.params.wallet.toLowerCase() };
    const total = await RentPayment.countDocuments(query);

    const history = await RentPayment.find(query)
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

