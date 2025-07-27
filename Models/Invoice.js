const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  customerName: String,
  customerNumber: String,
  date: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ],
  subtotal: Number,
  gst: Number,
  grandTotal: Number
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
