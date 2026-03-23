import { Router } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import { LoginUser } from './application/usecases/LoginUser.js';
import { RegisterUser } from './application/usecases/RegisterUser.js';
import { env } from './config/env.js';
import { pool } from './infra/db/pool.js';
import { UserRepositoryPg } from './infra/repositories/UserRepositoryPg.js';
import { authRoutes } from './presentation/http/routes/authRoutes.js';
import { createServer } from './server.js';

async function main() {
  const usersRepo = new UserRepositoryPg(pool);

  const registerUser = new RegisterUser(usersRepo, env.bcryptSaltRounds);
  const loginUser = new LoginUser(
    usersRepo,
    env.jwtSecret,
    env.jwtExpiresIn as SignOptions['expiresIn']
  );

  const routes = Router();
  routes.use('/auth', authRoutes({ registerUser, loginUser }));

  const app = createServer(routes);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', err);
  process.exit(1);
});
