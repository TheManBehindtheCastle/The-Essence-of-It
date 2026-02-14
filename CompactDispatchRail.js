import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import InteractiveDots from './InteractiveDots';

const CompactDispatchRail = React.memo(({ items, onPress }) => {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const ITEM_WIDTH = 190;
  const COLUMNS = 2;
  const ROWS = 2;
  const PAGE_WIDTH = ITEM_WIDTH * COLUMNS;
  const ITEMS_PER_PAGE = COLUMNS * ROWS;

  // Force complete remount when items length changes to reset all state
  useEffect(() => {
    setActive(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [items.length]);

  const contentWidth = Math.ceil(items.length / COLUMNS) * ITEM_WIDTH;

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const newActive = Math.round(x / PAGE_WIDTH);
    if (newActive !== active) setActive(newActive);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.grid, { width: contentWidth }]}
        snapToInterval={PAGE_WIDTH}
        decelerationRate="fast"
      >
        {items.map((item, i) => (
          <TouchableOpacity key={i} onPress={() => onPress(item)} style={styles.pill}>
            <Text style={styles.icon}>❧</Text>
            <Text style={styles.text} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <InteractiveDots
        total={items.length}
        active={active}
        perPage={ITEMS_PER_PAGE}
        onPagePress={(p) => scrollRef.current?.scrollTo({ x: p * PAGE_WIDTH, animated: true })}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  grid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 100,
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    width: 190,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: THEME.parchment,
    borderWidth: 1,
    borderColor: THEME.subtle,
  },
  icon: { color: THEME.gold, marginRight: 8, fontSize: 12 },
  text: { fontSize: 9, fontWeight: '700', color: THEME.text },
});

export default CompactDispatchRail;