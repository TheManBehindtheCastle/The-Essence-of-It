import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { getSegmentLabel } from '../utils/segmentHelper';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import { scaledFont } from '../utils/scaling';


const ArchiveVault = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { subjects, dispatches, manuscripts, refreshKey } = useRepository();
  const [activeTab, setActiveTab] = useState('manuscripts');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const tabsHeight = 50;
  const filterHeight = 60;
  const topPadding = insets.top;

  const listHeight = height - topPadding - headerHeight - carouselHeight - tabsHeight - filterHeight;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const filteredItems = useMemo(() => {
    const base = activeTab === 'manuscripts' ? manuscripts : dispatches;
    const filtered = subjectFilter === 'all' ? base : base.filter((item) => item.subjectId === subjectFilter);
    return filtered.filter(Boolean);
  }, [activeTab, subjectFilter, manuscripts, dispatches, refreshKey]);

  const numColumns = width > 600 ? 3 : 2;
  const itemWidth = (width - 64) / numColumns;

  const renderItem = ({ item }) => {
    const segmentLabel = getSegmentLabel(item.segmentId);
    const subject = subjects.find((s) => s?.id === item.subjectId);
    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: itemWidth }]}
        onPress={() => navigation.navigate(item.type === 'manuscript' ? 'ManuscriptReader' : 'DispatchReader', { item })}
        activeOpacity={0.7}
      >
        <View style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <View style={styles.gridTypeDot} />
            {subject ? (
              <TouchableOpacity onPress={() => navigation.navigate('Topic', { subjectId: subject.id, title: subject.name })}>
                <Text style={styles.gridSubject}>{item.subjectId?.toUpperCase()}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.gridSubject, styles.gridSubjectDisabled]}>
                {item.subjectId?.toUpperCase() || '—'}
              </Text>
            )}
          </View>
          <Text style={styles.gridTitle} numberOfLines={2}>
            {item.title || item.heading}
          </Text>
          <Text style={styles.gridSub} numberOfLines={1}>
            {item.type === 'manuscript' ? item.author : item.heading}
          </Text>
          {segmentLabel && <Text style={styles.gridSegment}>{segmentLabel}</Text>}
          <Text style={styles.gridId}>{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No {activeTab} found.</Text>
      <Text style={styles.emptySubtext}>
        {subjectFilter !== 'all' ? 'Try changing the filter.' : 'Add some via the Libris Editor.'}
      </Text>
    </View>
  );

  const safeSubjects = useMemo(() => subjects.filter(Boolean), [subjects, refreshKey]);

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <AppHeader title="ARCHIVE" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Archive" />
      <View style={[styles.vaultTabs, { height: tabsHeight }]}>
        {['manuscripts', 'dispatches'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.tab, activeTab === t && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.filterBarContainer, { height: filterHeight }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
          <TouchableOpacity
            onPress={() => setSubjectFilter('all')}
            style={[styles.pill, subjectFilter === 'all' && styles.pillActive]}
          >
            <Text style={[styles.pillText, subjectFilter === 'all' && styles.pillTextActive]}>ALL</Text>
          </TouchableOpacity>
          {safeSubjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSubjectFilter(s.id)}
              style={[styles.pill, subjectFilter === s.id && styles.pillActive]}
            >
              <Text style={[styles.pillText, subjectFilter === s.id && styles.pillTextActive]}>
                {s.name?.toUpperCase?.() || '—'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.listWrapper, { height: listHeight }]}>
        <FlatList
          key={`${numColumns}-${filteredItems.length}`}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.gold} />}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  root: { flex: 1, backgroundColor: THEME.onyx },
  vaultTabs: { flexDirection: 'row', backgroundColor: THEME.charcoal },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: THEME.gold },
  tabText: { color: '#666', fontSize: 10, fontWeight: '900' },
  tabTextActive: { color: THEME.gold },
  filterBarContainer: { backgroundColor: '#222', justifyContent: 'center' },
  filterBar: { paddingHorizontal: 15, gap: 10, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#333', borderRadius: 16 },
  pillActive: { backgroundColor: THEME.gold },
  pillText: { color: '#888', fontSize: 9, fontWeight: '900' },
  pillTextActive: { color: THEME.onyx },
  listWrapper: { width: '100%' },
  listContent: { padding: 16 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { padding: 4 },
  gridCard: {
    backgroundColor: THEME.charcoal,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    minHeight: 130,
  },
  gridHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  gridTypeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.gold },
  gridSubject: { color: THEME.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  gridSubjectDisabled: { color: '#666' },
  gridTitle: { color: THEME.parchment, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  gridSub: { color: '#777', fontSize: 10, fontStyle: 'italic', marginBottom: 4 },
  gridSegment: { color: THEME.gold, fontSize: 9, fontWeight: '700', marginBottom: 4 },
  gridId: { color: '#555', fontSize: 8, marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: THEME.muted, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySubtext: { color: THEME.muted, fontSize: 12, fontStyle: 'italic' },
});

export default ArchiveVault;