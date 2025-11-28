import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const InitialLayout = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Verifica se estamos dentro da pasta (auth)
    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      // CASO 1: Usuário TEM token, mas está na tela de Login/Cadastro.
      // Ação: Manda ele para dentro do App (Treinos).
      router.replace('/(tabs)/workouts');

    } else if (!token && !inAuthGroup) {
      // CASO 2: Usuário NÃO TEM token, mas está tentando acessar o App (Tabs).
      // Ação: Manda ele para o Login.
      router.replace('/(auth)/login');
    }

    // CASO 3 (O que estava faltando): 
    // Usuário NÃO TEM token e está no grupo (auth) (Login ou Registro).
    // Ação: NÃO FAZ NADA. Deixa ele navegar livremente entre Login e Registro.

  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B5998" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-post" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="profile/edit-modal" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <InitialLayout />
        <Toaster />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}