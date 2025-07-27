const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel');
const verifyToken = require('../Middleware/VerifyToken.js');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById,
  addProductValidators,
  updateProductValidators
} = require('../Controllers/ProductController');

// ✅ Create new product
router.post('/add', verifyToken, addProductValidators, addProduct);

// ✅ Get all products
router.get('/all', verifyToken, getProducts);

// ✅ Search products by name (case-insensitive)
router.get('/search', verifyToken, async (req, res) => {
  try {
    const query = req.query.q || '';
    const products = await Product.find({
      name: { $regex: query, $options: 'i' }
    }).limit(10);
    res.json(products);
  } catch (err) {
    console.error('❌ Product search error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Get product by ID (for edit page)
router.get('/:id', verifyToken, getProductById); // ✅ THIS was missing

// ✅ Update product by ID
router.put('/:id', verifyToken, updateProductValidators, updateProduct);

// ✅ Delete product by ID
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
