const mongoose = require('mongoose');

// Never buffer queries when disconnected to avoid 10-second request hangs
mongoose.set('bufferCommands', false);

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/arena_aiml';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB connection warning: ${error.message}`);
    console.log('ℹ️  Backend active with instant In-Memory Fallback store. Connect a real MongoDB instance or set MONGO_URI in backend/.env whenever available.');
  }
};

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;