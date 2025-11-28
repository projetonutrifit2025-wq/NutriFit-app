import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, UserCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../lib/axios';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

interface UserProfile {
    id: string;
    name: string;
    profileImage?: string;
    goal: string;
    level: string;
    isFollowing: boolean;
    _count: {
        followers: number;
        following: number;
        posts: number;
    };
}

interface Post {
    id: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
    createdAt: string;
}

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingLoading, setFollowingLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const [profileRes, postsRes] = await Promise.all([
                api.get(`/users/profile/${id}`),
                api.get(`/feed/user/${id}`)
            ]);
            setProfile(profileRes.data);
            setPosts(postsRes.data);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            toast.error('Erro ao carregar perfil.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!profile) return;
        setFollowingLoading(true);
        try {
            if (profile.isFollowing) {
                await api.delete(`/users/${id}/unfollow`);
                setProfile(prev => prev ? { ...prev, isFollowing: false, _count: { ...prev._count, followers: prev._count.followers - 1 } } : null);
                toast.success('Deixou de seguir.');
            } else {
                await api.post(`/users/${id}/follow`);
                setProfile(prev => prev ? { ...prev, isFollowing: true, _count: { ...prev._count, followers: prev._count.followers + 1 } } : null);
                toast.success('Seguindo!');
            }
        } catch (error) {
            console.error('Erro ao seguir/deixar de seguir:', error);
            toast.error('Erro ao atualizar seguidor.');
        } finally {
            setFollowingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.profileHeader}>
                {profile?.profileImage ? (
                    <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
                )}
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.goal}>{profile?.goal} • {profile?.level}</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile?._count.posts}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile?._count.followers}</Text>
                        <Text style={styles.statLabel}>Seguidores</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile?._count.following}</Text>
                        <Text style={styles.statLabel}>Seguindo</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.followButton, profile?.isFollowing && styles.followingButton]}
                    onPress={handleFollow}
                    disabled={followingLoading}
                >
                    {profile?.isFollowing ? (
                        <>
                            <UserCheck size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.followButtonText}>Seguindo</Text>
                        </>
                    ) : (
                        <>
                            <UserPlus size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.followButtonText}>Seguir</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Perfil</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                numColumns={3}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerContainer: {
        backgroundColor: '#FFF',
        marginBottom: 10,
        paddingBottom: 20,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    goal: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    followButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    followingButton: {
        backgroundColor: COLORS.success,
    },
    followButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    gridImage: {
        width: width / 3,
        height: width / 3,
        borderWidth: 1,
        borderColor: '#FFF',
    },
});
