import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Send, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        profileImage?: string;
    };
}

interface PostDetails {
    id: string;
    imageUrl: string;
    caption: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
    };
    likes: number;
    commentsCount: number;
    liked: boolean;
    comments: Comment[];
    createdAt: string;
}

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [post, setPost] = useState<PostDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPostDetails();
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            const response = await api.get(`/feed/${id}`);
            setPost(response.data);
        } catch (error) {
            console.error('Erro ao carregar post:', error);
            toast.error('Erro ao carregar post.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        const isLiked = post.liked;
        const newLikesCount = isLiked ? post.likes - 1 : post.likes + 1;

        setPost(prev => prev ? { ...prev, liked: !isLiked, likes: newLikesCount } : null);

        try {
            if (isLiked) {
                await api.delete(`/feed/${post.id}/like`);
            } else {
                await api.post(`/feed/${post.id}/like`);
            }
        } catch (error) {
            console.error('Erro ao curtir:', error);
            setPost(prev => prev ? { ...prev, liked: isLiked, likes: post.likes } : null);
            toast.error('Erro ao atualizar curtida.');
        }
    };

    const handleComment = async () => {
        if (!newComment.trim() || !post) return;
        setSubmitting(true);
        try {
            const response = await api.post(`/feed/${post.id}/comment`, { content: newComment });
            const createdComment = response.data;

            setPost(prev => prev ? {
                ...prev,
                comments: [createdComment, ...prev.comments],
                commentsCount: prev.commentsCount + 1
            } : null);
            setNewComment('');
            toast.success('Comentário enviado!');
        } catch (error) {
            console.error('Erro ao comentar:', error);
            toast.error('Erro ao enviar comentário.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!post) return null;

    const renderHeader = () => (
        <View>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    {post.author?.profileImage ? (
                        <Image source={{ uri: post.author.profileImage }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarImage, { backgroundColor: '#ccc' }]} />
                    )}
                    <Text style={styles.username}>{post.author?.name || 'Usuário'}</Text>
                </View>
            </View>

            <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Heart
                        size={26}
                        color={post.liked ? COLORS.error : COLORS.text}
                        fill={post.liked ? COLORS.error : 'transparent'}
                    />
                    <Text style={styles.actionText}>{post.likes || 0}</Text>
                </TouchableOpacity>

                <View style={styles.actionButton}>
                    <MessageCircle size={26} color={COLORS.text} />
                    <Text style={styles.actionText}>{post.commentsCount || 0}</Text>
                </View>
            </View>

            <View style={styles.captionContainer}>
                <Text style={styles.caption}>
                    <Text style={styles.bold}>{post.author?.name}</Text> {post.caption}
                </Text>
                <Text style={styles.timeAgo}>há {post.createdAt}</Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.commentsTitle}>Comentários</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Postagem</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <FlatList
                    data={post.comments}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum comentário ainda. Seja o primeiro!</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.commentItem}>
                            {item.user.profileImage ? (
                                <Image source={{ uri: item.user.profileImage }} style={styles.commentAvatar} />
                            ) : (
                                <View style={[styles.commentAvatar, { backgroundColor: '#ccc' }]} />
                            )}
                            <View style={styles.commentContent}>
                                <Text style={styles.commentUser}>{item.user.name}</Text>
                                <Text style={styles.commentText}>{item.content}</Text>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                        onPress={handleComment}
                        disabled={!newComment.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Send size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    username: {
        fontWeight: '700',
        color: COLORS.text,
        fontSize: 15,
    },
    postImage: {
        width: width,
        height: width,
        backgroundColor: '#F0F0F0'
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    captionContainer: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        backgroundColor: '#FFF',
    },
    caption: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    bold: {
        fontWeight: '700'
    },
    timeAgo: {
        color: COLORS.textLight,
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    commentsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    commentItem: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 12,
    },
    commentUser: {
        fontWeight: '700',
        fontSize: 13,
        color: COLORS.text,
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 18,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
});
