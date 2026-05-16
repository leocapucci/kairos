import React, { useEffect, useRef, useState } from 'react';
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
  const isMountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const handleToggle = async () => {
    if (isOpen) { setIsOpen(false); return; }
    setIsOpen(true);
    if (content) return;

    // Abort any in-flight request before starting a new one
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    try {
      const res = await postInteraction(
        'devocional',
        PROMPTS[type](versReference, versText),
        ctrl.signal,
      );
      if (!isMountedRef.current || ctrl.signal.aborted) return;
      const data = (res.data ?? {}) as InteractionResponse;
      setContent(data.response ?? data.message ?? data.text ?? 'Conteúdo não disponível.');
    } catch {
      if (!isMountedRef.current || ctrl.signal.aborted) return;
      setContent('Não foi possível carregar o conteúdo.');
    } finally {
      if (isMountedRef.current && !ctrl.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleToggle}
        style={styles.header}
        hitSlop={4}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggle}>{isOpen ? '−' : '+'}</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.body}>
          {isLoading ? (
            <ActivityIndicator color={colors.sage} />
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
    marginTop: 36,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.blackSoft,
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
  toggle: {
    color: colors.sage,
    fontSize: 22,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
  },
  body: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  content: {
    color: colors.grayOrganic,
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
});
