const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  gst: { type: Number, default: 18 }, // GST rate in percentage
}, { timestamps: true });

module.exports = mongoose.model('Products', productSchema);
