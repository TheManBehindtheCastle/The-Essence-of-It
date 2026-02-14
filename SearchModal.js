import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';

const SearchModal = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { dispatches, manuscripts, refreshKey } = useRepository();
  const [query, setQuery] = useState('');

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const inputHeight = 80;
  const topPadding = insets.top;
  const listHeight = height - topPadding - headerHeight - carouselHeight - inputHeight;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    const d = dispatches
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(lower) ||
          item.heading?.toLowerCase().includes(lower) ||
          item.body?.toLowerCase().includes(lower) ||
          item.id?.toLowerCase().includes(lower)
      )
      .map((item) => ({ ...item, resultType: 'dispatch' }));
    const m = manuscripts
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(lower) ||
          item.author?.toLowerCase().includes(lower) ||
          item.blurb?.toLowerCase().includes(lower) ||
          item.summary?.toLowerCase().includes(lower) ||
          (item.treatises && item.treatises.some((t) => t.content?.toLowerCase().includes(lower))) ||
          item.id?.toLowerCase().includes(lower)
      )
      .map((item) => ({ ...item, resultType: 'manuscript' }));
    return [...d, ...m];
  }, [query, dispatches, manuscripts, refreshKey]);

  const handleSelect = (item) => {
    navigation.navigate(item.resultType === 'dispatch' ? 'DispatchReader' : 'ManuscriptReader', { item });
  };

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <AppHeader title="SEARCH" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Search" />
      <View style={[styles.inputContainer, { height: inputHeight }]}>
        <TextInput
          style={styles.input}
          placeholder="Search by title, author, content..."
          placeholderTextColor={THEME.muted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>
      <View style={[styles.listWrapper, { height: listHeight }]}>
        <FlatList
          key={`results-${results.length}`}
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query.trim() ? 'No matching entries found.' : 'Enter a search term above.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultEntry} onPress={() => handleSelect(item)}>
              <View style={styles.resultMeta}>
                <Text style={styles.resultTypeBadge}>{item.resultType === 'dispatch' ? '📜' : '📖'}</Text>
                <Text style={styles.resultId}>{item.id}</Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {item.title || item.heading}
                </Text>
                <Text style={styles.resultSub} numberOfLines={1}>
                  {item.resultType === 'dispatch' ? item.heading : item.author}
                </Text>
              </View>
              <Text style={styles.resultArrow}>➝</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.onyx },
  inputContainer: { justifyContent: 'center', paddingHorizontal: 20 },
  input: {
    backgroundColor: THEME.white,
    padding: 12,
    fontSize: 16,
    color: THEME.text,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 4,
  },
  listWrapper: { width: '100%' },
  listContent: { padding: 15, gap: 10 },
  resultEntry: {
    flexDirection: 'row',
    backgroundColor: THEME.charcoal,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  resultMeta: { width: 70, flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultTypeBadge: { color: THEME.gold, fontSize: 16 },
  resultId: { color: '#777', fontSize: 8, flexShrink: 1 },
  resultContent: { flex: 1, paddingHorizontal: 15 },
  resultTitle: { color: THEME.parchment, fontSize: 12, fontWeight: '700' },
  resultSub: { color: '#777', fontSize: 10, fontStyle: 'italic' },
  resultArrow: { color: '#444', fontSize: 14 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: THEME.muted, fontSize: 14, fontStyle: 'italic' },
});

export default SearchModal;