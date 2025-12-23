const express = require('express');
const router = express.Router();
const { payMaintenance, getHistory, getTenantHistory, getBuildingReport } = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

router.post('/pay', protect, payMaintenance);
router.get('/history/:buildingId', getHistory);
router.get('/tenant-history/:wallet', getTenantHistory);
router.get('/building-report/:buildingId/:month', protect, getBuildingReport);

module.exports = router;