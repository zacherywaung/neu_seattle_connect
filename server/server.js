const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/posts',    require('./routes/posts'));
app.use('/api/courses',  require('./routes/courses'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/search',   require('./routes/search'));

// Health check
app.get('/', (req, res) => res.send('NEU Seattle Connect API is running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));