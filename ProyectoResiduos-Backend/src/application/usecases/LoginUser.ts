import bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import type { User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/ports/UserRepository.js';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales inválidas');
  }
}

export type LoginResult = { token: string; user: User };

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: SignOptions['expiresIn']
  ) {}

  async execute(input: { email: string; password: string }): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const token = jwt.sign(
      { sub: String(user.id), role: user.role, email: user.email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as SignOptions
    );

    const { passwordHash: _ph, ...safeUser } = user;
    return { token, user: safeUser };
  }
}
