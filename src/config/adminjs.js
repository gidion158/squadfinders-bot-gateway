import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Player, Message, AdminUser } from '../models/index.js';
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
          'sender.gender',
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
          'sender.gender',
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
        listProperties: [
          'message_date',
          'group.group_title',
          'sender.username',
          'message'
        ],
        filterProperties: [
          'group.group_username',
          'sender.username',
          'message_date'
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