/**
 * @file server/config/db.js
 * @description Database connection configuration for the E-commerce Storefront backend.
 *              Connects to MongoDB using Mongoose.
 */

require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * The MongoDB URI is fetched from environment variables for security and flexibility.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful,
 *                          or rejects if an error occurs.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('Error: MONGO_URI is not defined in environment variables.');
      process.exit(1); // Exit process with failure
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,       // Use the new URL parser instead of the deprecated one
      useUnifiedTopology: true,    // Use the new server discovery and monitoring engine
      // useCreateIndex: true,     // Deprecated in Mongoose 6.x
      // useFindAndModify: false   // Deprecated in Mongoose 6.x
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;