const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel');
const Invoice = require('../Models/InvoiceModel');

router.get('/overview', async (req, res) => {
  try {
    const { range, from, to } = req.query;

    // 📅 Step 1.2: Filter logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate;
    let endDate;

    if (range === 'today') {
      startDate = new Date(today);
    } else if (range === 'week') {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (range === 'custom' && from && to) {
      startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    }

    // 🔍 Build filter query
    const invoiceFilter = {};
    if (range === 'custom' && startDate && endDate) {
      invoiceFilter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      invoiceFilter.createdAt = { $gte: startDate };
    }

    // 🚀 Fetch data
    const totalProducts = await Product.countDocuments();
    const totalInvoices = await Invoice.countDocuments(invoiceFilter);
    const invoices = await Invoice.find(invoiceFilter);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const todaysSales = totalRevenue;

    // 🏆 Top Products
    const productSalesMap = {};
    invoices.forEach(invoice => {
      invoice.items?.forEach(item => {
        if (item?.name && typeof item.quantity === 'number') {
          productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // ⚠️ Low stock products
    const lowStockProducts = await Product.find({ quantity: { $lt: 5 } });

    // 🕓 Recent Invoices
    const recentInvoices = await Invoice.find(invoiceFilter).sort({ createdAt: -1 }).limit(5);

    // 📊 Step 2.1: Revenue Over Time (Group by date)
    const groupedRevenue = {};
    invoices.forEach((inv) => {
      const dateKey = new Date(inv.createdAt).toISOString().split('T')[0]; // yyyy-mm-dd
      if (!groupedRevenue[dateKey]) groupedRevenue[dateKey] = 0;
      groupedRevenue[dateKey] += inv.grandTotal || 0;
    });

    const revenueOverTime = Object.entries(groupedRevenue)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, total]) => ({ date, total }));

    // ✅ Final Response
    res.json({
      totalProducts,
      totalInvoices,
      totalRevenue,
      todaysSales,
      topProducts,
      lowStockProducts,
      recentInvoices,
      revenueOverTime, // ✅ Step 2.1 output
    });

  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
