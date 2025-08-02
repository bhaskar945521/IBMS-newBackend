const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String } // optional, for WhatsApp sending
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  serialNo: { type: String, default: null }, // Add this field to avoid duplicate key error
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: customerSchema, required: true },
  items: { type: [itemSchema], required: true },
  gst: { type: Number, required: true },
  grandTotal: { type: Number, required: true }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Invoice', invoiceSchema);
