const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Le montant du paiement est requis'],
    min: [0.01, 'Le montant minimum est de 0.01']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);