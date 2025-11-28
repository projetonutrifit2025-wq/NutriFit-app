import { Link, useRouter } from 'expo-router';
import { Activity, ArrowLeft, Calendar, Lock, Mail, Ruler, TrendingUp, User, Weight, Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Button, Input } from '../../components/ui';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<'GANHAR_MASSA' | 'PERDER_PESO' | 'MANTER_SAUDE'>('GANHAR_MASSA');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const formatBirthDate = (text: string) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setBirthDate(formatted);
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !birthDate || !weight || !height) {
      toast.error("Atenção", {
        description: "Preencha todos os campos."
      });
      return;
    }

    // Converter DD/MM/YYYY para ISO
    const parts = birthDate.split('/');
    if (parts.length !== 3) {
      toast.error("Erro", { description: "Data inválida." });
      return;
    }
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    // Sanitizar peso e altura (trocar vírgula por ponto)
    const sanitizedWeight = weight.replace(',', '.');
    const sanitizedHeight = height.replace(',', '.');

    if (isNaN(Number(sanitizedWeight)) || isNaN(Number(sanitizedHeight))) {
      toast.error("Erro", { description: "Peso e altura devem ser números válidos." });
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name, email, password, goal,
        birthDate: isoDate,
        weight: Number(sanitizedWeight), height: Number(sanitizedHeight),
        profileImage: profileImage || undefined,
      });
    } catch (e) { }
    setLoading(false);
  };

  const GoalOption = ({ value, label, icon: Icon }: any) => {
    const isSelected = goal === value;
    return (
      <TouchableOpacity
        style={[styles.goalOption, isSelected && styles.goalOptionSelected]}
        onPress={() => setGoal(value)}
      >
        <Icon size={20} color={isSelected ? '#FFF' : COLORS.textLight} />
        <Text style={[styles.goalText, isSelected && { color: '#FFF', fontWeight: 'bold' }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <Text style={styles.headerSubtitle}>Comece sua jornada hoje</Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Camera size={32} color={COLORS.textLight} />
                  <Text style={styles.addPhotoText}>Adicionar Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>DADOS PESSOAIS</Text>
          <Input placeholder="Nome Completo" value={name} onChangeText={setName} icon={<User size={20} color={COLORS.textLight} />} />
          <Input placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" icon={<Mail size={20} color={COLORS.textLight} />} />
          <Input placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry icon={<Lock size={20} color={COLORS.textLight} />} />

          <View style={{ flexDirection: 'column', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Nascimento (DD/MM/AAAA)"
                value={birthDate}
                onChangeText={formatBirthDate}
                keyboardType="numeric"
                maxLength={10}
                icon={<Calendar size={20} color={COLORS.textLight} />}
              />
            </View>
            <View style={{ flex: 1 }}><Input placeholder="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" icon={<Weight size={20} color={COLORS.textLight} />} /></View>
          </View>
          <Input placeholder="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" icon={<Ruler size={20} color={COLORS.textLight} />} />

          <Text style={styles.sectionLabel}>QUAL SEU OBJETIVO?</Text>
          <View style={{ gap: 10 }}>
            <GoalOption value="GANHAR_MASSA" label="Ganhar Massa" icon={TrendingUp} />
            <GoalOption value="PERDER_PESO" label="Perder Peso" icon={Weight} />
            <GoalOption value="MANTER_SAUDE" label="Manter Saúde" icon={Activity} />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button title="FINALIZAR CADASTRO" onPress={handleSignUp} loading={loading} />
          </View>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.link}>
              <Text style={{ textAlign: 'center', color: COLORS.textLight }}>Já tem conta? <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Faça Login</Text></Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: { padding: 30, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  formContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 30, paddingTop: 30, elevation: 10 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textLight, marginTop: 10, marginBottom: 10, letterSpacing: 1 },
  goalOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: COLORS.background },
  goalOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  goalText: { marginLeft: 10, fontSize: 16, color: COLORS.text },
  link: { marginTop: 20, marginBottom: 20 },

  imagePicker: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  profileImage: { width: '100%', height: '100%' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
});