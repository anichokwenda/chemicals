require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const chemicalRoutes = require('./routes/chemical');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
 .then(() => console.log('MongoDB Connected'))
 .catch(err => console.log(err));

app.use('/api/chemicals', chemicalRoutes);

app.get('/', (req, res) => res.send('Compliance Copilot API is running'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});