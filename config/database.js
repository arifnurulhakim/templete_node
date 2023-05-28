const mongoose = require('mongoose');
const connectionString = process.env.DB_CONNECTION_STRING;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', () => {
  console.log('Database connected successfully');
});

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = db;
