import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Player, Message, AdminUser, AIResponse } from '../models/index.js';
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
    component: componentLoader.add('Dashboard', '../components/Dashboard')
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
          'is_valid'
        ],
        filterProperties: [
          'group.group_username',
          'sender.username',
          'message_date',
          'is_valid'
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
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: AIResponse,
      options: {
        perPage: 100,
        actions: viewerRole,
        navigation: {
          name: 'AI Analysis',
          icon: 'Brain'
        },
        listProperties: [
          'message_id',
          'message',
          'is_lfg',
          'reason',
          'createdAt'
        ],
        filterProperties: [
          'is_lfg',
          'message_id',
          'createdAt'
        ],
        showProperties: [
          'message_id',
          'message',
          'is_lfg',
          'reason',
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
          AIResponse: 'AI Response',
          aiResponses: 'AI Responses',
          AdminUser: 'Admin User',
          adminUsers: 'Admin Users'
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