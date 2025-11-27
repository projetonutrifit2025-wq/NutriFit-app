import { LogOut, Settings, TrendingUp, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { useRouter } from 'expo-router';

interface UserProfile {
  name: string;
  level: string;
  goal: string;
  profileImage: string
  stats: {
    treinos: number;
    seguidores: number;
    peso: string;
  };
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={signOut}>
          <LogOut size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Cartão do Usuário */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.profileImage }}
              style={styles.avatar}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.goal}>{user.goal.replace('_', ' ')}</Text>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.treinos}</Text>
              <Text style={styles.statLabel}>Treinos</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.peso}</Text>
              <Text style={styles.statLabel}>Peso</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.seguidores}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
          </View>
        </View>

        {/* Menu de Opções */}
        <Text style={styles.sectionTitle}>Minha Conta</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/edit-modal')}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <UserIcon size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuText}>Editar Dados Pessoais</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <TrendingUp size={20} color={COLORS.success} />
            </View>
            <Text style={styles.menuText}>Registrar Peso (Evolução)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
              <Settings size={20} color={COLORS.textLight} />
            </View>
            <Text style={styles.menuText}>Configurações do App</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE' },
  levelBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 3, borderColor: '#FFF'
  },
  levelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  goal: { fontSize: 14, color: COLORS.primary, marginBottom: 24, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  divider: { width: 1, height: '100%', backgroundColor: '#F3F4F6' },
  sectionTitle: { marginLeft: 24, fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  menuContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, padding: 8, ...SHADOWS.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
});