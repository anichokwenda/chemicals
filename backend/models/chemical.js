const mongoose = require('mongoose');

const chemicalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  concentration: { type: String, required: true },
  batch_no: { type: String, required: true },
  supplier: { type: String, required: true }, // KEEP AS STRING - no breaking change
  mfg_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  location: String,
  hazard_class: String,
  ppe: [String],
  incompatible_with: [String],
  sds_url: String,
  status: { type: String, enum: ["In Stock", "Low", "Empty", "Expired"], default: "In Stock" }
}, { timestamps: true });

module.exports = mongoose.model('Chemical', chemicalSchema);