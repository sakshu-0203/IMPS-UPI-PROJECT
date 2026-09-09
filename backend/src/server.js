require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDatabase } = require('./config/database');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const operationsRoutes = require('./routes/operationsRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  let responseBody = null;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };
  console.log(`${req.method} ${req.originalUrl}`);
  res.on('finish', async () => {
    try {
      const { pool } = require('./config/database');
      await pool.query(
        `INSERT INTO api_logs (api_name, request_method, endpoint, request_body, response_body, status_code, execution_time_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.originalUrl.split('?')[0],
          req.method,
          req.originalUrl,
          req.method === 'GET' ? null : JSON.stringify(req.body || {}),
          responseBody ? JSON.stringify(responseBody) : null,
          res.statusCode,
          Date.now() - startedAt
        ]
      );
    } catch (logError) {
      console.error('API log write failed:', logError.message);
    }
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IMPS-UPI Backend is running',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/operations', operationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Backend error:', error);

  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error.'
  });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log('====================================');
      console.log('IMPS-UPI BACKEND SERVER');
      console.log('====================================');
      console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`Port        : ${PORT}`);
      console.log(`API         : http://localhost:${PORT}`);
      console.log(`Health      : http://localhost:${PORT}/api/health`);
      console.log(`Dashboard   : http://localhost:${PORT}/api/dashboard/summary`);
      console.log('====================================');
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

startServer();
