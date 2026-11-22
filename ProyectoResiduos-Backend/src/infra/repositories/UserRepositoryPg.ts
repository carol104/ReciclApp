import type { Pool } from 'pg';
import type { User, UserRole } from '../../domain/entities/User.js';
import type { UserRepository, UserWithPassword } from '../../domain/ports/UserRepository.js';

function mapUserRow(row: any): User {
  return {
    id: Number(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    role: row.role as UserRole,
    totalPoints: Number(row.total_points ?? 0),
    socialMediaLinked: Boolean(row.social_media_linked ?? false),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class UserRepositoryPg implements UserRepository {
  constructor(private readonly db: Pool) {}

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await this.db.query(
      `SELECT id, full_name, email, password_hash, role, total_points, social_media_linked, created_at, updated_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      ...mapUserRow(row),
      passwordHash: String(row.password_hash),
    };
  }

  async create(input: { fullName: string; email: string; passwordHash: string }): Promise<User> {
    const result = await this.db.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, role, total_points, social_media_linked, created_at, updated_at`,
      [input.fullName, input.email.toLowerCase(), input.passwordHash]
    );

    return mapUserRow(result.rows[0]);
  }
}
