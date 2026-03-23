import { Router } from 'express';
import type { LoginUser } from '../../../application/usecases/LoginUser.js';
import type { RegisterUser } from '../../../application/usecases/RegisterUser.js';
import { createAuthController } from '../controllers/authController.js';

export function authRoutes(deps: { registerUser: RegisterUser; loginUser: LoginUser }) {
  const router = Router();
  const controller = createAuthController(deps);

  router.post('/register', controller.register);
  router.post('/login', controller.login);

  return router;
}
