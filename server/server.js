const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/posts',   require('./routes/posts'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users',   require('./routes/users'));

// Health check
app.get('/', (req, res) => res.send('JJEZ API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));