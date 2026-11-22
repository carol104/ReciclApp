import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const CURRENT_USER_KEY = '@residuos_current_user';
const AUTH_TOKEN_KEY = '@residuos_auth_token';

// Para dispositivo físico NO uses localhost; usa la IP de tu PC en la misma red.
// Ej: http://192.168.1.50:3001
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3001';

type ApiUser = {
  id: number | string;
  email: string;
  fullName?: string;
  name?: string;
};

function mapApiUserToAppUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    name: apiUser.fullName ?? apiUser.name ?? '',
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'Error de servidor';
    throw new Error(message);
  }
  return data as T;
}

export const authService = {
  // Registro de usuarios
  async register(email: string, password: string, name: string): Promise<User> {
    const data = await postJson<{ token?: string; user?: ApiUser }>(
      '/auth/register',
      {
        fullName: name,
        email,
        password,
      }
    );

    if (!data.user) {
      throw new Error('Respuesta inválida del servidor');
    }

    const currentUser = mapApiUserToAppUser(data.user);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    if (data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }

    return currentUser;
  },

  // Login de usuarios
  async login(email: string, password: string): Promise<User> {
    const data = await postJson<{ token: string; user: ApiUser }>('/auth/login', {
      email,
      password,
    });

    const currentUser = mapApiUserToAppUser(data.user);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);

    return currentUser;
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CURRENT_USER_KEY, AUTH_TOKEN_KEY]);
    } catch (error) {
      throw error;
    }
  },
};
