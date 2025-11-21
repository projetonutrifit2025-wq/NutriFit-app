import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios'; // 1. Importamos nossa API

// ---
// 2. Definimos os Tipos (para o TypeScript)
// (Baseado no nosso schema do Prisma)
// ---
interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl?: string;
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
  name: string; // Ex: "Treino A: Peito e Tríceps"
  goal: string;
  level: string;
  exercises: WorkoutExercise[];
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  // Estilos dos Cards de Treino
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5998',
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1, // Para quebrar a linha se o nome for longo
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
// ---

export default function WorkoutsScreen() {
  const { signOut } = useAuth();
  
  // 3. Estados para guardar os dados, loading e erros
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. Lógica para buscar os dados quando a tela abre
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // A MÁGICA ACONTECE AQUI
        // O token já está no 'api' graças ao AuthContext
        const response = await api.get('/workouts/my-workouts');
        
        setWorkouts(response.data);
      } catch (e: any) {
        console.error("Falha ao buscar treinos:", e.response?.data);
        setError(e.response?.data?.error || "Não foi possível carregar os treinos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, []); // O array vazio [] faz isso rodar apenas uma vez

  // 5. Renderização condicional
  
  // Se estiver carregando...
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B5998" />
      </View>
    );
  }

  // Se der erro...
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.buttonText}>Tentar Novamente (Sair)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se tiver sucesso, mostra os treinos
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Treinos</Text>
      </View>
      
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item: workout }) => (
          <View style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>{workout.name}</Text>
            {workout.exercises.map((workoutExercise) => (
              <View key={workoutExercise.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{workoutExercise.exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {workoutExercise.sets} x {workoutExercise.reps}
                </Text>
              </View>
            ))}
          </View>
        )}
        ListFooterComponent={(
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.buttonText}>SAIR (Logout)</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
} 