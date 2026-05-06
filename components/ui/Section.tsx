import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { postInteraction } from '../../services/api';
import { colors } from '../../theme';

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
        <Text style={styles.chevron}>{isOpen ? '▼' : '▶'}</Text>
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
  container: { marginTop: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  chevron: { color: colors.gray, fontSize: 12 },
  body: { paddingTop: 4, paddingBottom: 12 },
  content: {
    color: colors.gray,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
});
