import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAiRequest } from '../../src/hooks/useAiRequest';
import { colors, spacing } from '../../theme';

export type SectionType = 'meditacao' | 'confronto' | 'oracao';

type SectionProps = {
  title: string;
  // — Modo IA (devocional): dispara requisição ao abrir —
  versReference?: string;
  versText?: string;
  type?: SectionType;
  // — Modo estático (conteúdo já carregado): renderiza children —
  children?: React.ReactNode;
  // — Accordion controlado pelo pai (ex.: apenas um aberto por vez) —
  open?: boolean;
  onToggle?: () => void;
};


const PROMPTS: Record<SectionType, (ref: string, text: string) => string> = {
  meditacao: (ref, text) =>
    `Dê uma meditação espiritual breve (máximo 80 palavras) sobre ${ref}: "${text}". Seja direto e contemplativo.`,
  confronto: (ref, text) =>
    `De forma direta e honesta (máximo 80 palavras), aponte o que ${ref}: "${text}" desafia na vida prática. Seja específico.`,
  oracao: (ref, text) =>
    `Escreva uma oração breve (máximo 80 palavras) baseada em ${ref}: "${text}". Pessoal, do coração, em primeira pessoa.`,
};

export default function Section({
  title,
  versReference,
  versText,
  type,
  children,
  open,
  onToggle,
}: SectionProps) {
  const isStatic = children !== undefined;
  const isControlled = open !== undefined && onToggle !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open! : internalOpen;

  const { state: aiState, send: sendAiRequest, retry: retryAiRequest } = useAiRequest();

  const handleToggle = () => {
    const willOpen = !isOpen;

    if (isControlled) {
      onToggle!();
    } else {
      setInternalOpen(willOpen);
    }

    // Modo IA: dispara a requisição apenas ao abrir e se ainda não houve sucesso.
    if (!isStatic && willOpen && type && aiState.phase !== 'success') {
      void sendAiRequest('devocional', PROMPTS[type](versReference ?? '', versText ?? ''));
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
          {isStatic ? (
            children
          ) : aiState.phase === 'loading' ? (
            <ActivityIndicator color={colors.sage} />
          ) : aiState.phase === 'success' ? (
            <Text style={styles.content}>{aiState.text}</Text>
          ) : aiState.phase === 'error' ? (
            <>
              <Text style={styles.content}>{aiState.message}</Text>
              <Pressable onPress={retryAiRequest} hitSlop={4}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </>
          ) : null}
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
    color: '#1A1A1A',
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
    color: '#333333',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
  retryText: {
    color: colors.sage,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: spacing.sm,
  },
});
