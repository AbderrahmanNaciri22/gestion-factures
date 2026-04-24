const Invoice = require('../models/Invoice');
const Supplier = require('../models/Supplier');
const Payment = require('../models/Payment');

exports.getSupplierStats = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    
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
    
    const invoices = await Invoice.find({
      supplierId,
      clientId: req.user.id
    });
    
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalRemaining = totalAmount - totalPaid;
    
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
    const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'partially_paid').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    
    const overdueInvoices = invoices.filter(inv => 
      inv.dueDate < new Date() && inv.status !== 'paid'
    ).length;
    
    const paymentPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        supplier: supplier.name,
        totalInvoices,
        totalAmount,
        totalPaid,
        totalRemaining,
        unpaidInvoices,
        partiallyPaidInvoices,
        paidInvoices,
        overdueInvoices,
        paymentPercentage: Math.round(paymentPercentage * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ clientId: req.user.id });
    const suppliers = await Supplier.find({ clientId: req.user.id });
    
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalRemaining = totalAmount - totalPaid;
    
    const overdueInvoices = invoices.filter(inv => 
      inv.dueDate < new Date() && inv.status !== 'paid'
    );
    
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    
    const statusBreakdown = {
      unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
      partially_paid: invoices.filter(inv => inv.status === 'partially_paid').length,
      paid: invoices.filter(inv => inv.status === 'paid').length
    };
    
    const paymentRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    
    // Top 5 fournisseurs par montant
    const supplierTotals = {};
    for (const inv of invoices) {
      const supplierId = inv.supplierId.toString();
      if (!supplierTotals[supplierId]) {
        supplierTotals[supplierId] = {
          totalAmount: 0,
          totalPaid: 0
        };
      }
      supplierTotals[supplierId].totalAmount += inv.amount;
      supplierTotals[supplierId].totalPaid += inv.paidAmount;
    }
    
    const topSuppliers = await Promise.all(
      Object.entries(supplierTotals)
        .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(async ([supplierId, totals]) => {
          const supplier = await Supplier.findById(supplierId).select('name');
          return {
            supplierId,
            supplierName: supplier ? supplier.name : 'Inconnu',
            totalAmount: totals.totalAmount,
            totalPaid: totals.totalPaid,
            remaining: totals.totalAmount - totals.totalPaid
          };
        })
    );
    
    res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalSuppliers: suppliers.length,
          totalInvoices,
          totalAmount,
          totalPaid,
          totalRemaining,
          overdueInvoices: overdueInvoices.length,
          overdueAmount,
          paymentRate: Math.round(paymentRate * 100) / 100
        },
        statusBreakdown,
        topSuppliers
      }
    });
  } catch (error) {
    next(error);
  }
};