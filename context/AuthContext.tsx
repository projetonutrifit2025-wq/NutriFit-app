import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import api from '../lib/axios'; // Importa nossa API

const TOKEN_KEY = 'nutrifit_token';
type AuthContextType = {
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  token: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error("Falha ao carregar token", e);
      }
      setIsLoading(false);
    }
    loadToken();
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const response = await api.post('/users/login', { email, password: pass });
      const { token: newToken } = response.data;

      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } catch (e: any) {
      Alert.alert("Erro no Login", e.response?.data?.error || "Não foi possível conectar.");
      throw e;
    }
  };

  const signUp = async (data: any) => {
    try {
      await api.post('/users/register', data);
      await signIn(data.email, data.password); // Auto-login após registro
    } catch (e: any) {
      Alert.alert("Erro no Cadastro", e.response?.data?.error || "Não foi possível cadastrar.");
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error("Falha ao sair", e);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signUp, signOut, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}