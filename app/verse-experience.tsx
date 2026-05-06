import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ReactionButton from '../components/ui/ReactionButton';
import Section from '../components/ui/Section';
import { colors, radius, spacing } from '../theme';
import { postInteraction } from '../services/api';
import { shareKairos } from '../services/share';

const normalizeBookName = (name: string): string => {
  const corrections: Record<string, string> = {
    Genesis: 'Gênesis', Exodus: 'Êxodo', Leviticus: 'Levítico', Numbers: 'Números',
    Deuteronomy: 'Deuteronômio', Joshua: 'Josué', Judges: 'Juízes', Ruth: 'Rute',
    '1 Kings': '1 Reis', '2 Kings': '2 Reis', '1 Chronicles': '1 Crônicas',
    '2 Chronicles': '2 Crônicas', Ezra: 'Esdras', Nehemiah: 'Neemias', Esther: 'Ester',
    Job: 'Jó', Psalms: 'Salmos', Proverbs: 'Provérbios', Ecclesiastes: 'Eclesiastes',
    'Song of Solomon': 'Cânticos', 'Song of Songs': 'Cânticos', Isaiah: 'Isaías',
    Jeremiah: 'Jeremias', Lamentations: 'Lamentações', Ezekiel: 'Ezequiel',
    Hosea: 'Oséias', Amos: 'Amós', Obadiah: 'Obadias', Jonah: 'Jonas',
    Micah: 'Miquéias', Nahum: 'Naum', Habakkuk: 'Habacuque', Zephaniah: 'Sofonias',
    Haggai: 'Ageu', Zechariah: 'Zacarias', Malachi: 'Malaquias',
    Matthew: 'Mateus', Mark: 'Marcos', Luke: 'Lucas', John: 'João', Acts: 'Atos',
    Romans: 'Romanos', '1 Corinthians': '1 Coríntios', '2 Corinthians': '2 Coríntios',
    Galatians: 'Gálatas', Ephesians: 'Efésios', Philippians: 'Filipenses',
    Colossians: 'Colossenses', '1 Thessalonians': '1 Tessalonicenses',
    '2 Thessalonians': '2 Tessalonicenses', '1 Timothy': '1 Timóteo',
    '2 Timothy': '2 Timóteo', Titus: 'Tito', Philemon: 'Filemom', Hebrews: 'Hebreus',
    James: 'Tiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro',
    '1 John': '1 João', '2 John': '2 João', '3 John': '3 João', Jude: 'Judas',
    Revelation: 'Apocalipse',
  };
  return corrections[name] || name;
};

type InteractionResponse = { response?: string; message?: string; text?: string };

const REACTION_BUTTONS = [
  { id: 'peace',      emoji: '🙏',  label: 'Isso me trouxe paz',   message: 'Isso me trouxe paz.' },
  { id: 'confronted', emoji: '⚔️',  label: 'Isso me confrontou',   message: 'Isso me confrontou.' },
  { id: 'direction',  emoji: '🧭',  label: 'Preciso de direção',   message: 'Preciso de direção.' },
  { id: 'confused',   emoji: '❓',  label: 'Não entendi',           message: 'Não entendi.' },
] as const;

export default function VerseExperienceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ book?: string; chapter?: string; verse?: string; text?: string }>();

  const book = normalizeBookName(params.book || '');
  const chapter = params.chapter || '';
  const verse = params.verse || '';
  const verseText = params.text || '';
  const verseRef = useMemo(() => `${book} ${chapter}:${verse}`, [book, chapter, verse]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBtn, setSelectedBtn] = useState('');
  const [replyText, setReplyText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleReaction = async (btn: typeof REACTION_BUTTONS[number]) => {
    if (isSubmitting || replyText) return;
    setSelectedBtn(btn.id);
    setIsSubmitting(true);
    try {
      const res = await postInteraction('devocional', `${btn.message} Versículo ${verseRef}: "${verseText}"`);
      const data = (res.data ?? {}) as InteractionResponse;
      setReplyText(data.response ?? data.message ?? data.text ?? 'Sem resposta no momento.');
    } catch {
      setReplyText('Não foi possível enviar agora.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Versículo</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Reference + verse */}
          <Text style={styles.reference}>{verseRef}</Text>
          <Text style={styles.verseText}>{verseText}</Text>

          {/* 3 AI sections */}
          {verseRef && verseText ? (
            <>
              <Section title="Meditação" versReference={verseRef} versText={verseText} type="meditacao" />
              <Section title="Confronto"  versReference={verseRef} versText={verseText} type="confronto" />
              <Section title="Oração"     versReference={verseRef} versText={verseText} type="oracao" />
            </>
          ) : null}

          {/* 4 ReactionButtons */}
          <View style={styles.reactionsContainer}>
            {REACTION_BUTTONS.map((btn) => (
              <ReactionButton
                key={btn.id}
                emoji={btn.emoji}
                label={btn.label}
                onPress={() => handleReaction(btn)}
                selected={selectedBtn === btn.id}
                disabled={isSubmitting || !!replyText}
              />
            ))}
          </View>

          {/* AI reply */}
          {replyText ? (
            <View style={styles.replyBox}>
              <Text style={styles.replyText}>{replyText}</Text>
              {!feedbackSent ? (
                <Pressable onPress={() => { setFeedbackSent(true); shareKairos(replyText); }} style={styles.shareBtn}>
                  <Text style={styles.shareBtnText}>Compartilhar 🔗</Text>
                </Pressable>
              ) : (
                <Text style={styles.thankYou}>Obrigado pelo feedback</Text>
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, position: 'relative' },
  backButton: { position: 'absolute', left: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.text, fontSize: 24, lineHeight: 24 },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.text },
  content: { paddingHorizontal: spacing.md, paddingBottom: 40 },

  reference: { color: colors.gray, fontSize: 13, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 8 },
  verseText: { fontSize: 22, lineHeight: 32, fontFamily: 'Inter_700Bold', color: colors.text, textAlign: 'center', marginVertical: 20 },

  reactionsContainer: { marginTop: spacing.md },

  replyBox: { borderRadius: radius.md, backgroundColor: colors.card, padding: spacing.md, marginTop: spacing.md },
  replyText: { color: colors.white, fontSize: 15, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  shareBtn: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16, marginTop: 8 },
  shareBtnText: { color: colors.gray, fontSize: 13 },
  thankYou: { color: colors.gray, fontSize: 13, textAlign: 'center', marginTop: 8 },
});
