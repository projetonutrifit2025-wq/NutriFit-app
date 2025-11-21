import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Este componente é o "Porteiro"
// Ele decide se mostra o Login ou o App (Tabs)
const InitialLayout = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments(); // O caminho da rota atual
  const router = useRouter(); // Permite navegar

  useEffect(() => {
    if (isLoading) return; // Se está carregando, não faz nada

    const inAuthGroup = segments[0] === '(auth)';

    if (token && !inAuthGroup) {
      // Se tem token E NÃO está no app, manda pro app
      router.replace('/(tabs)/workouts');
    } else if (!token && inAuthGroup) {
      // Se NÃO tem token E está no app, manda pro login
      router.replace('/(auth)/login');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // O <Stack> principal
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

// Este é o Layout Raiz
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}