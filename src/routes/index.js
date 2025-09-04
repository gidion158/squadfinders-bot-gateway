import express from 'express';
import playerRoutes from './players.js';
import messageRoutes from './messages.js';
import adminUserRoutes from './adminUsers.js';
import dashboardRoutes from './dashboard.js';
import deletedMessageRoutes from './deletedMessages.js';
import deletedMessageRoutes from './deletedMessages.js';

const router = express.Router();

// Mount all routes
router.use('/players', playerRoutes);
router.use('/messages', messageRoutes);
router.use('/admin-users', adminUserRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/deleted-messages', deletedMessageRoutes);
router.use('/deleted-messages', deletedMessageRoutes);

export default router;