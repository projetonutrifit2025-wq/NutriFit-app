import { Stack } from 'expo-router';

// Layout simples para as telas de login e registro
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}