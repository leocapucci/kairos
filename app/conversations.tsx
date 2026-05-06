import { useRouter } from 'expo-router';
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

import BottomNav from '../components/BottomNav';
import { colors, radius, spacing } from '../theme';
import { getInteractionsHistory } from '../services/api';

type HistoryItem = {
  id: string;
  message?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
};

const SUGGESTIONS = [
  'Como lidar com a ansiedade na fé?',
  'O que a Bíblia diz sobre perdão?',
  'Como ouvir a voz de Deus?',
];

function formatDate(raw?: string): string {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

export default function ConversationsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    setIsLoadingHistory(true);
    getInteractionsHistory()
      .then((res) => setHistory((res.data as HistoryItem[]) ?? []))
      .catch(() => setHistory([]))
      .finally(() => setIsLoadingHistory(false));
  }, []);

  const handleSend = () => {
    const text = query.trim();
    if (!text) return;
    router.push({ pathname: '/interaction', params: { type: 'devocional', text } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Faça sua pergunta para o KAIROS"
            placeholderTextColor={colors.gray}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable onPress={handleSend} disabled={!query.trim()} style={[styles.sendBtn, !query.trim() && styles.sendBtnDisabled]}>
            <Text style={styles.sendBtnText}>→</Text>
          </Pressable>
        </View>

        {/* Suggestions */}
        <Text style={styles.sectionLabel}>Sugestões</Text>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => router.push({ pathname: '/interaction', params: { type: 'devocional', text: s } })}
            style={styles.suggestionCard}
          >
            <Text style={styles.suggestionText}>{s}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}

        {/* History */}
        <Text style={styles.sectionLabel}>Perguntas recentes</Text>
        {isLoadingHistory ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 16 }} />
        ) : history.length > 0 ? (
          history.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/interaction', params: { type: 'devocional', text: item.message ?? item.text ?? '' } })}
              style={styles.historyItem}
            >
              <Text style={styles.historyText} numberOfLines={2}>
                {item.message ?? item.text ?? '—'}
              </Text>
              <View style={styles.historyMeta}>
                <Text style={styles.historyDate}>{formatDate(item.created_at ?? item.createdAt)}</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Suas conversas aparecem aqui</Text>
            <Text style={styles.emptyDesc}>Faça uma pergunta para começar</Text>
          </View>
        )}

      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', color: colors.text },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 32 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.lg, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E6E2DD',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: colors.white, fontSize: 20, fontWeight: '700' },

  sectionLabel: {
    color: colors.gray,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: 4,
  },

  suggestionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E2DD',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: 8,
  },
  suggestionText: { flex: 1, color: colors.text, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  arrow: { color: colors.accent, fontSize: 16, marginLeft: 8 },

  historyItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E2DD',
    padding: spacing.md,
    marginBottom: 8,
    gap: 8,
  },
  historyText: { color: colors.text, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  historyMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { color: colors.gray, fontSize: 12, fontFamily: 'Inter_400Regular' },

  emptyState: { alignItems: 'center', paddingTop: 32, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { color: colors.text, fontSize: 15, fontFamily: 'Inter_700Bold' },
  emptyDesc: { color: colors.gray, fontSize: 13, fontFamily: 'Inter_400Regular' },
});
