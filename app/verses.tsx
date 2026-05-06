import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '../constants/colors';

type VersesResponse = {
  verses: Array<{
    number: number;
    text: string;
  }>;
};

export default function VersesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ book?: string; chapter?: string }>();
  const book = params.book || '';
  const chapter = params.chapter || '';

  const [verses, setVerses] = useState<VersesResponse['verses']>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const response = await fetch(
          `https://kairos-backend-vjdp.onrender.com/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`
        );
        const data: VersesResponse = await response.json();
        setVerses(data.verses || []);
      } catch (error) {
        console.error('Erro ao buscar versículos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (book && chapter) {
      fetchVerses();
    }
  }, [book, chapter]);

  const handleVersePress = (verseNum: number, verseText: string) => {
    router.push(
      `/verse-experience?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verseNum}&text=${encodeURIComponent(verseText)}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{book} {chapter}</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : verses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Em breve os versículos de {book} estarão disponíveis. Por enquanto, interaja com o versículo do dia na tela principal.
              </Text>
              <Pressable
                onPress={() => router.push(`/verse-experience?text=${encodeURIComponent(`Reflita sobre ${book} capítulo ${chapter} e deixe este trecho falar com você hoje.`)}`)}
                style={styles.interactButton}
              >
                <Text style={styles.interactButtonText}>Interagir com este capítulo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.versesContainer}>
              {verses.map((verse) => (
                <Pressable
                  key={verse.number}
                  onPress={() => handleVersePress(verse.number, verse.text)}
                  style={styles.verseItem}
                >
                  <Text style={styles.verseNumber}>{verse.number}</Text>
                  <Text style={styles.verseText}>{verse.text}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative' },
  backButton: { position: 'absolute', left: 0, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: Colors.textPrimary, fontSize: 24, lineHeight: 24 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  scrollView: { flex: 1 },
  loadingText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 16, paddingTop: 40 },
  emptyContainer: { padding: 20, alignItems: 'center', gap: 16 },
  emptyText: { color: Colors.textPrimary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  interactButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(200,76,76,0.1)',
    alignItems: 'center',
    marginTop: 12,
  },
  interactButtonText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  versesContainer: { paddingTop: 16 },
  verseItem: { flexDirection: 'row', marginBottom: 16, paddingHorizontal: 8 },
  verseNumber: { fontSize: 16, fontWeight: '600', color: Colors.gold, marginRight: 8, minWidth: 24 },
  verseText: { flex: 1, fontSize: 16, color: Colors.textPrimary, lineHeight: 24 },
});