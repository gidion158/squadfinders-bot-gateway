import basicAuth from 'express-basic-auth';
import { config } from '../config/index.js';

export const authMiddleware = basicAuth({
  users: { [config.adminAuth.user]: config.adminAuth.pass },
  challenge: true,
  realm: 'SquadFinders API'
});