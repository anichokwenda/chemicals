require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chemicals', require('./routes/chemicals'));

// Optional: only load suppliers if file exists
try {
  app.use('/api/suppliers', require('./routes/suppliers'));
} catch (e) {
  console.log('Note: suppliers route not found yet - skipping');
}

// Swagger - only load if installed
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger docs loaded at /api-docs');
} catch (e) {
  console.log('Swagger not configured yet - run swagger.js to generate swagger.json');
}

// Base route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Compliance Copilot API is running - Week 03',
    endpoints: {
      chemicals: '/api/chemicals',
      suppliers: '/api/suppliers',
      docs: '/api-docs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected to chemicalsDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
      console.log(`🔗 Chemicals: http://localhost:${PORT}/api/chemicals`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });