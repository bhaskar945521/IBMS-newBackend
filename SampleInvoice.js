const mongoose = require('mongoose');
require('dotenv').config();

const Invoice = require('./Models/InvoiceModel');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const sampleInvoice = new Invoice({
  invoiceNumber: 'INV001',
  customerName: 'John Doe',
  items: [
    { name: 'Mouse', price: 300, quantity: 2 },
    { name: 'Keyboard', price: 500, quantity: 1 }
  ],
  grandTotal: 1100
});

sampleInvoice.save()
  .then(() => {
    console.log("Sample Invoice inserted ✅");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Insert failed ❌", err);
    mongoose.disconnect();
  });
