import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import InteractiveDots from './InteractiveDots';

const CompactManuscriptRail = React.memo(({ items, onPress }) => {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const WIDTH = 140;
  const GAP = 10;
  const SNAP = WIDTH + GAP;

  useEffect(() => {
    setActive(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [items.length]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setActive(Math.round(x / SNAP));
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: GAP, paddingHorizontal: 2 }}
        snapToInterval={SNAP}
        decelerationRate="fast"
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={`${item.id}-${i}`} // force remount on change
            onPress={() => onPress(item)}
            style={[styles.card, { width: WIDTH }]}
          >
            <View style={styles.spine} />
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.author}>{item.author}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <InteractiveDots
        total={items.length}
        active={active}
        onPagePress={(p) => scrollRef.current?.scrollTo({ x: p * SNAP, animated: true })}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  card: {
    backgroundColor: THEME.white,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.subtle,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spine: { width: 30, height: 2, backgroundColor: THEME.gold, marginBottom: 10 },
  title: { fontSize: 10, fontWeight: '900', textAlign: 'center', color: THEME.onyx },
  author: { fontSize: 8, color: THEME.muted, fontStyle: 'italic' },
});

export default CompactManuscriptRail;