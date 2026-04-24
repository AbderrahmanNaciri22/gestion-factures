const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true
  },
  contact: {
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    phone: String,
    address: String
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

// Index composé pour éviter les doublons de nom par client
supplierSchema.index({ name: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Supplier', supplierSchema);