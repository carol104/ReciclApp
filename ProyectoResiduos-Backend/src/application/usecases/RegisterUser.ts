import bcrypt from 'bcrypt';
import type { User } from '../../domain/entities/User.js';
import type { UserRepository } from '../../domain/ports/UserRepository.js';

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('El email ya está registrado');
  }
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly saltRounds: number
  ) {}

  async execute(input: { fullName: string; email: string; password: string }): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new EmailAlreadyExistsError();

    const passwordHash = await bcrypt.hash(input.password, this.saltRounds);
    return await this.users.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });
  }
}
