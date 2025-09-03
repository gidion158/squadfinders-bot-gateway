import { Message } from '../models/index.js';

export class AutoExpiryService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Start the auto-expiry job
  start(intervalMinutes = 1) {
    if (this.isRunning) {
      console.log('⚠️ Auto-expiry service is already running');
      return;
    }

    console.log(`🕒 Starting auto-expiry service (checking every ${intervalMinutes} minute(s))`);
    
    this.intervalId = setInterval(async () => {
      await this.expireOldMessages();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
    
    // Run immediately on start
    this.expireOldMessages();
  }

  // Stop the auto-expiry job
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Auto-expiry service stopped');
    }
  }

  // Expire messages older than 5 minutes that are still pending
  async expireOldMessages() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Process in batches to handle large datasets efficiently
      const batchSize = 1000;
      let totalExpired = 0;
      
      while (true) {
        const result = await Message.updateMany(
          {
            ai_status: 'pending',
            createdAt: { $lt: fiveMinutesAgo }
          },
          {
            $set: { ai_status: 'expired' }
          },
          { limit: batchSize }
        );

        totalExpired += result.modifiedCount;
        
        // If we processed fewer than the batch size, we're done
        if (result.modifiedCount < batchSize) {
          break;
        }
      }

      if (totalExpired > 0) {
        console.log(`⏰ Expired ${totalExpired} old pending messages`);
      }
    } catch (error) {
      console.error('❌ Error in auto-expiry service:', error.message);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId
    };
  }
}

// Create singleton instance
export const autoExpiryService = new AutoExpiryService();