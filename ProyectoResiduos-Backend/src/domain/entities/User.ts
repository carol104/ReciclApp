export type UserRole = 'CIUDADANO' | 'ADMINISTRADOR';

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  totalPoints: number;
  socialMediaLinked: boolean;
  createdAt: Date;
  updatedAt: Date;
};
