import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

dotenv.config();

mongoose.connect(process.env.MONGO_URL_PROD, {
  serverSelectionTimeoutMS: 40000,
  socketTimeoutMS: 45000,
});

// mongoose.connect(process.env.TEST_DB, {
//   serverSelectionTimeoutMS: 40000,
//   socketTimeoutMS: 45000,
// });

const conn = mongoose.connection;

conn.on('connected', () => {
  console.log('Database is connected');
});

conn.on('disconnected', () => {
  console.log('Database is disconnected');
});

conn.on('error', (err) => {
  console.log('Database connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Database connection closed due to app termination');
  process.exit(0);
});

export default conn;
