import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const InteractiveDots = React.memo(({ total, active, onPagePress, perPage = 1 }) => {
  const count = Math.ceil(total / perPage);
  if (count <= 1) return null;

  return (
    <View style={styles.dotTrack}>
      {Array.from({ length: count }).map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onPagePress(i)}
          style={styles.dotTouch}
          accessibilityLabel={`Page ${i + 1} of ${count}`}
          accessibilityRole="button"
        >
          <View style={[styles.dotBase, i === active && styles.dotActive]} />
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  dotTrack: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 8 },
  dotTouch: { padding: 4 },
  dotBase: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.subtle },
  dotActive: { backgroundColor: THEME.gold, width: 8, height: 8, borderRadius: 4 },
});

export default InteractiveDots;