const Product = require('../Models/ProductModel');

// ➕ Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, quantity, stock, price, gst } = req.body;

    // Basic validation
    if (!name || !quantity || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = new Product({ 
      name, 
      quantity, 
      price, 
      gst: gst || 18 // Default to 18% if not provided
    });
    await product.save();

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    console.error('❌ Error adding product:', err.message);
    res.status(500).json({ error: 'Add product failed' });
  }
};

// 📃 Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // Latest first
    res.json(products);
  } catch (err) {
    console.error('❌ Error getting products:', err.message);
    res.status(500).json({ error: 'Get products failed' });
  }
};

// 🔍 Get Single Product by ID ✅ (new)
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

// ✏️ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, quantity, price, gst } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, quantity, price, gst },
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
