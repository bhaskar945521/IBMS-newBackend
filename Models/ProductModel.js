const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    required: true,
    trim: true,
    default: 'Standard'  // e.g., '500ml', 'Tablet', 'Box', etc.
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  gst: {
    type: Number,
    default: 18,
    min: 0
  }
}, { timestamps: true });

// ✅ Make combination of name + variant unique
productSchema.index({ name: 1, variant: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
