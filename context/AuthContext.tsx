import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner-native';
import api from '../lib/axios';

const TOKEN_KEY = 'nutrifit_token';
const USER_KEY = 'nutrifit_user';

export type User = {
  id: string; name: string; email: string;
  age: number; weight: number; height: number;
  goal: string; level: string;
};

type AuthContextType = {
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  token: string | null;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const t = await SecureStore.getItemAsync(TOKEN_KEY);
        const u = await SecureStore.getItemAsync(USER_KEY);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
          api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        }
      } catch (e) { console.error(e); }
      setIsLoading(false);
    }
    load();
  }, []);

  // --- FUNÇÃO DE SEGURANÇA PARA TRATAR ERROS ---
  const handleAuthError = (title: string, error: any) => {
    console.error(title, error); // Loga no terminal para você ver o erro real

    let message = "Ocorreu um erro inesperado.";

    if (error.response?.data?.error) {
      // Se o backend mandou uma mensagem de erro
      const backendError = error.response.data.error;

      if (typeof backendError === 'string') {
        message = backendError; // É texto simples? Usa.
      } else if (typeof backendError === 'object') {
        // É um objeto? Transforma em texto para não quebrar o app
        message = JSON.stringify(backendError);
      }
    } else if (error.message) {
      message = error.message;
    }

    toast.error(title, {
      description: message,
    });
  };
  // ---------------------------------------------

  const signIn = async (email: string, pass: string) => {
    try {
      const res = await api.post('/users/login', { email, password: pass });
      const { token: t, user: u } = res.data;
      setToken(t); setUser(u);
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      await SecureStore.setItemAsync(TOKEN_KEY, t);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
    } catch (e: any) {
      handleAuthError("Erro no Login", e);
      throw e;
    }
  };

  const signUp = async (data: any) => {
    try {
      await api.post('/users/register', data);
      await signIn(data.email, data.password);
    } catch (e: any) {
      handleAuthError("Erro no Cadastro", e);
      throw e;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY); await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null); setUser(null); delete api.defaults.headers.common['Authorization'];
  };

  return <AuthContext.Provider value={{ signIn, signUp, signOut, token, user, isLoading }}>{children}</AuthContext.Provider>;
}