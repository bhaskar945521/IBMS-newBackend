const Invoice = require("../Models/Invoice");

// Controller to get dashboard data
const getDashboardData = async (req, res) => {
  try {
    // Total number of invoices
    const totalInvoices = await Invoice.countDocuments();

    // Total revenue from all invoices
    const totalRevenueData = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // 5 most recent invoices
    const recentInvoices = await Invoice.find()
      .sort({ date: -1 })
      .limit(5)
      .select("customerName totalAmount date");

    // Top 5 products sold (by quantity)
    const topProducts = await Invoice.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          totalSold: 1
        }
      }
    ]);

    // Final response
    res.status(200).json({
      totalInvoices,
      totalRevenue,
      recentInvoices,
      topProducts
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Dashboard data fetch failed" });
  }
};

module.exports = { getDashboardData };
