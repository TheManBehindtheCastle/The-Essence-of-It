import React, { useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';

const DispatchReader = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { item } = route.params;
  const { deleteDispatch } = useRepository();
  const scrollViewRef = useRef(null);
  const [subheadings, setSubheadings] = useState([]);
  const [headingPositions, setHeadingPositions] = useState({});

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const scrollHeight = height - topPadding - headerHeight - carouselHeight;

  useMemo(() => {
    if (!item?.body) return;
    const lines = item.body.split('\n');
    const headings = [];
    lines.forEach((line, index) => {
      if (line.trim().startsWith('## ')) {
        headings.push({ text: line.trim().substring(3), lineIndex: index });
      }
    });
    setSubheadings(headings);
    setHeadingPositions({});
  }, [item]);

  const handleHeadingLayout = (index, event) => {
    const { y } = event.nativeEvent.layout;
    setHeadingPositions((prev) => ({ ...prev, [index]: y }));
  };

  const scrollToHeading = (lineIndex) => {
    const y = headingPositions[lineIndex];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Dispatch', `Permanently remove "${item?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          navigation.goBack();
          await deleteDispatch(item.id);
        },
      },
    ]);
  }, [item, deleteDispatch, navigation]);

  if (!item) return null;

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LibrisEditor', { initialItem: item })}
            style={styles.editBtn}
          >
            <Text style={styles.editText}>✎ EDIT</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>DISPATCH ENTRY</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑 DELETE</Text>
        </TouchableOpacity>
      </View>

      <TopicNavCarousel navigation={navigation} currentScreen="DispatchReader" />

      {subheadings.length > 0 && (
        <View style={styles.tocContainer}>
          <Text style={styles.tocTitle}>CONTENTS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tocScroll}>
            {subheadings.map((h, i) => (
              <TouchableOpacity key={i} style={styles.tocItem} onPress={() => scrollToHeading(h.lineIndex)}>
                <Text style={styles.tocItemText}>{h.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.scrollWrapper, { height: scrollHeight }]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.heading}>{item.heading}</Text>
          <View style={styles.divider} />
          {item.body?.split('\n').map((line, idx) => {
            if (line.trim().startsWith('## ')) {
              return (
                <Text key={idx} style={styles.subheading} onLayout={(e) => handleHeadingLayout(idx, e)}>
                  {line.trim().substring(3)}
                </Text>
              );
            }
            return (
              <Text key={idx} style={styles.bodyText}>
                {line}
              </Text>
            );
          })}
          <View style={styles.ender}>
            <Text style={styles.enderText}>❦</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.parchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: THEME.onyx,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: THEME.parchment, borderRadius: 4 },
  closeText: { fontSize: 10, fontWeight: '900', color: THEME.parchment },
  editBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: THEME.gold, borderRadius: 4 },
  editText: { fontSize: 10, fontWeight: '900', color: THEME.onyx },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#8B0000', borderRadius: 4 },
  deleteText: { fontSize: 10, fontWeight: '900', color: THEME.parchment },
  headerTitle: { fontSize: 10, fontWeight: '900', color: THEME.gold, letterSpacing: 2 },
  tocContainer: { backgroundColor: THEME.white, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: THEME.subtle },
  tocTitle: { fontSize: 8, fontWeight: '900', color: THEME.gold, marginBottom: 6, textTransform: 'uppercase' },
  tocScroll: { flexDirection: 'row' },
  tocItem: { backgroundColor: THEME.charcoal, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 10 },
  tocItemText: { color: THEME.parchment, fontSize: 10, fontWeight: '600' },
  scrollWrapper: { width: '100%' },
  content: { padding: 30, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: '900', color: THEME.onyx, marginBottom: 8 },
  heading: { fontSize: 12, fontWeight: '900', color: THEME.gold, textTransform: 'uppercase', marginBottom: 20 },
  divider: { width: 40, height: 2, backgroundColor: THEME.onyx, marginBottom: 20 },
  subheading: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.onyx,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.gold,
    paddingBottom: 5,
  },
  bodyText: { fontSize: 16, lineHeight: 28, color: THEME.text, marginBottom: 20 },
  ender: { alignItems: 'center', marginVertical: 40 },
  enderText: { color: THEME.gold, fontSize: 14, letterSpacing: 4 },
});

export default DispatchReader;