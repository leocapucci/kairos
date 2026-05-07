import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import BottomNav from '../components/BottomNav';
import VerseCard from '../components/ui/VerseCard';
import { colors, radius, spacing } from '../theme';
import { getPlans, searchBible } from '../services/api';

type SearchResult = { book: string; chapter: number; verse: number; text: string };
type Plan = { id: string; title: string; description: string; days: number; theme: string };
type VerseData = { text: string; book: string; chapter: number; verse_number: number };

const TABS = ['Livros', 'Planos', 'Salvos'] as const;
type Tab = typeof TABS[number];

export default function BibleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Livros');

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    fetch('https://kairos-backend-vjdp.onrender.com/bible/verse-of-day')
      .then((r) => r.json())
      .then(setVerse)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== 'Planos' || plans.length > 0) return;
    setIsLoadingPlans(true);
    getPlans()
      .then((res) => setPlans(res.data as Plan[]))
      .catch(() => {})
      .finally(() => setIsLoadingPlans(false));
  }, [activeTab, plans.length]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setHasSearched(false);
    setSearchResults([]);
    try {
      const res = await searchBible(q);
      const data = res.data as { results: SearchResult[] };
      setSearchResults(data.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.titleBar}>
        <Text style={styles.title}>Bíblia</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── LIVROS ── */}
        {activeTab === 'Livros' && (
          <>
            {verse && (
              <VerseCard
                text={verse.text}
                reference={`${verse.book} ${verse.chapter}:${verse.verse_number}`}
                onPress={() =>
                  router.push(`/verse-experience?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}&verse=${verse.verse_number}&text=${encodeURIComponent(verse.text)}`)
                }
              />
            )}

            <Pressable onPress={() => router.push('/books')} style={styles.exploreBtn}>
              <Text style={styles.exploreBtnText}>EXPLORAR A BÍBLIA COMPLETA</Text>
              <Text style={styles.exploreBtnArrow}>→</Text>
            </Pressable>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar versículo..."
                placeholderTextColor="rgba(0,0,0,0.28)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Pressable onPress={handleSearch} disabled={isSearching} style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>Buscar</Text>
              </Pressable>
            </View>

            {isSearching && <ActivityIndicator color={colors.accent} style={styles.loader} />}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <Text style={styles.emptyText}>Nenhum versículo encontrado.</Text>
            )}
            {searchResults.map((item, i) => (
              <Pressable
                key={`${item.book}-${item.chapter}-${item.verse}-${i}`}
                style={styles.searchResult}
                onPress={() =>
                  router.push(`/verse-experience?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}&verse=${item.verse}&text=${encodeURIComponent(item.text)}`)
                }
              >
                <Text style={styles.searchResultRef}>{item.book} {item.chapter}:{item.verse}</Text>
                <Text style={styles.searchResultText} numberOfLines={3}>{item.text}</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* ── PLANOS ── */}
        {activeTab === 'Planos' && (
          <>
            {isLoadingPlans ? (
              <ActivityIndicator color={colors.accent} style={styles.loader} />
            ) : (
              plans.map((plan) => (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planMeta}>
                    <Text style={styles.planTheme}>{plan.theme.toUpperCase()}</Text>
                    <Text style={styles.planDays}>{plan.days} dias</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDesc}>{plan.description}</Text>
                  <Pressable onPress={() => router.push('/plans')} style={styles.planBtn}>
                    <Text style={styles.planBtnText}>Acessar plano</Text>
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}

        {/* ── SALVOS ── */}
        {activeTab === 'Salvos' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔖</Text>
            <Text style={styles.emptyStateTitle}>Nenhum versículo salvo ainda</Text>
            <Text style={styles.emptyStateDesc}>Salve versículos que tocaram seu coração</Text>
          </View>
        )}

      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBar: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 4,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.softGray,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  tabItem: {
    marginRight: 28,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: colors.text,
    fontFamily: 'Inter_700Bold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 1,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 64,
  },
  loader: {
    paddingVertical: spacing.xl,
  },

  exploreBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.softGray,
  },
  exploreBtnText: {
    color: colors.text,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  exploreBtnArrow: {
    color: colors.gray,
    fontSize: 16,
  },

  searchRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.softGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
    backgroundColor: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  searchBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(200,76,76,0.05)',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  emptyText: {
    color: colors.gray,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  searchResult: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.softGray,
  },
  searchResultRef: {
    color: colors.accent,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  searchResultText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },

  planCard: {
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.softGray,
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 28,
    marginBottom: spacing.sm,
  },
  planMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTheme: {
    color: colors.accent,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  planDays: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  planTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.4,
    marginBottom: spacing.xs,
  },
  planDesc: {
    color: '#6B6B6B',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.lg,
  },
  planBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.softGray,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  planBtnText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl * 2,
    gap: spacing.xs,
  },
  emptyStateIcon: { fontSize: 40 },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  emptyStateDesc: {
    color: colors.gray,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
