import { useRouter } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components/ui';
import { COLORS } from '../constants/theme';
import api from '../lib/axios';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';

export default function NewPostScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduce quality to avoid huge payloads
      base64: true, // Request base64
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleCreatePost = async () => {
    if (!base64Image) {
      toast.error("Erro", {
        description: "Por favor, selecione uma imagem."
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/feed', {
        imageUrl: base64Image,
        caption
      });

      toast.success("Sucesso", {
        description: "Publicação criada!"
      });
      router.back(); // Volta para o feed
    } catch (e) {
      console.error(e);
      toast.error("Erro", {
        description: "Não foi possível criar o post."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>

          <Text style={styles.label}>Legenda</Text>
          <Input
            placeholder="O que você está pensando?"
            value={caption}
            onChangeText={setCaption}
            icon={<Send size={20} color={COLORS.textLight} />}
          />

          <Text style={styles.label}>Imagem do Post</Text>

          {/* Preview da Imagem */}
          <View style={styles.imagePreviewContainer}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => { setImage(null); setBase64Image(null); }}>
                  <X size={20} color="#FFF" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
                <ImageIcon size={48} color={COLORS.textLight} />
                <Text style={styles.placeholderText}>Toque para selecionar uma imagem</Text>
              </TouchableOpacity>
            )}
          </View>

          {!image && (
            <Button title="Selecionar da Galeria" onPress={pickImage} variant="outline" />
          )}

        </ScrollView>

        <View style={styles.footer}>
          <Button title="COMPARTILHAR" onPress={handleCreatePost} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8, marginTop: 10 },
  imagePreviewContainer: {
    height: 300, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#F3F4F6', marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB',
    position: 'relative'
  },
  imagePreview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  placeholderText: { marginTop: 10, color: COLORS.textLight },
  removeImageButton: {
    position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8, borderRadius: 20
  },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' }
});