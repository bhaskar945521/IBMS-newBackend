const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel');

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById // ✅ Add this controller
} = require('../Controllers/ProductController');

// ✅ Create new product
router.post('/add', addProduct);

// ✅ Get all products
router.get('/all', getProducts);

// ✅ Get product by ID (for edit page)
router.get('/:id', getProductById); // ✅ THIS was missing

// ✅ Update product by ID
router.put('/:id', updateProduct);

// ✅ Delete product by ID
router.delete('/:id', deleteProduct);

// ✅ Search products by name (case-insensitive)
router.get('/search', async (req, res) => {
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

module.exports = router;
