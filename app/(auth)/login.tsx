import { Link } from 'expo-router';
import { Dumbbell, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '../../components/ui';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try { await signIn(email, password); } catch (e) { }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Dumbbell size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>NutriFit</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitle}>Faça login para continuar seus treinos.</Text>

        <View style={{ marginTop: 20 }}>
          <Input
            placeholder="E-mail" value={email} onChangeText={setEmail}
            icon={<Mail size={20} color={COLORS.textLight} />} keyboardType="email-address"
          />
          <Input
            placeholder="Senha" value={password} onChangeText={setPassword}
            secureTextEntry icon={<Lock size={20} color={COLORS.textLight} />}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title="ENTRAR" onPress={handleLogin} loading={loading} />
        </View>

        {/* Link Corrigido com asChild */}
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={{ textAlign: 'center', color: COLORS.textLight }}>
              Não tem conta? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: { height: '40%', justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 80, height: 80, backgroundColor: '#FFF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  formContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, elevation: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 20 },
  link: { marginTop: 20, alignItems: 'center', padding: 10 },
});