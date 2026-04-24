const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

exports.createPayment = async (req, res, next) => {
  try {
    const { amount, paymentDate } = req.body;
    const invoiceId = req.params.id;
    
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      clientId: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cette facture est déjà totalement payée'
      });
    }
    
    // Vérifier que le montant du paiement ne dépasse pas le reste à payer
    const remainingAmount = invoice.amount - invoice.paidAmount;
    
    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Le montant du paiement (${amount}€) dépasse le montant restant à payer (${remainingAmount}€)`
      });
    }
    
    const payment = await Payment.create({
      invoiceId,
      amount,
      paymentDate: paymentDate || Date.now(),
      clientId: req.user.id
    });
    
    // Mettre à jour le montant payé de la facture
    invoice.paidAmount += amount;
    await invoice.save();
    
    res.status(201).json({
      success: true,
      payment,
      invoiceStatus: invoice.status,
      remainingAmount: invoice.amount - invoice.paidAmount
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      clientId: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    const payments = await Payment.find({ invoiceId }).sort({ paymentDate: -1 });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
      invoiceTotal: invoice.amount,
      totalPaid: invoice.paidAmount,
      remainingAmount: invoice.amount - invoice.paidAmount,
      invoiceStatus: invoice.status
    });
  } catch (error) {
    next(error);
  }
};