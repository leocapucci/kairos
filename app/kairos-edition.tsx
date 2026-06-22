import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, ViewToken, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import KairosEditionHeader from '../components/kairos-edition/KairosEditionHeader';
import KairosEditionCard from '../components/kairos-edition/KairosEditionCard';
import KairosEditionNavigation from '../components/kairos-edition/KairosEditionNavigation';
import { KAIROS_EDITION_CARDS } from '../data/kairosEdition';
import { colors } from '../theme';

const HEADER_HEIGHT = 72;
const NAV_HEIGHT = 44;

export default function KairosEditionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardHeight = height - insets.top - insets.bottom - HEADER_HEIGHT - NAV_HEIGHT;

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
      <KairosEditionHeader onBack={() => router.back()} />

      <FlatList
        data={KAIROS_EDITION_CARDS}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        renderItem={({ item, index }) => (
          <KairosEditionCard
            card={item}
            index={index}
            total={KAIROS_EDITION_CARDS.length}
            cardWidth={width}
            cardHeight={cardHeight}
          />
        )}
        style={styles.list}
      />

      <KairosEditionNavigation
        total={KAIROS_EDITION_CARDS.length}
        current={currentIndex}
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
