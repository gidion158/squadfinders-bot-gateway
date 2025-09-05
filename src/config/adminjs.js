import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Player, Message, AdminUser } from '../models/index.js';
import { DeletedMessageStats, DailyDeletion } from '../models/index.js';
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
        sort: {
          sortBy: 'createdAt',
          direction: 'desc'
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
        sort: {
          sortBy: 'createdAt',
          direction: 'desc'
        },
        properties: {
          ai_status: {
            availableValues: [
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
              { value: 'expired', label: 'Expired' },
            ],
          },
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
        resource: DeletedMessageStats,
        options: {
            name: 'Deletion Stats',
            parent: {
                name: 'Analytics',
                icon: 'Archive'
            },
            actions: {
              new: { isAccessible: false },
              edit: { isAccessible: false },
              delete: { isAccessible: isAdmin },
              bulkDelete: { isAccessible: isAdmin },
              list: { isAccessible: true },
              show: { isAccessible: true },
            },
        }
    },
    {
        resource: DailyDeletion,
        options: {
            name: 'Daily Deletions',
            parent: {
                name: 'Analytics',
                icon: 'Archive'
            },
            actions: {
              new: { isAccessible: false },
              edit: { isAccessible: false },
              delete: { isAccessible: isAdmin },
              bulkDelete: { isAccessible: isAdmin },
              list: { isAccessible: true },
              show: { isAccessible: true },
            },
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
        sort: {
          sortBy: 'createdAt',
          direction: 'desc'
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
          DeletedMessageStats: 'Deletion Stats',
          DailyDeletion: 'Daily Deletions'
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
