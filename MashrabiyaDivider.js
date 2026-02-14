import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

const MashrabiyaDivider = () => (
  <View style={styles.container}>
    <View style={styles.line} />
    <Text style={styles.icon}>✦ 𐫱 ✦</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { height: 1, width: 80, backgroundColor: THEME.subtle },
  icon: { marginHorizontal: 15, color: THEME.gold, fontSize: 16 },
});

export default MashrabiyaDivider;