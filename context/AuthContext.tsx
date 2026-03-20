import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '../services/authService';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthState = {
  isLoading: boolean;
  isSignout: boolean;
  user: User | null;
};

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: User | null }
  | { type: 'SIGN_IN'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SIGN_UP'; payload: User };

const initialState: AuthState = {
  isLoading: true,
  isSignout: false,
  user: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload,
      };
    case 'SIGN_IN':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload,
      };
    case 'SIGN_UP':
      return {
        isLoading: false,
        isSignout: false,
        user: action.payload,
      };
    case 'SIGN_OUT':
      return {
        isLoading: false,
        isSignout: true,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bootstrap
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'RESTORE_TOKEN', payload: user });
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    signUp: async (email: string, password: string, name: string) => {
      try {
        const user = await authService.register(email, password, name);
        dispatch({ type: 'SIGN_UP', payload: user });
      } catch (error) {
        throw error;
      }
    },
    signUp2: async (email: string, password: string, name: string) => {
      try {
        const user = await authService.register(email, password, name);
        dispatch({ type: 'SIGN_UP', payload: user });
      } catch (error) {
        throw error;
      }
    },
    signIn: async (email: string, password: string) => {
      try {
        const user = await authService.login(email, password);
        dispatch({ type: 'SIGN_IN', payload: user });
      } catch (error) {
        throw error;
      }
    },
    signOut: async () => {
      try {
        await authService.logout();
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
