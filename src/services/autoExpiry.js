import { Message } from '../models/index.js';
import { config } from '../config/index.js';

export class AutoExpiryService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.enabled = config.autoExpiry.enabled;
    this.expiryMinutes = config.autoExpiry.expiryMinutes;
    this.intervalMinutes = config.autoExpiry.intervalMinutes;
  }

  // Start the auto-expiry job
  start(intervalMinutes = null) {
    if (!this.enabled) {
      console.log('⚠️ Auto-expiry service is disabled');
      return;
    }

    if (this.isRunning) {
      console.log('⚠️ Auto-expiry service is already running');
      return;
    }

    const interval = intervalMinutes || this.intervalMinutes;
    console.log(`🕒 Starting auto-expiry service (checking every ${interval} minute(s), expiring after ${this.expiryMinutes} minutes)`);
    
    this.intervalId = setInterval(async () => {
      await this.expireOldMessages();
    }, interval * 60 * 1000);
    
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

  // Enable/disable the service
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.isRunning) {
      this.stop();
    }
  }

  // Update expiry time
  setExpiryMinutes(minutes) {
    this.expiryMinutes = minutes;
    console.log(`⏰ Auto-expiry time updated to ${minutes} minutes`);
  }

  // Expire messages older than configured minutes that are still pending
  async expireOldMessages() {
    if (!this.enabled) return;

    try {
      const expiryTime = new Date(Date.now() - this.expiryMinutes * 60 * 1000);
      
      // Process in batches to handle large datasets efficiently
      const batchSize = 1000;
      let totalExpired = 0;
      
      while (true) {
        const result = await Message.updateMany(
          {
            ai_status: { $in: ['pending', 'pending_prefilter'] },
            message_date: { $lt: expiryTime } // Use message_date instead of createdAt
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
        console.log(`⏰ Expired ${totalExpired} old pending/prefilter messages (older than ${this.expiryMinutes} minutes)`);
      }
    } catch (error) {
      console.error('❌ Error in auto-expiry service:', error.message);
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      enabled: this.enabled,
      expiryMinutes: this.expiryMinutes,
      intervalMinutes: this.intervalMinutes,
      intervalId: this.intervalId
    };
  }
}

// Create singleton instance
export const autoExpiryService = new AutoExpiryService();