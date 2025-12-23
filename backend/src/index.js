// --- FINAL SERVER IMPLEMENTATION ---
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const seedDatabase = require('../scripts/seed');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/rent', require('./routes/rent'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/extras', require('./routes/extras'));

// --- Central Error Handler ---
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Seeding...');
      await seedDatabase();
    } else {
      console.log('Database already populated.');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running successfully on port ${PORT}`));
  } catch (error) {
    console.error('FATAL: Could not start server.', error);
    process.exit(1);
  }
};

startServer();