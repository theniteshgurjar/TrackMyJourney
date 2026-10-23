const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parser
app.use(express.json());

// API Routes (RailRadar v1 Implementation)
app.use('/api', require('./routes/api'));

// Backward compatibility alias for /api/trains
app.use('/api/trains', require('./routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(require('./middlewares/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`RailRadar Engine running on port ${PORT}`);
});
