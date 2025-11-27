const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const prisma = require('./prismaClient');
const imageRoutes = require('./routes/imageRoutes');
const adminAuthRoutes = require('./routes/adminAuth');

app.use(cors());
app.use(express.json());

app.use('/api/images', imageRoutes);
app.use('/api/admin', adminAuthRoutes);

const shutdown = async (signal) => {
  try {
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
};

const start = async () => {
  try {
    await prisma.$connect();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));

start();
