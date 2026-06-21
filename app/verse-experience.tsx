import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import SaveVerseButton from '../components/ui/SaveVerseButton';
import Section from '../components/ui/Section';
import { colors, radius, spacing } from '../theme';
import { useAiRequest } from '../src/hooks/useAiRequest';
import { saveVerseAction } from '../src/services/api/action';
import { shareKairos } from '../src/services/api/share';
import { formatVerseRef } from '../src/utils/formatVerseRef';
import { normalizeBookName } from '../src/utils/normalizeBookName';
import { E, track } from '../src/analytics';
import { useScreenTracking } from '../src/hooks/useScreenTracking';
import { useSavedVerses } from '../src/hooks/useSavedVerses';

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
  const verseRef = useMemo(() => formatVerseRef(book, chapter, verse), [book, chapter, verse]);

  const { isVerseSaved, saveVerse, removeSavedVerse } = useSavedVerses();

  const { state: aiState, send: sendAiRequest, retry: retryAiRequest } = useAiRequest();
  const [selectedBtn, setSelectedBtn] = useState('');
  const isSavingVerse = useRef(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async (content: string, reference?: string) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (reference) track(E.VERSE_SHARED, { reference });
      await shareKairos(content);
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  useScreenTracking('verse_experience');

  useEffect(() => {
    if (verseRef) track(E.VERSE_VIEWED, { reference: verseRef });
  }, [verseRef]);

  const handleReaction = useCallback((btn: typeof REACTION_BUTTONS[number]) => {
    if (aiState.phase === 'loading' || aiState.phase === 'success') return;
    setSelectedBtn(btn.id);
    void sendAiRequest('devocional', `${btn.message} Versículo ${verseRef}: "${verseText}"`);
  }, [aiState.phase, sendAiRequest, verseRef, verseText]);

  const handleSaveVerse = async () => {
    if (!verseRef.trim() || isSavingVerse.current) return;
    isSavingVerse.current = true;
    const alreadySaved = isVerseSaved(verseRef);
    track(E.VERSE_SAVED, { reference: verseRef });
    if (alreadySaved) {
      removeSavedVerse(verseRef);
    } else {
      saveVerse({
        reference: verseRef,
        text: verseText,
        book,
        chapter: Number(chapter),
        verse: Number(verse),
      });
    }
    try {
      await saveVerseAction('anon', verseRef, 'verse_save', alreadySaved ? 'unsave' : 'save');
    } catch {
      // non-critical
    } finally {
      isSavingVerse.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerLabel}>VERSÍCULO</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Verse — sacred focal point */}
          <View style={styles.verseBlock}>
            {verseText ? (
              <View style={styles.saveVerseBtn}>
                <SaveVerseButton saved={isVerseSaved(verseRef)} onPress={handleSaveVerse} />
              </View>
            ) : null}
            <Text style={styles.reference}>{verseRef}</Text>
            <Text style={styles.verseText}>{verseText}</Text>
            {verseText ? (
              <Pressable
                onPress={() => handleShare(verseText, verseRef)}
                disabled={isSharing}
                style={[styles.shareBtn, isSharing && { opacity: 0.5 }]}
              >
                <Text style={styles.shareBtnText}>↗  Compartilhar</Text>
              </Pressable>
            ) : null}
          </View>

          {/* AI sections */}
          {verseRef && verseText ? (
            <>
              <Section title="Meditação" versReference={verseRef} versText={verseText} type="meditacao" />
              <Section title="Confronto"  versReference={verseRef} versText={verseText} type="confronto" />
              <Section title="Oração"     versReference={verseRef} versText={verseText} type="oracao" />
            </>
          ) : null}

          {/* Reactions */}
          <View style={styles.reactionsContainer}>
            {REACTION_BUTTONS.map((btn) => (
              <ReactionButton
                key={btn.id}
                emoji={aiState.phase === 'loading' && selectedBtn === btn.id ? '⏳' : btn.emoji}
                label={btn.label}
                onPress={() => handleReaction(btn)}
                selected={selectedBtn === btn.id}
                disabled={aiState.phase === 'loading' || aiState.phase === 'success'}
              />
            ))}
          </View>

          {/* AI reply */}
          {aiState.phase === 'success' && (
            <View style={styles.replyBox}>
              <Text style={styles.replyLabel}>KAIROS</Text>
              <Text style={styles.replyText}>{aiState.text}</Text>
              <Pressable
                onPress={() => handleShare(aiState.text)}
                disabled={isSharing}
                style={[styles.shareBtn, isSharing && { opacity: 0.5 }]}
              >
                <Text style={styles.shareBtnText}>↗  Compartilhar</Text>
              </Pressable>
            </View>
          )}
          {aiState.phase === 'error' && (
            <View style={styles.replyBox}>
              <Text style={styles.replyLabel}>KAIROS</Text>
              <Text style={styles.replyText}>{aiState.message}</Text>
              <Pressable onPress={retryAiRequest} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>Tentar novamente</Text>
              </Pressable>
            </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backIcon: {
    color: colors.blackSoft,
    fontSize: 26,
    lineHeight: 26,
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: colors.grayOrganic,
    letterSpacing: 2.5,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  verseBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginTop: 52,
    marginBottom: 64,
    position: 'relative',
  },
  saveVerseBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  reference: {
    color: colors.grayOrganic,
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 28,
    textTransform: 'uppercase',
  },
  verseText: {
    fontSize: 32,
    lineHeight: 48,
    fontFamily: 'Inter_700Bold',
    color: colors.blackSoft,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  reactionsContainer: {
    marginTop: 48,
  },

  replyBox: {
    borderRadius: radius.md,
    backgroundColor: colors.beige,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginTop: spacing.lg,
  },
  replyLabel: {
    color: colors.sage,
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  replyText: {
    color: colors.blackSoft,
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
  shareBtn: {
    alignSelf: 'flex-start',
    paddingTop: spacing.md,
  },
  shareBtnText: {
    color: colors.grayOrganic,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
