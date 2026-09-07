import mongoose from 'mongoose';

// Disable buffering so Mongoose queries don't hang when MongoDB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personalized_learning';
    console.log('Connecting to MongoDB...');

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of 30
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Initial Connection Error: ${error.message}`);
    console.log('Server is continuing to run. Please check your MONGODB_URI in the .env file.');
  }
};

// Monitor connection events
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection disconnected');
});

export default connectDB;
