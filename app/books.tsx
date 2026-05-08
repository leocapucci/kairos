import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors } from '../theme';

function normalizeBookName(name: string): string {
  const corrections: Record<string, string> = {
    'Genesis': 'Gênesis',
    'Exodus': 'Êxodo',
    'Leviticus': 'Levítico',
    'Numbers': 'Números',
    'Deuteronomy': 'Deuteronômio',
    'Joshua': 'Josué',
    'Judges': 'Juízes',
    'Ruth': 'Rute',
    '1 Samuel': '1 Samuel',
    '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reis',
    '2 Kings': '2 Reis',
    '1 Chronicles': '1 Crônicas',
    '2 Chronicles': '2 Crônicas',
    'Ezra': 'Esdras',
    'Nehemiah': 'Neemias',
    'Esther': 'Ester',
    'Job': 'Jó',
    'Psalms': 'Salmos',
    'Proverbs': 'Provérbios',
    'Ecclesiastes': 'Eclesiastes',
    'Song of Solomon': 'Cânticos',
    'Song of Songs': 'Cânticos',
    'Canticles': 'Cânticos',
    'Isaiah': 'Isaías',
    'Jeremiah': 'Jeremias',
    'Lamentations': 'Lamentações',
    'Ezekiel': 'Ezequiel',
    'Daniel': 'Daniel',
    'Hosea': 'Oséias',
    'Joel': 'Joel',
    'Amos': 'Amós',
    'Obadiah': 'Obadias',
    'Jonah': 'Jonas',
    'Micah': 'Miquéias',
    'Nahum': 'Naum',
    'Habakkuk': 'Habacuque',
    'Zephaniah': 'Sofonias',
    'Haggai': 'Ageu',
    'Zechariah': 'Zacarias',
    'Malachi': 'Malaquias',
    'Matthew': 'Mateus',
    'Mark': 'Marcos',
    'Luke': 'Lucas',
    'John': 'João',
    'Acts': 'Atos',
    'Romans': 'Romanos',
    '1 Corinthians': '1 Coríntios',
    '2 Corinthians': '2 Coríntios',
    'Galatians': 'Gálatas',
    'Ephesians': 'Efésios',
    'Philippians': 'Filipenses',
    'Colossians': 'Colossenses',
    '1 Thessalonians': '1 Tessalonicenses',
    '2 Thessalonians': '2 Tessalonicenses',
    '1 Timothy': '1 Timóteo',
    '2 Timothy': '2 Timóteo',
    'Titus': 'Tito',
    'Philemon': 'Filemom',
    'Hebrews': 'Hebreus',
    'James': 'Tiago',
    '1 Peter': '1 Pedro',
    '2 Peter': '2 Pedro',
    '1 John': '1 João',
    '2 John': '2 João',
    '3 John': '3 João',
    'Jude': 'Judas',
    'Revelation': 'Apocalipse',
  };
  return corrections[name] || name;
}

export default function BooksScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filteredBooks = useMemo(() => {
    return books
      .map(normalizeBookName)
      .filter(book => book.toLowerCase().includes(search.toLowerCase()));
  }, [books, search]);

  // Divisão AT/NT: índices 0-38 (39 livros) = AT, índices 39-65 (27 livros) = NT
  const oldTestament = filteredBooks.slice(0, 39);
  const newTestament = filteredBooks.slice(39);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('https://kairos-backend-vjdp.onrender.com/bible/books');
        const data = await response.json();
        const normalizedBooks = (data.books || []).map(normalizeBookName);
        setBooks(normalizedBooks);
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
      }
    };

    fetchBooks();
  }, []);

  const renderBookItem = (book: string) => (
    <Pressable
      key={book}
      onPress={() => router.push(`/chapters?book=${encodeURIComponent(book)}`)}
      style={styles.bookItem}
    >
      <Text style={styles.bookText}>{book}</Text>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>BÍBLIA</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar livro..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {oldTestament.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Antigo Testamento</Text>
              {oldTestament.map(renderBookItem)}
            </View>
          )}

          {newTestament.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Novo Testamento</Text>
              {newTestament.map(renderBookItem)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative' },
  backButton: { position: 'absolute', left: 0, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.textPrimary, fontSize: 24, lineHeight: 24 },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textTertiary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    color: colors.textPrimary,
    fontSize: 16,
  },
  scrollView: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 12 },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 4,
  },
  bookText: { fontSize: 16, color: colors.textPrimary },
  arrow: { fontSize: 18, color: colors.textTertiary },
});