const Supplier = require('../models/Supplier');

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact } = req.body;
    
    const supplier = await Supplier.create({
      name,
      contact,
      clientId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ clientId: req.user.id });
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      clientId: req.user.id
    });
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const { name, contact } = req.body;
    
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user.id },
      { name, contact },
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      clientId: req.user.id
    });
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }
    
    // Supprimer aussi les factures liées ?
    // Pour l'instant, on laisse les factures
    
    res.status(200).json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};