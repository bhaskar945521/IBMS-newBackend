// routes/InvoiceRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/VerifyToken.js');
const {
  createInvoice,
  getAllInvoices,
  searchInvoices,
  getInvoiceById,
  sendInvoiceOnWhatsApp,
  createInvoiceValidators
} = require('../Controllers/InvoiceController');

// ✅ Create Invoice
router.post('/create', verifyToken, createInvoiceValidators, createInvoice);

// ✅ Get All Invoices (Invoice History)
router.get('/all', verifyToken, getAllInvoices);

// ✅ Search Invoices
router.get('/search', verifyToken, searchInvoices);

// ✅ Get Invoice by ID (for viewing full invoice)
router.get('/:id', verifyToken, getInvoiceById);

// ✅ Send Invoice via WhatsApp
router.post('/send-whatsapp', verifyToken, sendInvoiceOnWhatsApp);

module.exports = router;
