const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');
const Payment = require('../models/Payment');

exports.createInvoice = async (req, res, next) => {
  try {
    const { supplierId, amount, dueDate, invoiceNumber } = req.body;
    
    // Vérifier que le fournisseur appartient au client
    const supplier = await Supplier.findOne({
      _id: supplierId,
      clientId: req.user.id
    });
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    const invoice = await Invoice.create({
      invoiceNumber,
      supplierId,
      clientId: req.user.id,
      amount,
      dueDate
    });
    
    res.status(201).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { status, supplierId, overdue, startDate, endDate } = req.query;
    
    const filter = { clientId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    if (supplierId) {
      filter.supplierId = supplierId;
    }
    
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }
    
    if (overdue === 'true') {
      filter.dueDate = { ...filter.dueDate, $lt: new Date() };
      filter.status = { $ne: 'paid' };
    }
    
    const invoices = await Invoice.find(filter)
      .populate('supplierId', 'name contact.email')
      .sort({ createdAt: -1 });
    
    // Vérifier et mettre à jour les statuts en retard
    for (let invoice of invoices) {
      if (invoice.dueDate < new Date() && invoice.status !== 'paid') {
        // Marquer comme en retard (on pourrait ajouter un flag)
        invoice._doc.isOverdue = true;
      }
    }
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      clientId: req.user.id
    }).populate('supplierId', 'name contact');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const { amount, dueDate } = req.body;
    
    const invoice = await Invoice.findOne({
      _id: req.params.id,
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
        message: 'Impossible de modifier une facture totalement payée'
      });
    }
    
    if (amount !== undefined) invoice.amount = amount;
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    
    await invoice.save();
    
    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      clientId: req.user.id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }
    
    // Vérifier s'il y a des paiements
    const paymentCount = await Payment.countDocuments({ invoiceId: invoice._id });
    
    if (paymentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une facture avec des paiements associés'
      });
    }
    
    await invoice.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};