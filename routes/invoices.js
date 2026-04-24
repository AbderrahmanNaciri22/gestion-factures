const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');
const { createPayment, getPayments } = require('../controllers/paymentController');

router.use(protect);

router.route('/')
  .post(createInvoice)
  .get(getInvoices);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route('/:id/payments')
  .post(createPayment)
  .get(getPayments);

module.exports = router;