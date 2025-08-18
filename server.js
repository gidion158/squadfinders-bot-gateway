import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as AdminJSMongoose from '@adminjs/mongoose';

import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import basicAuth from 'express-basic-auth';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import playerRoutes from './routes/players.js';
import {Player, AdminUser} from './models/player.js';
import {config} from './config.js';

// Register AdminJS Mongoose adapter
AdminJS.registerAdapter(AdminJSMongoose);

// MongoDB Connection
await mongoose.connect(config.mongodb.uri);
console.log('✅ MongoDB connected');

// Auth Middleware for API 
const authMiddleware = basicAuth({
    users: {[config.adminAuth.user]: config.adminAuth.pass},
    challenge: true
});

// Express Setup
const app = express();
app.use(express.json());

// Swagger Setup 
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: config.swagger.title,
            version: config.swagger.version,
            description: config.swagger.description,
        },
        servers: [
            {
                url: `${config.server.url}:${config.server.port}`,
            },
        ],
        components: {
            securitySchemes: {
                basicAuth: {type: 'http', scheme: 'basic'}
            }
        },
        security: [{basicAuth: []}]
    },
    apis: ['./routes/players.js']
});


// Mount Routes
// app.use('/docs', authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/players', playerRoutes);

// For Cannot GET / Message
app.get('/', (req, res) => {
    res.sendStatus(405);
});

// ADMINJS SETUP WITH ROLE-BASED ACCESS CONTROL
const isAdmin = ({currentAdmin}) => currentAdmin && currentAdmin.role === 'admin';
const viewerRole = {
    // The 'viewer' role can only see lists and individual records admin can add
    new: {isAccessible: isAdmin},
    edit: {isAccessible: isAdmin},
    delete: {isAccessible: isAdmin},
    bulkDelete: {isAccessible: isAdmin},
    // Everyone can see the list and individual records
    list: {isAccessible: true},
    show: {isAccessible: true},
}
const adminRole = {
    // The 'viewer' role can only see lists and individual records
    new: {isAccessible: isAdmin},
    edit: {isAccessible: isAdmin},
    delete: {isAccessible: isAdmin},
    bulkDelete: {isAccessible: isAdmin},
    // admin role only access
    list: {isAccessible: isAdmin},
    show: {isAccessible: isAdmin},
}

const admin = new AdminJS({
    resources: [
        {
            resource: Player,
            options: {
                actions: viewerRole,
                listProperties: ['message_date', 'platform', 'group.group_title', 'sender.username', 'players_count', 'game_mode', 'active'],
                filterProperties: ['platform', 'active', 'sender.gender', 'group.group_username', 'message_date', 'game_mode'],
                showProperties: ['message_id', 'message_date', 'platform', 'group.group_id', 'group.group_title', 'sender.id', 'sender.username', 'sender.gender', 'rank', 'active', 'players_count', 'game_mode','message', 'createdAt', 'updatedAt']
            }
        },
        {
            resource: AdminUser,
            options: {
                actions: adminRole,
                properties: {
                    password: {
                        isVisible: {list: false, show: false, edit: true, filter: false}
                    }
                }
            }
        }
    ],
    rootPath: '/admin',
    branding: {companyName: 'Bot Gateway'}
});


// ===== UPDATE ADMINJS AUTHENTICATION ROUTER =====
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    // The new authenticate function
    authenticate: async (email, password) => {
        const user = await AdminUser.findOne({email});
        if (user) {
            const matched = await bcrypt.compare(password, user.password);
            if (matched) {
                // IMPORTANT: Return the user object, including the role.
                // AdminJS will pass this as 'currentAdmin' to the access control rules.
                return user;
            }
        }
        return false;
    },
    cookieName: config.cookie.name,
    cookiePassword: config.cookie.secret
});

// admin route
app.use(admin.options.rootPath, adminRouter);

// Start Server
const URL = config.server.url;
const PORT = config.server.port;
const proxy_pass = config.server.proxypass;
app.listen(PORT, () => {
        // for proxy pass via nginx
        if (proxy_pass === 'true') {
            console.log(`✅ Admin: ${URL}/admin | API: ${URL}/api/players/`)
        } else {
            console.log(`✅ Admin: ${URL}:${PORT}/admin | API: ${URL}:${PORT}/api/players/`)
        }
    }
);