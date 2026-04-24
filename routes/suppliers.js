const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { getSupplierStats } = require('../controllers/dashboardController');

router.use(protect);

router.route('/')
  .post(createSupplier)
  .get(getSuppliers);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

router.get('/:id/stats', getSupplierStats);

module.exports = router;