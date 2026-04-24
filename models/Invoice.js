const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant doit être positif']
  },
  dueDate: {
    type: Date,
    required: [true, 'La date d\'échéance est requise']
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour automatique du statut avant sauvegarde
invoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.paidAmount >= this.amount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  } else {
    this.status = 'unpaid';
  }
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);