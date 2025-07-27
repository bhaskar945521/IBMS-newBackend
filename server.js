require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


// Route imports
const authRoutes = require('./Routes/AuthRoutes');
const productRoutes = require('./Routes/ProductRoutes');
const invoiceRoutes = require('./Routes/InvoiceRoutes');
const dashboardRoutes = require('./Routes/DashboardRoutes');

const app = express();

app.use(cors({origin: "https://ibms-bhaskar.netlify.app", credentials: true}));
app.use(express.json());

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
