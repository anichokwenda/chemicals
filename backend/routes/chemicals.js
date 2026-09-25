const express = require('express');
const router = express.Router();
const Chemical = require('../models/chemical');
const { isAuthenticated } = require('../middleware/authenticate');

// GET all - PUBLIC
router.get('/', async (req, res) => {
  try {
    const chemicals = await Chemical.find().sort({ createdAt: -1 });
    res.json(chemicals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one - PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const chemical = await Chemical.findById(req.params.id);
    if (!chemical) return res.status(404).json({ error: 'Chemical not found' });
    res.json(chemical);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - PROTECTED
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const chemical = new Chemical(req.body);
    const saved = await chemical.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT - PROTECTED
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const updated = await Chemical.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Chemical not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - PROTECTED
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const deleted = await Chemical.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Chemical not found' });
    res.json({ message: 'Chemical deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;