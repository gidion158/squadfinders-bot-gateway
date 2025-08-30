import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.swagger.title,
      version: config.swagger.version,
      description: config.swagger.description,
    },
    servers: [
      {
        url: config.server.proxypass 
          ? config.server.url 
          : `${config.server.url}:${config.server.port}`,
        description: 'API Server'
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Basic HTTP authentication'
        }
      }
    },
    security: [{ basicAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);