require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

let swaggerDocument = {};
try {
  swaggerDocument = require('./swagger.json');
  console.log('✅ swagger.json loaded');
} catch(e) {
  console.log('⚠️ swagger.json not found, using empty');
  swaggerDocument = {
    swagger: "2.0",
    info: { title: "Temp API", version: "1.0.0" },
    paths: {}
  };
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chemicals', require('./routes/chemicals'));

// SWAGGER - MUST BE BEFORE 404
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({ message: 'API running', docs: '/api-docs' });
});

// 404 - MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT} docs at /api-docs`));
  })
  .catch(err => console.error(err));