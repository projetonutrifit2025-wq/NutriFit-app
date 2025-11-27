import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../lib/axios';
import { toast } from 'sonner-native';

export default function WeightHistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newWeight, setNewWeight] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/users/weight/history');
            setHistory(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWeight = async () => {
        if (!newWeight) return;
        setAdding(true);
        try {
            await api.post('/users/weight', { weight: Number(newWeight) });
            toast.success("Sucesso", { description: "Peso registrado!" });
            setNewWeight('');
            setModalVisible(false);
            fetchHistory();
        } catch (e) {
            toast.error("Erro", { description: "Erro ao registrar peso." });
        } finally {
            setAdding(false);
        }
    };

    const renderItem = ({ item, index }: any) => {
        const date = new Date(item.date).toLocaleDateString('pt-BR');
        const prevWeight = history[index + 1]?.weight;
        const diff = prevWeight ? (item.weight - prevWeight).toFixed(1) : 0;
        const isPositive = Number(diff) > 0;

        return (
            <View style={styles.card}>
                <View>
                    <Text style={styles.date}>{date}</Text>
                    <Text style={styles.weight}>{item.weight} kg</Text>
                </View>
                {prevWeight && (
                    <View style={[styles.badge, { backgroundColor: isPositive ? '#FEE2E2' : '#DCFCE7' }]}>
                        <Text style={[styles.diffText, { color: isPositive ? COLORS.error : COLORS.success }]}>
                            {isPositive ? '+' : ''}{diff} kg
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Evolução de Peso</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Plus size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24 }}
                ListEmptyComponent={
                    !loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
                }
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Registrar Peso</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 70.5"
                            keyboardType="numeric"
                            value={newWeight}
                            onChangeText={setNewWeight}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddWeight} disabled={adding}>
                                <Text style={styles.saveButtonText}>{adding ? 'Salvando...' : 'Salvar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    addButton: {
        backgroundColor: COLORS.primary, padding: 8, borderRadius: 12,
        ...SHADOWS.small
    },

    card: {
        backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        ...SHADOWS.small
    },
    date: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
    weight: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    diffText: { fontWeight: 'bold', fontSize: 14 },
    emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 24
    },
    modalContent: {
        backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24,
        ...SHADOWS.medium
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
    input: {
        backgroundColor: '#F5F5F5', padding: 16, borderRadius: 12, fontSize: 18,
        marginBottom: 24, textAlign: 'center'
    },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center' },
    cancelButtonText: { color: COLORS.textLight, fontWeight: 'bold' },
    saveButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
    saveButtonText: { color: '#FFF', fontWeight: 'bold' },
});
