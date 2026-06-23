import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import KairosEditionHeader from '../components/kairos-edition/KairosEditionHeader';
import KairosEditionCard from '../components/kairos-edition/KairosEditionCard';
import KairosEditionNavigation from '../components/kairos-edition/KairosEditionNavigation';
import KairosEditionShareModal, {
  ShareDestination,
} from '../components/kairos-edition/KairosEditionShareModal';
import { getDailyCollection, KairosCard, KairosCategory } from '../data/kairosEdition';
import { colors } from '../theme';

const HEADER_HEIGHT = 62;
const NAV_HEIGHT = 60;
const SHARE_AREA_HEIGHT = 66;

// ─── Mapa de auditoria (DEV only) ────────────────────────────────────────────
// Relaciona categoria → nome do arquivo de imagem real ou placeholder.
const AUDIT_IMAGE_MAP: Record<KairosCategory, string> = {
  fe:           'faith_master_v1.jpg',
  esperanca:    'hope_master_v1.jpg',
  direcao:      'direction_master_v1.jpg',
  forca:        'strength_master_v1.jpg',
  gratidao:     'gratitude_master_v1.jpg',
  descanso:     'rest_master_v1.jpg',
  confianca:    'trust_master_v1.jpg',
  coragem:      'courage_master_v1.jpg',
  proposito:    'purpose_master_v1.jpg',
  'recomeço':   'new_beginning_master_v1.jpg',
  // Placeholders (Fase 2 do lote de produção)
  amor:         '[placeholder] kairosbackground.jpg',
  paz:          '[placeholder] kairosbackground2.png',
  perseveranca: '[placeholder] kairosbackground.jpg',
  graca:        '[placeholder] kairosbackground2.png',
  renovacao:    '[placeholder] kairosbackground.jpg',
  cura:         '[placeholder] kairosbackground2.png',
  vitoria:      '[placeholder] kairosbackground.jpg',
  alegria:      '[placeholder] kairosbackground2.png',
  especial:     '[placeholder] kairosbackground.jpg',
};

export default function KairosEditionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareUri, setShareUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [auditMode, setAuditMode] = useState(false);

  const cards: KairosCard[] = useMemo(() => getDailyCollection(), []);

  const cardHeight =
    height - insets.top - insets.bottom - HEADER_HEIGHT - SHARE_AREA_HEIGHT - NAV_HEIGHT;

  const flatListRef = useRef<FlatList<KairosCard>>(null);
  const captureRef = useRef<ViewShot>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= cards.length) return;
      setCurrentIndex(index);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    },
    [cards.length],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);
        // ANALYTICS: card_viewed { cardId: cards[newIndex].id, category: cards[newIndex].category, position: newIndex, date: new Date().toISOString() }
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleSharePress = useCallback(async () => {
    // ANALYTICS: share_initiated { cardId: cards[currentIndex].id, category: cards[currentIndex].category }
    setIsCapturing(true);
    try {
      const uri = await captureRef.current?.capture?.();
      if (uri) {
        setShareUri(uri);
        setShareModalVisible(true);
      }
    } catch {
      const card = cards[currentIndex];
      if (card) {
        Share.share({
          message: `"${card.phrase}"\n— ${card.reference}\n\nKairos · Favor sem merecimento`,
        }).catch(Boolean);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [cards, currentIndex]);

  const handleShareSelect = useCallback(
    async (dest: ShareDestination) => {
      setShareModalVisible(false);
      if (!shareUri) return;
      // ANALYTICS: share_completed { cardId: cards[currentIndex].id, category: cards[currentIndex].category, destination: dest, date: new Date().toISOString() }
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          const dialogTitle =
            dest === 'stories' ? 'Compartilhar nos Stories' :
            dest === 'whatsapp' ? 'Compartilhar no WhatsApp' :
            dest === 'save' ? 'Salvar imagem' :
            'Compartilhar Kairos';
          await Sharing.shareAsync(shareUri, { mimeType: 'image/png', dialogTitle });
        } else {
          const card = cards[currentIndex];
          if (card) {
            await Share.share({
              message: `"${card.phrase}"\n— ${card.reference}\n\nKairos · Favor sem merecimento`,
            });
          }
        }
      } catch {
        // silent
      }
    },
    [shareUri, cards, currentIndex],
  );

  const currentCard = cards[currentIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <KairosEditionHeader
        onBack={() => router.back()}
        currentTheme={currentCard?.theme ?? ''}
      />

      <ViewShot ref={captureRef} style={styles.listContainer}>
        <FlatList
          ref={flatListRef}
          data={cards}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          onScrollToIndexFailed={({ index }) => {
            flatListRef.current?.scrollToOffset({
              offset: index * width,
              animated: true,
            });
          }}
          renderItem={({ item }) => (
            <KairosEditionCard
              card={item}
              cardWidth={width}
              cardHeight={cardHeight}
            />
          )}
          style={styles.list}
        />
      </ViewShot>

      <Pressable
        onPress={handleSharePress}
        onLongPress={__DEV__ ? () => setAuditMode((v) => !v) : undefined}
        disabled={isCapturing}
        style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.78 }]}
      >
        <Text style={styles.shareArrow}>↗</Text>
        <Text style={styles.shareBtnText}>
          {isCapturing ? 'Preparando...' : 'Compartilhar nos Stories'}
        </Text>
      </Pressable>

      <KairosEditionNavigation
        current={currentIndex}
        total={cards.length}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={() => goTo(currentIndex + 1)}
      />

      <KairosEditionShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onSelect={handleShareSelect}
      />

      {/* ─── Audit Mode (DEV only) ─────────────────────────────────────────── */}
      {__DEV__ && auditMode && currentCard && (
        <View style={styles.auditOverlay}>
          <View style={styles.auditPanel}>
            <View style={styles.auditHeader}>
              <Text style={styles.auditTitle}>⚙ AUDIT — card {currentIndex + 1}/{cards.length}</Text>
              <Pressable onPress={() => setAuditMode(false)}>
                <Text style={styles.auditClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.auditScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.auditLabel}>ID</Text>
              <Text style={styles.auditValue}>{currentCard.id}</Text>

              <Text style={styles.auditLabel}>THEME</Text>
              <Text style={styles.auditValue}>{currentCard.theme}</Text>

              <Text style={styles.auditLabel}>CATEGORY</Text>
              <Text style={styles.auditValue}>{currentCard.category}</Text>

              <Text style={styles.auditLabel}>IMAGE FILE</Text>
              <Text style={[
                styles.auditValue,
                AUDIT_IMAGE_MAP[currentCard.category].startsWith('[placeholder]')
                  ? styles.auditWarn
                  : styles.auditOk,
              ]}>
                {AUDIT_IMAGE_MAP[currentCard.category]}
              </Text>

              <Text style={styles.auditLabel}>OVERLAY</Text>
              <Text style={styles.auditValue}>{currentCard.overlayColor}</Text>

              <Text style={styles.auditLabel}>FRASE</Text>
              <Text style={styles.auditValue}>{currentCard.phrase}</Text>

              <Text style={styles.auditLabel}>REFERÊNCIA</Text>
              <Text style={styles.auditValue}>{currentCard.reference}</Text>

              <View style={styles.auditDivider} />
              <Text style={styles.auditMeta}>
                Long press no botão de compartilhar para fechar
              </Text>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 50,
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
  },
  shareArrow: {
    color: colors.gold,
    fontSize: 15,
    lineHeight: 20,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },

  // ─── Audit panel (DEV only) ────────────────────────────────────────────────
  auditOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  auditPanel: {
    backgroundColor: 'rgba(8, 10, 18, 0.96)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 200, 50, 0.30)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: 340,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  auditTitle: {
    color: colors.gold,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  auditClose: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  auditScroll: {
    flex: 1,
  },
  auditLabel: {
    color: 'rgba(255, 200, 50, 0.60)',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 2,
  },
  auditValue: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  auditOk: {
    color: '#4ADE80',
  },
  auditWarn: {
    color: '#FBBF24',
  },
  auditDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 10,
  },
  auditMeta: {
    color: 'rgba(255,255,255,0.30)',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
