import type { Request, Response } from 'express';
import { z } from 'zod';
import { InvalidCredentialsError, LoginUser } from '../../../application/usecases/LoginUser.js';
import { EmailAlreadyExistsError, RegisterUser } from '../../../application/usecases/RegisterUser.js';

const registerSchema = z.object({
  fullName: z.string().min(3).max(150),
  email: z.string().email().max(150),
  password: z.string().min(6).max(255),
});

const loginSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(1).max(255),
});

export function createAuthController(deps: {
  registerUser: RegisterUser;
  loginUser: LoginUser;
}) {
  return {
    register: async (req: Request, res: Response) => {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Datos inválidos',
          issues: parsed.error.issues,
        });
      }

      try {
        await deps.registerUser.execute(parsed.data);
        const result = await deps.loginUser.execute({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        return res.status(201).json(result);
      } catch (err) {
        if (err instanceof EmailAlreadyExistsError) {
          return res.status(409).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Error interno' });
      }
    },

    login: async (req: Request, res: Response) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: 'Datos inválidos',
          issues: parsed.error.issues,
        });
      }

      try {
        const result = await deps.loginUser.execute(parsed.data);
        return res.status(200).json(result);
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return res.status(401).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Error interno' });
      }
    },
  };
}
