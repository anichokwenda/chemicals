const validateChemical = (req, res, next) => {
  const { name, concentration, batch_no, supplier, mfg_date, expiry_date, quantity, unit } = req.body;
  if (!name ||!concentration ||!batch_no ||!supplier ||!mfg_date ||!expiry_date || quantity == null ||!unit) {
    return res.status(400).json({ error: "Missing required fields: name, concentration, batch_no, supplier, mfg_date, expiry_date, quantity, unit" });
  }
  if (isNaN(quantity) || quantity < 0) {
    return res.status(400).json({ error: "quantity must be a number >= 0" });
  }
  if (new Date(expiry_date) <= new Date(mfg_date)) {
    return res.status(400).json({ error: "expiry_date must be after mfg_date" });
  }
  next();
};
module.exports = { validateChemical };