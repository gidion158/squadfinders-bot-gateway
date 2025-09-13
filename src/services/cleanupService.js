import { UserSeen, Player } from '../models/index.js';
import { config } from '../config/index.js';

export class CleanupService {
  constructor() {
    this.userSeenIntervalId = null;
    this.playerIntervalId = null;
    this.isUserSeenRunning = false;
    this.isPlayerRunning = false;
  }

  // Start all cleanup services
  startAll() {
    this.startUserSeenCleanup();
    this.startPlayerCleanup();
  }

  // Stop all cleanup services
  stopAll() {
    this.stopUserSeenCleanup();
    this.stopPlayerCleanup();
  }

  // Start UserSeen cleanup service
  startUserSeenCleanup() {
    if (!config.userSeenCleanup.enabled) {
      console.log('⚠️ UserSeen cleanup service is disabled');
      return;
    }

    if (this.isUserSeenRunning) {
      console.log('⚠️ UserSeen cleanup service is already running');
      return;
    }

    const intervalHours = config.userSeenCleanup.intervalHours;
    console.log(`🕒 Starting UserSeen cleanup service (checking every ${intervalHours} hour(s), disabling after ${config.userSeenCleanup.disableAfterHours} hours)`);
    
    this.userSeenIntervalId = setInterval(async () => {
      await this.cleanupUserSeen();
    }, intervalHours * 60 * 60 * 1000);
    
    this.isUserSeenRunning = true;
    
    // Run immediately on start
    this.cleanupUserSeen();
  }

  // Stop UserSeen cleanup service
  stopUserSeenCleanup() {
    if (this.userSeenIntervalId) {
      clearInterval(this.userSeenIntervalId);
      this.userSeenIntervalId = null;
      this.isUserSeenRunning = false;
      console.log('🛑 UserSeen cleanup service stopped');
    }
  }

  // Start Player cleanup service
  startPlayerCleanup() {
    if (!config.playerCleanup.enabled) {
      console.log('⚠️ Player cleanup service is disabled');
      return;
    }

    if (this.isPlayerRunning) {
      console.log('⚠️ Player cleanup service is already running');
      return;
    }

    const intervalHours = config.playerCleanup.intervalHours;
    console.log(`🕒 Starting Player cleanup service (checking every ${intervalHours} hour(s), disabling after ${config.playerCleanup.disableAfterHours} hours)`);
    
    this.playerIntervalId = setInterval(async () => {
      await this.cleanupPlayers();
    }, intervalHours * 60 * 60 * 1000);
    
    this.isPlayerRunning = true;
    
    // Run immediately on start
    this.cleanupPlayers();
  }

  // Stop Player cleanup service
  stopPlayerCleanup() {
    if (this.playerIntervalId) {
      clearInterval(this.playerIntervalId);
      this.playerIntervalId = null;
      this.isPlayerRunning = false;
      console.log('🛑 Player cleanup service stopped');
    }
  }

  // Disable UserSeen records older than configured hours
  async cleanupUserSeen() {
    if (!config.userSeenCleanup.enabled) return;

    try {
      const cutoffTime = new Date(Date.now() - config.userSeenCleanup.disableAfterHours * 60 * 60 * 1000);
      
      const result = await UserSeen.updateMany(
        {
          active: true,
          updatedAt: { $lt: cutoffTime }
        },
        {
          $set: { active: false }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Disabled ${result.modifiedCount} UserSeen records (older than ${config.userSeenCleanup.disableAfterHours} hours)`);
      }
    } catch (error) {
      console.error('❌ Error in UserSeen cleanup service:', error.message);
    }
  }

  // Disable Players with message_date older than configured hours
  async cleanupPlayers() {
    if (!config.playerCleanup.enabled) return;

    try {
      const cutoffTime = new Date(Date.now() - config.playerCleanup.disableAfterHours * 60 * 60 * 1000);
      
      const result = await Player.updateMany(
        {
          active: true,
          message_date: { $lt: cutoffTime }
        },
        {
          $set: { active: false }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Disabled ${result.modifiedCount} Players (message_date older than ${config.playerCleanup.disableAfterHours} hours)`);
      }
    } catch (error) {
      console.error('❌ Error in Player cleanup service:', error.message);
    }
  }

  // Get service status
  getStatus() {
    return {
      userSeen: {
        isRunning: this.isUserSeenRunning,
        enabled: config.userSeenCleanup.enabled,
        disableAfterHours: config.userSeenCleanup.disableAfterHours,
        intervalHours: config.userSeenCleanup.intervalHours,
        intervalId: this.userSeenIntervalId
      },
      player: {
        isRunning: this.isPlayerRunning,
        enabled: config.playerCleanup.enabled,
        disableAfterHours: config.playerCleanup.disableAfterHours,
        intervalHours: config.playerCleanup.intervalHours,
        intervalId: this.playerIntervalId
      }
    };
  }
}

// Create singleton instance
export const cleanupService = new CleanupService();