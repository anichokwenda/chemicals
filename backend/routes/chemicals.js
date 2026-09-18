const express = require('express');
const mongoose = require('mongoose');
const Chemical = require('../models/chemical');
const { validateChemical } = require('../middleware/validate');
const router = express.Router();

// --- RUBRIC REQUIRED CRUD ---
// GET all
router.get('/', async (req, res) => {
  try {
    const chemicals = await Chemical.find();
    res.status(200).json(chemicals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const chem = await Chemical.findById(req.params.id);
    if (!chem) return res.status(404).json({ msg: "Chemical Not Found" });
    res.status(200).json(chem);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post('/', validateChemical, async (req, res) => {
  try {
    const chem = await Chemical.create(req.body);
    res.status(201).json(chem);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT update
router.put('/:id', validateChemical, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const updated = await Chemical.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ msg: "Chemical Not Found" });
    res.status(200).json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const deleted = await Chemical.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Chemical Not Found" });
    res.status(200).json({ msg: "Deleted", id: req.params.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- YOUR CUSTOM ROUTES (Keep them as extra) ---
router.get('/dashboard/expiring', async (req, res) => {
  try {
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);
    const expiring = await Chemical.find({ expiry_date: { $lte: sixtyDays, $gte: new Date() } });
    res.status(200).json(expiring);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;