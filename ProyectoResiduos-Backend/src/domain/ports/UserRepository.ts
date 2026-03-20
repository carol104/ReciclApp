import type { User } from '../entities/User.js';

export type UserWithPassword = User & { passwordHash: string };

export interface UserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  create(input: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
}
