import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import { useWindowDimensions } from 'react-native';

const TopicsListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { subjects, refreshKey } = useRepository();

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;

  // Explicit list height: screen height - top inset - header - carousel
  const listHeight = height - topPadding - headerHeight - carouselHeight;

  const safeSubjects = useMemo(() => subjects.filter(Boolean), [subjects, refreshKey]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Topic', { subjectId: item.id, title: item.name })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.field}>{item.field}</Text>
      <Text style={styles.era}>{item.era}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <AppHeader title="AL-KHALASA" />
      <TopicNavCarousel navigation={navigation} currentScreen="TopicsList" />
      <View style={[styles.listContainer, { height: listHeight }]}>
        {safeSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No topics yet.</Text>
            <Text style={styles.emptySubtext}>Add one via the Libris Editor.</Text>
          </View>
        ) : (
          <FlatList
            data={safeSubjects}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.parchment,
  },
  listContainer: {
    // height set dynamically; no flex needed
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: THEME.onyx,
  },
  name: { fontSize: 18, fontWeight: '900', color: THEME.onyx },
  field: { fontSize: 12, color: THEME.gold, marginTop: 4, textTransform: 'uppercase' },
  era: { fontSize: 10, color: THEME.muted, marginTop: 2, fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: THEME.muted, marginBottom: 8 },
  emptySubtext: { fontSize: 12, color: THEME.muted, fontStyle: 'italic' },
});

export default TopicsListScreen;