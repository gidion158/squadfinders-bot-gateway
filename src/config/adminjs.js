import AdminJS from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Player, Message, AdminUser } from '../models/index.js';
import { DeletedMessageStats, DailyDeletion } from '../models/index.js';
import { PrefilterResult } from '../models/index.js';
import { GamingGroup } from '../models/index.js';
import { UserSeen } from '../models/index.js';
import { CanceledUser, UserMessage } from '../models/index.js';
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
        list: {
          perPage: 50,
        },
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
          'message_id',
          'message_date',
          'group.group_title',
          'sender.username',
          'message',
          'active'
        ],
        filterProperties: [
          'platform',
          'active',
          'sender.username',
          'group.group_username',
          'message_date',
          'game_mode',
          'players_count'
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
        list: {
          perPage: 50,
        },
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
              { value: 'pending_prefilter', label: 'Pending Prefilter' },
            ],
          },
        },
        listProperties: [
          'message_id',
          'message_date',
          'group.group_title',
          'sender.username',
          'message',
          'is_valid',
          'is_lfg',
          'ai_status'
        ],
        filterProperties: [
          'message_id',
          'group.group_username',
          'sender.username',
          'message_date',
          'is_valid',
          'is_lfg',
          'ai_status',
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
      resource: PrefilterResult,
      options: {
        list: {
          perPage: 50,
        },
        actions: viewerRole,
        navigation: {
          name: 'Game Data',
          icon: 'Filter'
        },
        sort: {
          sortBy: 'message_date',
          direction: 'desc'
        },
        listProperties: [
          'message_id',
          'message_date',
          'message',
          'maybe_lfg',
          'confidence'
        ],
        filterProperties: [
          'message_id',
          'message_date',
          'maybe_lfg',
          'confidence'
        ],
        showProperties: [
          'message_id',
          'message',
          'message_date',
          'maybe_lfg',
          'confidence',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: GamingGroup,
      options: {
        list: {
          perPage: 50,
        },
        actions: adminRole,
        navigation: {
          name: 'Game Data',
          icon: 'Users'
        },
        sort: {
          sortBy: 'name',
          direction: 'asc'
        },
        properties: {
          name: {
            description: 'You can add group username or link like IRANR6SGP OR t.me/+9pHPhzzBoc8wNTM8 OR t.me/IRANR6SGP'
          }
        },
        listProperties: [
          'name',
          'active',
          'createdAt',
          'updatedAt'
        ],
        filterProperties: [
          'name',
          'active'
        ],
        showProperties: [
          'name',
          'active',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: UserSeen,
      options: {
        list: {
          perPage: 50,
        },
        actions: {
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
          list: { isAccessible: true },
          show: { isAccessible: true },
        },
        navigation: {
          name: 'Game Data',
          icon: 'Eye'
        },
        sort: {
          sortBy: 'updatedAt',
          direction: 'desc'
        },
        listProperties: [
          'user_id',
          'username',
          'active',
          'updatedAt'
        ],
        filterProperties: [
          'user_id',
          'username',
          'active'
        ],
        showProperties: [
          'user_id',
          'username',
          'seen_ids',
          'active',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: CanceledUser,
      options: {
        list: {
          perPage: 50,
        },
        actions: adminRole,
        navigation: {
          name: 'Game Data',
          icon: 'UserX'
        },
        sort: {
          sortBy: 'createdAt',
          direction: 'desc'
        },
        listProperties: [
          'user_id',
          'username',
          'createdAt',
          'updatedAt'
        ],
        filterProperties: [
          'user_id',
          'username'
        ],
        showProperties: [
          'user_id',
          'username',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: UserMessage,
      options: {
        list: {
          perPage: 50,
        },
        actions: {
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
          list: { isAccessible: true },
          show: { isAccessible: true },
        },
        navigation: {
          name: 'Game Data',
          icon: 'MessageCircle'
        },
        sort: {
          sortBy: 'message_date',
          direction: 'desc'
        },
        listProperties: [
          'user_id',
          'username',
          'message_date',
          'message'
        ],
        filterProperties: [
          'user_id',
          'username',
          'message_date'
        ],
        showProperties: [
          'user_id',
          'username',
          'message_date',
          'message',
          'createdAt',
          'updatedAt'
        ]
      }
    },
    {
      resource: AdminUser,
      options: {
        list: {
            perPage: 50,
        },
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
          PrefilterResult: 'Prefilter Result',
          prefilterResults: 'Prefilter Results',
          DeletedMessageStats: 'Deletion Stats',
          DailyDeletion: 'Daily Deletions',
          GamingGroup: 'Gaming Group',
          gamingGroups: 'Gaming Groups',
          UserSeen: 'User Seen',
          userSeens: 'User Seen',
          CanceledUser: 'Canceled User',
          canceledUsers: 'Canceled Users',
          UserMessage: 'User Message',
          userMessages: 'User Messages'
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