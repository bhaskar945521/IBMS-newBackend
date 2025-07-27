const Product = require('../Models/Product');
const Invoice = require('../Models/Invoice');

exports.getDashboardOverview = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const allInvoices = await Invoice.find();
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const lowStockProducts = await Product.find({ quantity: { $lt: 5 } });
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProducts,
      totalInvoices,
      totalRevenue,
      lowStockProducts,
      recentInvoices
    });
  } catch (error) {
    res.status(500).json({ error: "Dashboard overview failed" });
  }
};
