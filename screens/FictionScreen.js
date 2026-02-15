import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext'; // ✅ ensure this path is correct
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import StandardManuscriptCarousel from '../components/StandardManuscriptCarousel';

const FictionScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // ✅ Destructure with fallback – ensures manuscripts is always an array
  const { manuscripts = [] } = useRepository();

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const listHeight = height - topPadding - headerHeight - carouselHeight;

  // ✅ Filter and sort fiction manuscripts
  const fictionManuscripts = useMemo(
    () =>
      manuscripts
        .filter((m) => m.genre === 'Fiction')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [manuscripts]
  );

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <AppHeader title="FICTION" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Fiction" />
      <View style={[styles.listWrapper, { height: listHeight }]}>
        <FlatList
          data={fictionManuscripts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Featured Fiction</Text>
              <StandardManuscriptCarousel
                items={fictionManuscripts.slice(0, 6)}
                onPress={(item) => navigation.navigate('ManuscriptReader', { item })}
              />
              <Text style={styles.sectionTitle}>All Fiction</Text>
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('ManuscriptReader', { item })}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemAuthor}>by {item.author}</Text>
              <Text style={styles.itemBlurb} numberOfLines={2}>
                {item.blurb}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No fiction manuscripts found.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.parchment },
  listWrapper: { width: '100%' },
  listContent: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: THEME.gold, marginBottom: 12, marginTop: 8 },
  listItem: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: THEME.gold,
  },
  itemTitle: { fontSize: 16, fontWeight: '900', color: THEME.onyx, marginBottom: 4 },
  itemAuthor: { fontSize: 12, color: THEME.gold, marginBottom: 4, fontStyle: 'italic' },
  itemBlurb: { fontSize: 13, color: THEME.text, lineHeight: 18 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: THEME.muted, fontStyle: 'italic' },
});

export default FictionScreen;