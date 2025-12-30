import { ChevronDown, ChevronUp, Clock, Dumbbell, PlayCircle, Repeat, Calendar } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  SectionList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../lib/axios';
import { toast } from 'sonner-native';

// Tipos baseados no backend
interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}
interface WorkoutExercise {
  id: string;
  sets: string;
  reps: string;
  rest: string;
  exercise: Exercise;
}
interface WorkoutTemplate {
  id: string;
  name: string;
  goal: string;
  level: string;
  dayOfWeek: string;
  exercises: WorkoutExercise[];
}

interface SectionData {
  title: string;
  data: WorkoutTemplate[];
}

export default function WorkoutsScreen() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userGoal, setUserGoal] = useState<string>('');

  // Estado para controlar qual card está expandido
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      const res = await api.get('/workouts/my-workouts');
      const workouts: WorkoutTemplate[] = res.data;

      if (workouts.length > 0) {
        setUserGoal(workouts[0].goal);
      }

      // Agrupar por dia da semana
      const daysOrder = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
      const grouped = daysOrder.reduce((acc, day) => {
        const dayWorkouts = workouts.filter(w => w.dayOfWeek === day);
        if (dayWorkouts.length > 0) {
          acc.push({
            title: day,
            data: dayWorkouts
          });
        }
        return acc;
      }, [] as SectionData[]);

      setSections(grouped);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStartWorkout = () => {
    toast.info("A funcionalidade de iniciar treino estará disponível em breve!");
  };

  const renderWorkout = ({ item }: { item: WorkoutTemplate }) => {
    const isExpanded = expandedId === item.id;
    const exerciseCount = item.exercises.length;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Dumbbell size={24} color="#FFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.workoutInfo}>{exerciseCount} Exercícios • {item.level}</Text>
          </View>
          {isExpanded ? <ChevronUp color={COLORS.textLight} /> : <ChevronDown color={COLORS.textLight} />}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.exercisesList}>
            {item.exercises.map((ex, index) => (
              <View key={ex.id} style={[
                styles.exerciseRow,
                index === item.exercises.length - 1 && { borderBottomWidth: 0 }
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                  <Text style={styles.muscleGroup}>{ex.exercise.muscleGroup}</Text>
                </View>

                <View style={styles.metaContainer}>
                  <View style={styles.metaItem}>
                    <Repeat size={14} color={COLORS.primary} />
                    <Text style={styles.metaText}>{ex.sets}x{ex.reps}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={COLORS.textLight} />
                    <Text style={styles.metaText}>{ex.rest}</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
              <PlayCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.startButtonText}>INICIAR TREINO</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Calendar size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Treinos</Text>
        <Text style={styles.subtitle}>
          {userGoal
            ? `Focados no seu objetivo: ${userGoal.replace('_', ' ')}`
            : 'Carregando treinos...'}
        </Text>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderWorkout}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum treino encontrado para seu perfil.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 56, height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  workoutName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  workoutInfo: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

  exercisesList: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  exerciseName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  muscleGroup: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },

  metaContainer: { alignItems: 'flex-end', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },

  startButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    ...SHADOWS.small,
  },
  startButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, textAlign: 'center', fontSize: 16 },
});