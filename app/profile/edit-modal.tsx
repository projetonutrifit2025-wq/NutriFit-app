import { useRouter } from 'expo-router';
import { X, Save, User, Ruler, Calendar, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { COLORS } from '../../constants/theme';
import api from '../../lib/axios';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileModal() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [height, setHeight] = useState('');
    const [goal, setGoal] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            const user = res.data;
            setName(user.name);

            // Formatar data para DD/MM/YYYY
            if (user.birthDate) {
                const date = new Date(user.birthDate);
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                setBirthDate(`${day}/${month}/${year}`);
            }

            setHeight(user.height.toString());
            setGoal(user.goal);
            setProfileImage(user.profileImage);
        } catch (e) {
            toast.error("Erro", { description: "Não foi possível carregar os dados." });
        } finally {
            setInitialLoading(false);
        }
    };

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

    const handleSave = async () => {
        setLoading(true);
        try {
            // Converter DD/MM/YYYY para ISO
            const parts = birthDate.split('/');
            if (parts.length !== 3) {
                toast.error("Erro", { description: "Data inválida." });
                setLoading(false);
                return;
            }
            const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

            // Sanitizar altura
            const sanitizedHeight = height.replace(',', '.');

            if (isNaN(Number(sanitizedHeight))) {
                toast.error("Erro", { description: "Altura deve ser um número válido." });
                setLoading(false);
                return;
            }

            await api.put('/users/me', {
                name,
                birthDate: isoDate,
                height: Number(sanitizedHeight),
                goal,
                profileImage
            });
            toast.success("Sucesso", { description: "Perfil atualizado com sucesso!" });
            router.back();
        } catch (e) {
            toast.error("Erro", { description: "Erro ao atualizar perfil." });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Carregando...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 24 }}>

                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        <TouchableOpacity onPress={pickImage}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ color: '#FFF', fontSize: 32, fontWeight: 'bold' }}>
                                        {name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.editBadge}>
                                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>EDITAR</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Input label="Nome Completo" value={name} onChangeText={setName} icon={<User size={20} color={COLORS.textLight} />} />

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Nascimento"
                                value={birthDate}
                                onChangeText={formatBirthDate}
                                keyboardType="numeric"
                                maxLength={10}
                                icon={<Calendar size={20} color={COLORS.textLight} />}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input label="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" icon={<Ruler size={20} color={COLORS.textLight} />} />
                        </View>
                    </View>

                    <Text style={styles.label}>Objetivo</Text>
                    <View style={styles.goalContainer}>
                        {['GANHAR_MASSA', 'PERDER_PESO', 'MANTER_SAUDE'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.goalOption, goal === g && styles.goalOptionSelected]}
                                onPress={() => setGoal(g)}
                            >
                                <Text style={[styles.goalText, goal === g && { color: '#FFF', fontWeight: 'bold' }]}>
                                    {g.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginTop: 40 }}>
                        <Button title="SALVAR ALTERAÇÕES" onPress={handleSave} loading={loading} />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
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
    closeButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },

    avatar: { width: 120, height: 120, borderRadius: 60 },
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 2, borderColor: '#FFF'
    },

    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginLeft: 4 },
    goalContainer: { gap: 10 },
    goalOption: {
        padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5',
        backgroundColor: '#FFF', alignItems: 'center'
    },
    goalOptionSelected: {
        backgroundColor: COLORS.primary, borderColor: COLORS.primary
    },
    goalText: { color: COLORS.text, fontSize: 14 },
});
