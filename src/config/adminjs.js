import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Player, Message, AdminUser, DeletedMessage } from '../models/index.js';
import { componentLoader } from './componentLoader.js';

// Register AdminJS Mongoose adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Role-based access control
const isAdmin = ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin';

const viewerRole = {
  new: { isAccessible: isAdmin },
  edit: { isAccessible: isAdmin },
  delete: { isAccessible: isAdmin },
  bulkDelete: { isAccessible: isAdmin },
  list: { isAccessible: true },
  show: { isAccessible: true },
};

const adminRole = {
  new: { isAccessible: isAdmin },
  edit: { isAccessible: isAdmin },
  delete: { isAccessible: isAdmin },
  bulkDelete: { isAccessible: isAdmin },
  list: { isAccessible: isAdmin },
  show: { isAccessible: isAdmin },
};

export const adminJS = new AdminJS({
  componentLoader,
  dashboard: {
    component: componentLoader.add('Dashboard', '../components/Dashboard'),
    handler: async (request, response, context) => {
      // This ensures the dashboard component has access to the current admin
      return {
        currentAdmin: context.currentAdmin
      };
    }
  },
  resources: [
    {
      resource: Player,
      options: {
        perPage: 100,
        actions: viewerRole,
        navigation: {
          name: 'Game Data',
          icon: 'Users'
        },
        listProperties: [
          'message_date',
          'platform',
          'group.group_title',
          'sender.username',
          'players_count',
          'game_mode',
          'active'
        ],
        filterProperties: [
          'platform',
          'active',
          'group.group_username',
          'message_date',
          'game_mode'
        ],
        showProperties: [
          'message_id',
          'message_date',
          'platform',
          'group.group_id',
          'group.group_title',
          'group.group_username',
          'sender.id',
          'sender.username',
          'sender.name',
          'rank',
          'active',
          'players_count',
          'game_mode',
          'message',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: Message,
      options: {
        perPage: 100,
        actions: viewerRole,
        navigation: {
          name: 'Game Data',
          icon: 'MessageSquare'
        },
        listProperties: [
          'message_date',
          'group.group_title',
          'sender.username',
          'message',
          'is_valid',
          'is_lfg',
          'ai_status'
        ],
        filterProperties: [
          'group.group_username',
          'sender.username',
          'message_date',
          'is_valid',
          'is_lfg',
          'ai_status'
        ],
        showProperties: [
          'message_id',
          'message_date',
          'group.group_id',
          'group.group_title',
          'group.group_username',
          'sender.id',
          'sender.username',
          'sender.name',
          'message',
          'is_valid',
          'is_lfg',
          'reason',
          'ai_status',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: DeletedMessage,
      options: {
        perPage: 100,
        actions: {
          new: { isAccessible: false }, // Don't allow creating deleted messages manually
          edit: { isAccessible: false }, // Don't allow editing deleted messages
          delete: { isAccessible: isAdmin }, // Only admins can delete from deleted messages
          bulkDelete: { isAccessible: isAdmin },
          list: { isAccessible: true },
          show: { isAccessible: true },
        },
        navigation: {
          name: 'Analytics',
          icon: 'Archive'
        },
        listProperties: [
          'deleted_at',
          'original_message_id',
          'group.group_title',
          'sender.username',
          'deletion_time_minutes',
          'is_valid',
          'ai_status'
        ],
        filterProperties: [
          'group.group_username',
          'sender.username',
          'deleted_at',
          'is_valid',
          'is_lfg',
          'ai_status'
        ],
        showProperties: [
          'original_message_id',
          'message_date',
          'deleted_at',
          'deletion_time_minutes',
          'group.group_id',
          'group.group_title',
          'group.group_username',
          'sender.id',
          'sender.username',
          'sender.name',
          'message',
          'is_valid',
          'is_lfg',
          'reason',
          'ai_status',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: DeletedMessage,
      options: {
        perPage: 100,
        actions: {
          new: { isAccessible: false }, // Don't allow creating deleted messages manually
          edit: { isAccessible: false }, // Don't allow editing deleted messages
          delete: { isAccessible: isAdmin }, // Only admins can delete from deleted messages
          bulkDelete: { isAccessible: isAdmin },
          list: { isAccessible: true },
          show: { isAccessible: true },
        },
        navigation: {
          name: 'Analytics',
          icon: 'Archive'
        },
        listProperties: [
          'deleted_at',
          'original_message_id',
          'group.group_title',
          'sender.username',
          'deletion_time_minutes',
          'is_valid',
          'ai_status'
        ],
        filterProperties: [
          'group.group_username',
          'sender.username',
          'deleted_at',
          'is_valid',
          'is_lfg',
          'ai_status'
        ],
        showProperties: [
          'original_message_id',
          'message_date',
          'deleted_at',
          'deletion_time_minutes',
          'group.group_id',
          'group.group_title',
          'group.group_username',
          'sender.id',
          'sender.username',
          'sender.name',
          'message',
          'is_valid',
          'is_lfg',
          'reason',
          'ai_status',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: AdminUser,
      options: {
        perPage: 100,
        actions: adminRole,
        navigation: {
          name: 'Administration',
          icon: 'Shield'
        },
        properties: {
          password: {
            isVisible: {
              list: false,
              show: false,
              edit: true,
              filter: false
            }
          }
        }
      }
    }
  ],
  rootPath: '/admin',
  locale: {
    language: 'en',
    availableLanguages: ['en'],
    translations: {
      en: {
        labels: {
          Player: 'Player',
          players: 'Players',
          Message: 'Message',
          messages: 'Messages',
          AdminUser: 'Admin User',
          adminUsers: 'Admin Users',
          DeletedMessage: 'Deleted Message',
          deletedMessages: 'Deleted Messages'
        }
      }
    }
  },
  branding: {
    companyName: 'SquadFinders',
    logo: false,
    theme: {
      colors: {
        primary100: '#667eea',
        primary80: '#764ba2',
        primary60: '#f093fb',
        primary40: '#4facfe',
        primary20: '#00f2fe'
      }
    }
  }
});