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

      <View style={styles.titleBar}>
        <Text style={styles.title}>Conversas</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Nova conversa */}
        <Text style={styles.sectionLabel}>Nova conversa</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Faça sua pergunta para o KAIROS"
            placeholderTextColor={colors.grayOrganic}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!query.trim()}
            style={[styles.sendBtn, !query.trim() && styles.sendBtnDisabled]}
          >
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
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Perguntas recentes</Text>
        {isLoadingHistory ? (
          <ActivityIndicator color={colors.sage} style={{ paddingVertical: spacing.md }} />
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
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleBar: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: colors.blackSoft,
    letterSpacing: -1,
    lineHeight: 48,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 64,
  },

  sectionLabel: {
    color: colors.grayOrganic,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  sectionLabelSpaced: {
    marginTop: spacing.lg,
  },

  inputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.blackSoft,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },

  suggestionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.beige,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    flex: 1,
    color: colors.blackSoft,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  arrow: {
    color: colors.sage,
    fontSize: 16,
    marginLeft: spacing.xs,
  },

  historyItem: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  historyText: {
    color: colors.blackSoft,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    color: colors.grayOrganic,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: {
    color: colors.blackSoft,
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  emptyDesc: {
    color: colors.grayOrganic,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
