require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./Routes/userRoutes');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://10.12.84.101:27017/eksamen';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.json());
app.use('/api/v1', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
