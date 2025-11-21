import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3B5998', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, marginTop: 40 },
  input: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 10 },
  button: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#3B5998', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#FFFFFF', marginTop: 20, marginBottom: 20 },
});

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('GANHAR_MASSA'); 
  
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    const data = { name, email, password, age, weight, height, goal };
    if (Object.values(data).some(v => !v)) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await signUp(data);
    } catch (e) {}
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CADASTRA-SE</Text>
      <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Idade" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>CADASTRAR</Text>
        </TouchableOpacity>
      )}
      
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
          <Text style={styles.linkText}>Já tem uma conta? Login aqui</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}