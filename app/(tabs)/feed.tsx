import { useFocusEffect, useRouter } from 'expo-router';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Plus, Share2, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    username?: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
}

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "Excluir Post",
      "Tem certeza que deseja excluir este post?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/feed/${postId}`);
              setPosts(current => current.filter(p => p.id !== postId));
              toast.success("Post excluído com sucesso!");
            } catch (error) {
              console.error(error);
              toast.error("Erro ao excluir post.");
            }
          }
        }
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      {/* Header do Post */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          {item.author?.avatar ? (
            <Image source={{ uri: item.author.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, { backgroundColor: '#ccc' }]} />
          )}
          <View>
            <Text style={styles.username}>{item.author?.name || 'Usuário'}</Text>
            <Text style={styles.userHandle}>{item.author?.username || '@usuario'}</Text>
          </View>
        </View>

        {item.author?.id === user?.id ? (
          <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <MoreHorizontal size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Imagem */}
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart
              size={26}
              color={item.liked ? COLORS.error : COLORS.text}
              fill={item.liked ? COLORS.error : 'transparent'}
            />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={26} color={COLORS.text} />
            <Text style={styles.actionText}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={26} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Bookmark size={26} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Legenda e Comentários */}
      <View style={styles.footer}>
        <Text style={styles.likesText}>{item.likes || 0} curtidas</Text>

        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.bold}>{item.author?.name || 'Usuário'}</Text> {item.caption}
          </Text>
        </View>

        {item.comments > 0 && (
          <TouchableOpacity>
            <Text style={styles.viewComments}>Ver todos os {item.comments} comentários</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>há {item.createdAt}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NutriFit</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Heart size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 20 }}>
            <MessageCircle size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão Flutuante (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/new-post')}
        activeOpacity={0.9}
      >
        <Plus size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5
  },
  headerIcons: {
    flexDirection: 'row',
  },

  card: {
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
  userHandle: {
    color: COLORS.textLight,
    fontSize: 12,
  },
  postImage: {
    width: width,
    height: width, // Square image
    backgroundColor: '#F0F0F0'
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
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

  footer: {
    paddingHorizontal: 12,
    paddingBottom: 15
  },
  likesText: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
    color: COLORS.text,
  },
  captionContainer: {
    marginBottom: 6,
  },
  caption: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700'
  },
  viewComments: {
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: 4,
  },
  timeAgo: {
    color: COLORS.textLight,
    fontSize: 12,
  },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    elevation: 6,
  },
});