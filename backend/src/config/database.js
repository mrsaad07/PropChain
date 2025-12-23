const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('[DB] Attempting to connect to MongoDB...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DB] FATAL: MongoDB Connection Failed. Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;