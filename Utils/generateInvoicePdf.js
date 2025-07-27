// utils/generateInvoicePdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePdf = (invoice) => {
  return new Promise((resolve, reject) => {
    const invoiceDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(invoiceDir, filename);

    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Customer Name: ${invoice.customer.name}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    invoice.items.forEach((item) => {
      doc.text(`${item.name} x ${item.quantity} = ₹${item.total}`);
    });

    doc.moveDown();
    doc.text(`GST (18%): ₹${invoice.gst}`);
    doc.text(`Grand Total: ₹${invoice.grandTotal}`, { bold: true });
    doc.moveDown();
    doc.text('Thank you for your purchase!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = generateInvoicePdf;
