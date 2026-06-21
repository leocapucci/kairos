import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import StudyBibleSection from '../components/ui/StudyBibleSection';
import { colors, radius, spacing } from '../theme';
import { normalizeBookName } from '../src/utils/normalizeBookName';
import { formatVerseRef } from '../src/utils/formatVerseRef';
import { useScreenTracking } from '../src/hooks/useScreenTracking';

export default function StudyExperienceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    book?: string;
    chapter?: string;
    verse?: string;
    text?: string;
  }>();

  const book = normalizeBookName(params.book || '');
  const chapter = params.chapter || '';
  const verse = params.verse || '';
  const verseText = params.text || '';
  const verseRef = useMemo(() => formatVerseRef(book, chapter, verse), [book, chapter, verse]);

  useScreenTracking('study_experience');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerLabel}>BÍBLIA DE ESTUDO KAIROS</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {verseText ? (
            <View style={styles.verseCard}>
              <Text style={styles.verseRef}>{verseRef}</Text>
              <Text style={styles.verseText}>{verseText}</Text>
            </View>
          ) : null}

          {book && chapter && verse ? (
            <StudyBibleSection book={book} chapter={chapter} verse={verse} />
          ) : null}
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
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 80,
  },
  verseCard: {
    backgroundColor: colors.beige,
    borderRadius: radius.lg,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    marginBottom: spacing.lg,
  },
  verseRef: {
    color: colors.sage,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  verseText: {
    color: colors.blackSoft,
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },
});
