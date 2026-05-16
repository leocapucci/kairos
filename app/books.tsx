import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, radius, spacing } from '../theme';
import { getBooks } from '../src/services/api/bible';

function normalizeBookName(name: string): string {
  const corrections: Record<string, string> = {
    Genesis: 'Gênesis', Exodus: 'Êxodo', Leviticus: 'Levítico', Numbers: 'Números',
    Deuteronomy: 'Deuteronômio', Joshua: 'Josué', Judges: 'Juízes', Ruth: 'Rute',
    '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reis', '2 Kings': '2 Reis',
    '1 Chronicles': '1 Crônicas', '2 Chronicles': '2 Crônicas',
    Ezra: 'Esdras', Nehemiah: 'Neemias', Esther: 'Ester',
    Job: 'Jó', Psalms: 'Salmos', Proverbs: 'Provérbios', Ecclesiastes: 'Eclesiastes',
    'Song of Solomon': 'Cânticos', 'Song of Songs': 'Cânticos', Canticles: 'Cânticos',
    Isaiah: 'Isaías', Jeremiah: 'Jeremias', Lamentations: 'Lamentações',
    Ezekiel: 'Ezequiel', Daniel: 'Daniel', Hosea: 'Oséias', Joel: 'Joel',
    Amos: 'Amós', Obadiah: 'Obadias', Jonah: 'Jonas', Micah: 'Miquéias',
    Nahum: 'Naum', Habakkuk: 'Habacuque', Zephaniah: 'Sofonias', Haggai: 'Ageu',
    Zechariah: 'Zacarias', Malachi: 'Malaquias', Matthew: 'Mateus', Mark: 'Marcos',
    Luke: 'Lucas', John: 'João', Acts: 'Atos', Romans: 'Romanos',
    '1 Corinthians': '1 Coríntios', '2 Corinthians': '2 Coríntios',
    Galatians: 'Gálatas', Ephesians: 'Efésios', Philippians: 'Filipenses',
    Colossians: 'Colossenses', '1 Thessalonians': '1 Tessalonicenses',
    '2 Thessalonians': '2 Tessalonicenses', '1 Timothy': '1 Timóteo',
    '2 Timothy': '2 Timóteo', Titus: 'Tito', Philemon: 'Filemom',
    Hebrews: 'Hebreus', James: 'Tiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
    '1 John': '1 João', '2 John': '2 João', '3 John': '3 João',
    Jude: 'Judas', Revelation: 'Apocalipse',
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
      .filter((book) => book.toLowerCase().includes(search.toLowerCase()));
  }, [books, search]);

  const oldTestament = filteredBooks.slice(0, 39);
  const newTestament = filteredBooks.slice(39);

  useEffect(() => {
    let isMounted = true;
    getBooks()
      .then((list) => { if (isMounted) setBooks(list); })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const renderBookItem = (book: string) => (
    <Pressable
      key={book}
      onPress={() => router.push(`/chapters?book=${encodeURIComponent(book)}`)}
      style={({ pressed }) => [styles.bookItem, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.bookText}>{book}</Text>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
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
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.textPrimary, fontSize: 24, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.textPrimary, letterSpacing: 2 },

  searchInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: colors.surface,
  },
  scrollView: { flex: 1 },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
  },
  bookText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.textPrimary },
  arrow: { fontSize: 18, fontFamily: 'Inter_400Regular', color: colors.textTertiary },
});
