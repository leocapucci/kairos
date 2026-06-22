import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';
import {
  StudyApplication,
  StudyContext,
  StudyExplanation,
  useStudyContent,
} from '../../src/hooks/useStudyContent';
import Section from './Section';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toList(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  }
  return value.trim() ? [value.trim()] : [];
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value || !value.trim()) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value.trim()}</Text>
    </View>
  );
}

function ListField({ label, value }: { label: string; value?: string[] | string }) {
  const items = toList(value);
  if (items.length === 0) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {items.map((item, i) => (
        <Text key={i} style={styles.listItem}>{`•  ${item}`}</Text>
      ))}
    </View>
  );
}

function EmptyHint() {
  return <Text style={styles.emptyHint}>Conteúdo indisponível para este versículo.</Text>;
}

function hasAny(...nodes: React.ReactNode[]): boolean {
  return nodes.some((n) => n !== null && n !== undefined && n !== false);
}

// ─── Cards (conteúdo de cada accordion) ─────────────────────────────────────────

function ContextCard({ data }: { data?: StudyContext | null }) {
  if (!data) return <EmptyHint />;
  const rows = [
    <Field key="author" label="Autor" value={data.author} />,
    <Field key="date" label="Data" value={data.date} />,
    <Field key="recipients" label="Destinatários" value={data.recipients} />,
    <Field key="historical_scenario" label="Cenário histórico" value={data.historical_scenario} />,
    <Field key="chapter_situation" label="Situação cultural" value={data.chapter_situation} />,
  ];
  return hasAny(...rows) ? <>{rows}</> : <EmptyHint />;
}

function ExplanationCard({ data }: { data?: StudyExplanation | null }) {
  if (!data) return <EmptyHint />;
  const rows = [
    <Field key="main_meaning" label="Significado principal" value={data.main_meaning} />,
    <Field key="central_message" label="Mensagem central" value={data.central_message} />,
    <ListField key="gods_teaching" label="Ensinamentos" value={data.gods_teaching} />,
  ];
  return hasAny(...rows) ? <>{rows}</> : <EmptyHint />;
}

function ApplicationCard({ data }: { data?: StudyApplication | null }) {
  if (!data) return <EmptyHint />;
  const rows = [
    <Field key="how_to_apply" label="Como aplicar hoje" value={data.how_to_apply} />,
    <ListField key="reflection_questions" label="Perguntas para reflexão" value={data.reflection_questions} />,
    <ListField key="practical_challenges" label="Desafios práticos" value={data.practical_challenges} />,
  ];
  return hasAny(...rows) ? <>{rows}</> : <EmptyHint />;
}

function PrayerCard({ text }: { text?: string | null }) {
  if (!text || !text.trim()) return <EmptyHint />;
  return <Text style={styles.prayerText}>{text.trim()}</Text>;
}

// ─── Componente principal ───────────────────────────────────────────────────────

type StudyBibleSectionProps = {
  book: string;
  chapter: string | number;
  verse: string | number;
};

export default function StudyBibleSection({ book, chapter, verse }: StudyBibleSectionProps) {
  const { loading, error, data, refetch } = useStudyContent(book, chapter, verse);
  // Apenas um accordion aberto por vez; todos iniciam fechados.
  const [openCard, setOpenCard] = useState<number | null>(null);

  const toggle = (index: number) => setOpenCard((cur) => (cur === index ? null : index));

  // Backend ainda gerando o estudo (sem conteúdo em cache).
  const isGenerating =
    !loading &&
    !error &&
    data != null &&
    typeof data.status === 'string' &&
    data.status.toLowerCase() === 'generating';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Bíblia de Estudo Kairos</Text>

      {loading || isGenerating ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.sage} />
          <Text style={styles.stateText}>Preparando estudo deste versículo...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>
            Não foi possível carregar o estudo deste versículo.
          </Text>
          <Pressable onPress={refetch} hitSlop={6} style={styles.retryBtn}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : data ? (
        <>
          <Section
            title="📜 Contexto Histórico"
            open={openCard === 0}
            onToggle={() => toggle(0)}
          >
            <ContextCard data={data.context_json} />
          </Section>

          <Section
            title="📖 Significado do Texto"
            open={openCard === 1}
            onToggle={() => toggle(1)}
          >
            <ExplanationCard data={data.explanation_json} />
          </Section>

          <Section
            title="🧭 Aplicação Prática"
            open={openCard === 2}
            onToggle={() => toggle(2)}
          >
            <ApplicationCard data={data.application_json} />
          </Section>

          <Section
            title="🙏 Oração Guiada"
            open={openCard === 3}
            onToggle={() => toggle(3)}
          >
            <PrayerCard text={data.prayer_text} />
          </Section>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  heading: {
    marginTop: 36,
    color: colors.blackSoft,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stateCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.beige,
    alignItems: 'center',
  },
  stateText: {
    marginTop: spacing.md,
    color: '#333333',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.md,
  },
  retryText: {
    color: colors.sage,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  // — Conteúdo dos cards —
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: '#2E5E3A',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  fieldValue: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
  listItem: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.xs,
  },
  prayerText: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  emptyHint: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
});
