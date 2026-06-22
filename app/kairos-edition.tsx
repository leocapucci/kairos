import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
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
import { getDailyCollection, KairosCard } from '../data/kairosEdition';
import { colors } from '../theme';

const HEADER_HEIGHT = 62;
const NAV_HEIGHT = 60;
const SHARE_AREA_HEIGHT = 66;

export default function KairosEditionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareUri, setShareUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleSharePress = useCallback(async () => {
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

  return (
    <SafeAreaView style={styles.safe}>
      <KairosEditionHeader
        onBack={() => router.back()}
        currentTheme={cards[currentIndex]?.theme ?? ''}
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
});
