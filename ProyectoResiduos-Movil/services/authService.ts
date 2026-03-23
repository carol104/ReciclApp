import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Simulación de base de datos local
const USERS_STORAGE_KEY = '@residuos_users';
const CURRENT_USER_KEY = '@residuos_current_user';

export const authService = {
  // Registro de usuarios
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Obtener usuarios existentes
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Verificar si el email ya existe
      if (users.some((u: any) => u.email === email)) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
      };

      // Guardar contraseña (en producción, esto debería ser hash + salt)
      const userWithPassword = {
        ...newUser,
        password, // En producción, usar bcrypt o similar
      };

      // Guardar usuario
      users.push(userWithPassword);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      return newUser;
    } catch (error) {
      throw error;
    }
  },

  // Login de usuarios
  async login(email: string, password: string): Promise<User> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Buscar usuario
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Guardar usuario actual
      const currentUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

      return currentUser;
    } catch (error) {
      throw error;
    }
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

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      throw error;
    }
  },
};
