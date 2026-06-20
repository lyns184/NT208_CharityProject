const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');
const { successResponse } = require('./src/utils/response');

// Import module routes
const authRoutes = require('./src/modules/auth/auth.routes');
const campaignRoutes = require('./src/modules/campaign/campaign.routes');
const userRoutes = require('./src/modules/user/user.routes');
const adminRoutes = require('./src/modules/admin/admin.routes');
const paymentRoutes = require('./src/modules/payment/payment.routes');
const uploadRoutes = require('./src/modules/upload/upload.routes');
const disbursementRoutes = require('./src/modules/disbursement/disbursement.routes');
const socialRoutes = require('./src/modules/social/social.routes');
const verifyRoutes = require('./src/modules/verify/verify.routes');
const chatRoutes = require('./src/modules/chat/chat.routes');
const reportRoutes = require('./src/modules/report/report.routes');
const videoRoutes = require('./src/modules/video/video.routes');
const locationRoutes = require('./src/modules/location/location.routes');
const campaignAssistantRoutes = require('./src/modules/campaign-assistant/campaign-assistant.routes');
const { initChatSocket } = require('./src/modules/chat/chat.socket');
const startCronJobs = require('./src/utils/cronJobs');

const app = express();
const server = http.createServer(app);

connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json(successResponse({}, '✅ Server đang chạy!'));
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/disbursement', disbursementRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/verify', verifyRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/campaign-assistant', campaignAssistantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route không tồn tại',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

startCronJobs();

initChatSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
