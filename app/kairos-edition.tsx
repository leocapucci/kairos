import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, ViewToken, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import KairosEditionHeader from '../components/kairos-edition/KairosEditionHeader';
import KairosEditionCard from '../components/kairos-edition/KairosEditionCard';
import KairosEditionNavigation from '../components/kairos-edition/KairosEditionNavigation';
import { getDailyCollection, KairosCard } from '../data/kairosEdition';
import { colors } from '../theme';

const HEADER_HEIGHT = 62;
const NAV_HEIGHT = 60;

export default function KairosEditionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Coleção do dia — computada uma única vez por montagem da tela
  const cards: KairosCard[] = useMemo(() => getDailyCollection(), []);

  const cardHeight = height - insets.top - insets.bottom - HEADER_HEIGHT - NAV_HEIGHT;

  const flatListRef = useRef<FlatList<KairosCard>>(null);

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

  return (
    <SafeAreaView style={styles.safe}>
      <KairosEditionHeader
        onBack={() => router.back()}
        currentTheme={cards[currentIndex]?.theme ?? ''}
      />

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

      <KairosEditionNavigation
        current={currentIndex}
        total={cards.length}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={() => goTo(currentIndex + 1)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
});
