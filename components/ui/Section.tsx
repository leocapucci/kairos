import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { postInteraction } from '../../services/api';
import { colors, spacing } from '../../theme';

export type SectionType = 'meditacao' | 'confronto' | 'oracao';

type SectionProps = {
  title: string;
  versReference: string;
  versText: string;
  type: SectionType;
};

type InteractionResponse = { response?: string; message?: string; text?: string };

const PROMPTS: Record<SectionType, (ref: string, text: string) => string> = {
  meditacao: (ref, text) =>
    `Dê uma meditação espiritual breve (máximo 80 palavras) sobre ${ref}: "${text}". Seja direto e contemplativo.`,
  confronto: (ref, text) =>
    `De forma direta e honesta (máximo 80 palavras), aponte o que ${ref}: "${text}" desafia na vida prática. Seja específico.`,
  oracao: (ref, text) =>
    `Escreva uma oração breve (máximo 80 palavras) baseada em ${ref}: "${text}". Pessoal, do coração, em primeira pessoa.`,
};

export default function Section({ title, versReference, versText, type }: SectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isOpen) { setIsOpen(false); return; }
    setIsOpen(true);
    if (content) return;
    setIsLoading(true);
    try {
      const res = await postInteraction('devocional', PROMPTS[type](versReference, versText));
      const data = (res.data ?? {}) as InteractionResponse;
      setContent(data.response ?? data.message ?? data.text ?? 'Conteúdo não disponível.');
    } catch {
      setContent('Não foi possível carregar o conteúdo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleToggle} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggle}>{isOpen ? '−' : '+'}</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={styles.content}>{content}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: colors.softGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  toggle: {
    color: colors.gray,
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  body: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  content: {
    color: '#6B6B6B',
    fontSize: 17,
    lineHeight: 30,
    fontFamily: 'Inter_400Regular',
  },
});
