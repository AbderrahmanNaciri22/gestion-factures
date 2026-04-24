const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

router.use(protect);
router.use(adminOnly);

// Lister tous les clients
router.get('/clients', async (req, res, next) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password');
    
    res.status(200).json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    next(error);
  }
});

// Consulter les fournisseurs d'un client
router.get('/clients/:id/suppliers', async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ clientId: req.params.id });
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    next(error);
  }
});

// Consulter les factures d'un client
router.get('/clients/:id/invoices', async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ clientId: req.params.id })
      .populate('supplierId', 'name');
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    next(error);
  }
});

// Consulter les paiements d'un client
router.get('/clients/:id/payments', async (req, res, next) => {
  try {
    const payments = await Payment.find({ clientId: req.params.id })
      .populate('invoiceId', 'invoiceNumber amount');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;