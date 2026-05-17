import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import VerseCard from '../components/ui/VerseCard';
import { Button, Card, EmptyState, Loading } from '../src/design-system';
import { useVerseOfDay } from '../src/query/hooks/useVerse';
import { usePlansData } from '../src/query/hooks/usePlans';
import { searchBible } from '../services/api';
import { colors, radius, spacing } from '../theme';
import { useSavedVerses } from '../src/hooks/useSavedVerses';

type SearchResult = { book: string; chapter: number; verse: number; text: string };
type Plan = { id: string; title: string; description: string; days: number; theme: string };

const TABS = ['Livros', 'Planos', 'Salvos'] as const;
type Tab = (typeof TABS)[number];

export default function BibleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Livros');
  const [searchQuery, setSearchQuery] = useState('');
  const { savedVerses, removeSavedVerse } = useSavedVerses();

  // Verse of the day — shared cache with home.tsx (same queryKey)
  const { data: verse } = useVerseOfDay();

  // Plans — loaded only when Planos tab is active (lazy loading)
  const { plans, isLoading: isLoadingPlans } = usePlansData({ enabled: activeTab === 'Planos' });

  // Bible search — mutation (user-triggered, not auto-fetched)
  const searchMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await searchBible(q);
      return res.data.results as SearchResult[];
    },
  });

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    searchMutation.mutate(q);
  };

  const searchResults = searchMutation.data ?? [];
  const isSearching = searchMutation.isPending;
  const hasSearched = searchMutation.isSuccess || searchMutation.isError;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Bíblia</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── LIVROS ── */}
        {activeTab === 'Livros' && (
          <>
            {verse && (
              <VerseCard
                text={verse.text}
                reference={`${verse.book} ${verse.chapter}:${verse.verse_number}`}
                onPress={() =>
                  router.push(
                    `/verse-experience?book=${encodeURIComponent(verse.book)}&chapter=${verse.chapter}&verse=${verse.verse_number}&text=${encodeURIComponent(verse.text)}`,
                  )
                }
              />
            )}

            <Button
              variant="ghost"
              label="Explorar a Bíblia completa →"
              onPress={() => router.push('/books')}
            />

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar versículo..."
                placeholderTextColor={colors.grayOrganic}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Button
                variant="sage"
                label="Buscar"
                onPress={handleSearch}
                disabled={isSearching}
                loading={isSearching}
                fullWidth={false}
              />
            </View>

            {isSearching && <Loading />}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <Text style={styles.emptyText}>Nenhum versículo encontrado.</Text>
            )}
            {searchResults.map((item, i) => (
              <Pressable
                key={`${item.book}-${item.chapter}-${item.verse}-${i}`}
                style={({ pressed }) => [
                  styles.searchResult,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push(
                    `/verse-experience?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}&verse=${item.verse}&text=${encodeURIComponent(item.text)}`,
                  )
                }
              >
                <Text style={styles.searchResultRef}>
                  {item.book} {item.chapter}:{item.verse}
                </Text>
                <Text style={styles.searchResultText} numberOfLines={3}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {/* ── PLANOS ── */}
        {activeTab === 'Planos' && (
          <>
            {isLoadingPlans ? (
              <Loading message="Carregando planos..." />
            ) : plans.length === 0 ? (
              <EmptyState
                icon="📖"
                title="Ainda não temos planos aqui"
                description="Novos planos chegam em breve. Volte logo."
              />
            ) : (
              (plans as Plan[]).map((plan) => (
                <Card key={plan.id} variant="beige" padding="lg" style={styles.planCardWrap}>
                  <View style={styles.planMeta}>
                    <Text style={styles.planTheme}>{plan.theme.toUpperCase()}</Text>
                    <Text style={styles.planDays}>{plan.days} dias</Text>
                  </View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDesc}>{plan.description}</Text>
                  <Button
                    variant="ghost"
                    label="Acessar plano →"
                    onPress={() => router.push('/plans')}
                  />
                </Card>
              ))
            )}
          </>
        )}

        {/* ── SALVOS ── */}
        {activeTab === 'Salvos' && (
          savedVerses.length === 0 ? (
            <EmptyState
              icon="🔖"
              title="Nenhum versículo salvo ainda"
              description="Salve versículos que tocaram seu coração"
            />
          ) : (
            savedVerses.map((item) => (
              <View key={item.reference} style={styles.savedCard}>
                <View style={styles.savedCardBody}>
                  <Text style={styles.savedRef}>{item.reference}</Text>
                  <Text style={styles.savedText} numberOfLines={4}>{item.text}</Text>
                </View>
                <Pressable
                  onPress={() => removeSavedVerse(item.reference)}
                  hitSlop={8}
                  style={styles.savedRemoveBtn}
                >
                  <Text style={styles.savedRemoveIcon}>✕</Text>
                </Pressable>
              </View>
            ))
          )
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
    paddingTop: 28,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Inter_700Bold',
    color: colors.blackSoft,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
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
    color: colors.grayOrganic,
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: colors.blackSoft,
    fontFamily: 'Inter_700Bold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.sage,
    borderRadius: 1,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 64,
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
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.blackSoft,
    fontSize: 14,
    backgroundColor: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  emptyText: {
    color: colors.grayOrganic,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  searchResult: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  searchResultRef: {
    color: colors.sage,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  searchResultText: {
    color: colors.blackSoft,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  savedCardBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  savedRef: {
    color: colors.gold,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  savedText: {
    color: colors.blackSoft,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  savedRemoveBtn: {
    paddingTop: 2,
    paddingLeft: 4,
  },
  savedRemoveIcon: {
    fontSize: 20,
  },
  planCardWrap: { marginBottom: spacing.sm },
  planMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planTheme: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  planDays: {
    color: colors.grayOrganic,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  planTitle: {
    color: colors.blackSoft,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.4,
    marginBottom: spacing.xs,
  },
  planDesc: {
    color: colors.grayOrganic,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.md,
  },
});
