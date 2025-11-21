import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3B5998', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 10 },
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#3B5998', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#FFFFFF', marginTop: 20 },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  
  const handleLogin = async () => {
   

 router.push('/(tabs)/feed')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NutriFit</Text>
      <Text style={styles.title}>LOGIN</Text>
      
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>
      )}
      
      <Link href="/(auth)/register" asChild>
        <TouchableOpacity>
          <Text style={styles.linkText}>Não tem uma conta? Cadastre aqui</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}