const Product = require('../Models/ProductModel');
const { body, validationResult } = require('express-validator');

// ➕ Add Product Validators
exports.addProductValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('variant').trim().notEmpty().withMessage('Variant is required').escape(),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('gst').optional().isInt({ min: 0, max: 100 }).withMessage('GST must be between 0 and 100'),
];

// ➕ Add Product
exports.addProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, variant, quantity, price, gst, category } = req.body;

    // 🔍 Duplicate check for name + variant
    const existingProduct = await Product.findOne({ name, variant });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this name and variant already exists' });
    }

    const product = new Product({
      name,
      variant,
      quantity,
      price,
      gst: gst || 18,
      category: category || 'General'
    });

    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });

  } catch (err) {
    console.error('❌ Error adding product:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate name and variant not allowed' });
    }
    res.status(500).json({ error: 'Add product failed' });
  }
};

// 📃 Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('❌ Error getting products:', err.message);
    res.status(500).json({ error: 'Get products failed' });
  }
};

// 🔍 Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('❌ Error fetching product by ID:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🗑️ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err.message);
    res.status(500).json({ error: 'Delete product failed' });
  }
};

// ✏️ Update Product Validators
exports.updateProductValidators = [
  body('name').optional().trim().notEmpty().escape(),
  body('variant').optional().trim().notEmpty().escape(),
  body('quantity').optional().isInt({ min: 0 }),
  body('price').optional().isFloat({ min: 0 }),
  body('gst').optional().isInt({ min: 0, max: 100 }),
];

// ✏️ Update Product by ID
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, variant, quantity, price, gst, category } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, variant, quantity, price, gst, category },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    console.error("❌ Error updating product:", err.message);
    res.status(500).json({ error: 'Update failed' });
  }
};
