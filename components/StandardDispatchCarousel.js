import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import InteractiveDots from './InteractiveDots';

const StandardDispatchCarousel = React.memo(({ items, onPress }) => {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const WIDTH = 260;
  const GAP = 15;
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
        contentContainerStyle={{ gap: GAP }}
        snapToInterval={SNAP}
        decelerationRate="fast"
      >
        {items.map((item, i) => (
          <TouchableOpacity key={`${item.id}-${i}`} onPress={() => onPress(item)} style={[styles.card, { width: WIDTH }]}>
            <Text style={styles.heading}>{item.heading}</Text>
            <Text style={styles.body} numberOfLines={4}>
              {item.body}
            </Text>
            <Text style={styles.trail}>Read Full Essay ➝</Text>
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
    padding: 20,
    backgroundColor: THEME.onyx,
    borderWidth: 1,
    borderColor: '#333',
  },
  heading: { fontSize: 10, fontWeight: '900', color: THEME.gold, marginBottom: 10 },
  body: { fontSize: 11, color: '#DDD', fontStyle: 'italic', lineHeight: 18 },
  trail: { color: THEME.gold, marginTop: 10, fontSize: 9, fontWeight: 'bold' },
});

export default StandardDispatchCarousel;