const mongoose = require('mongoose');
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_person: String,
  email: String,
  phone: String,
  address: String
}, { timestamps: true });
module.exports = mongoose.model('Supplier', supplierSchema);