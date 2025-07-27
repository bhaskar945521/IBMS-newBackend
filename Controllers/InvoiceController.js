const Invoice = require('../Models/InvoiceModel');
const Product = require('../Models/ProductModel');
const whatsappClient = require('../Utils/Whatsapp');
const { MessageMedia } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const createInvoiceValidators = [
  body('invoiceNumber').trim().notEmpty().escape(),
  body('customer.name').trim().notEmpty().escape(),
  body('customer.phone').optional().trim().escape(),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.name').trim().notEmpty().escape(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('items.*.gst').optional().isInt({ min: 0, max: 100 }),
  body('items.*.total').isFloat({ min: 0 }),
];

// ✅ Create Invoice
const createInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { invoiceNumber, customer, items } = req.body;

    if (!invoiceNumber || !customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required invoice fields' });
    }

    const gst = parseFloat((items.reduce((acc, item) => acc + item.total, 0) * 0.18).toFixed(2));
    const grandTotal = items.reduce((acc, item) => acc + item.total, 0) + gst;

    const invoice = new Invoice({
      invoiceNumber,
      customer,
      items,
      gst,
      grandTotal
    });

    await invoice.save();

    // ✅ Update product quantities after invoice is saved
    for (const item of items) {
      try {
        const product = await Product.findById(item._id);
        if (product) {
          const newQuantity = Math.max(0, product.quantity - item.quantity);
          await Product.findByIdAndUpdate(item._id, { quantity: newQuantity });
          console.log(`✅ Updated ${product.name}: ${product.quantity} → ${newQuantity}`);
        }
      } catch (productErr) {
        console.error(`❌ Error updating product ${item._id}:`, productErr);
      }
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ message: 'Failed to create invoice', error: err.message });
  }
};

// ✅ Get All Invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
};

// ✅ Search Invoices
const searchInvoices = async (req, res) => {
  try {
    const { query } = req.query;
    const invoices = await Invoice.find({
      $or: [
        { invoiceNumber: { $regex: query, $options: 'i' } },
        { 'customer.name': { $regex: query, $options: 'i' } }
      ]
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// ✅ Get Invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoice', error: err.message });
  }
};

// ✅ Generate Invoice PDF
const generateInvoicePDF = async (invoice) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Invoice: ${invoice.invoiceNumber}</h1>
        <p><strong>Customer:</strong> ${invoice.customer.name}</p>
        <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="total">Subtotal: ₹${(invoice.grandTotal - invoice.gst).toFixed(2)}</p>
        <p class="total">GST (18%): ₹${invoice.gst}</p>
        <p class="total">Grand Total: ₹${invoice.grandTotal}</p>
      </body>
    </html>
  `;

  const invoiceDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

  const filePath = path.join(invoiceDir, `${invoice.invoiceNumber}.pdf`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();

  return filePath;
};

// ✅ Send Invoice on WhatsApp
const sendInvoiceOnWhatsApp = async (req, res) => {
  try {
    const { phone, invoiceId } = req.body;

    if (!phone || !invoiceId) {
      return res.status(400).json({ message: 'Phone and invoice ID are required' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const message = `
🧾 *Invoice: ${invoice.invoiceNumber}*
👤 *Customer:* ${invoice.customer.name}
📅 *Date:* ${new Date(invoice.createdAt).toLocaleDateString()}

${invoice.items.map(item =>
  `• ${item.name} x ${item.quantity} @ ₹${item.price} = ₹${item.total}`
).join('\n')}

🧮 *Subtotal:* ₹${(invoice.grandTotal - invoice.gst).toFixed(2)}
🧾 *GST (18%):* ₹${invoice.gst}
💰 *Grand Total:* ₹${invoice.grandTotal}

🙏 Thank you for shopping with us!
`;

    const chatId = `${phone}@c.us`;
    await whatsappClient.sendMessage(chatId, message);

    const pdfPath = await generateInvoicePDF(invoice);
    if (fs.existsSync(pdfPath)) {
      const media = MessageMedia.fromFilePath(pdfPath);
      await whatsappClient.sendMessage(chatId, media);
    }

    res.json({ message: '✅ Invoice sent successfully (text + PDF)' });
  } catch (err) {
    console.error('❌ Error sending invoice:', err);
    res.status(500).json({ message: 'Failed to send invoice on WhatsApp', error: err.message });
  }
};

// ✅ Export everything
module.exports = {
  createInvoice,
  getAllInvoices,
  searchInvoices,
  getInvoiceById,
  sendInvoiceOnWhatsApp,
  createInvoiceValidators
};
