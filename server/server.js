const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const adminRoutes = require('./routes/adminRoutes');

const path = require('path');
const fs = require('fs');

// Load env vars from server/.env as well as cwd
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

const path = require('path');
const fs = require('fs');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets if frontend build exists
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*splat', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Speakwise AI API is running... (React build not found. Run "npm run build" in client folder)');
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
