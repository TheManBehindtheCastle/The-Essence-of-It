import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import MashrabiyaDivider from '../components/MashrabiyaDivider';

const PointsOfInterestScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { points } = useRepository();
  const [expandedId, setExpandedId] = useState(null);

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const listHeight = height - topPadding - headerHeight - carouselHeight;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => alert('Could not open link'));
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.cardContent}>
            <Text style={styles.bio}>{item.description}</Text>
            <MashrabiyaDivider />
            <Text style={styles.linksTitle}>Links</Text>
            {item.links && item.links.map((link, i) => (
              <TouchableOpacity key={i} onPress={() => openLink(link.url)} style={styles.linkButton}>
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Text style={styles.linkArrow}>➝</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <AppHeader title="POINTS OF INTEREST" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="PointsOfInterest" />
      <View style={[styles.listWrapper, { height: listHeight }]}>
        <FlatList
          data={points}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No points of interest yet.</Text>
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
  card: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.charcoal,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: THEME.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  expandIcon: { fontSize: 20, fontWeight: '900', color: THEME.gold },
  cardContent: { padding: 16 },
  bio: { fontSize: 14, lineHeight: 22, color: THEME.text, marginBottom: 16 },
  linksTitle: { fontSize: 12, fontWeight: '900', color: THEME.gold, marginBottom: 8, textTransform: 'uppercase' },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.subtle,
  },
  linkLabel: { fontSize: 14, color: THEME.onyx },
  linkArrow: { fontSize: 14, color: THEME.gold },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: THEME.muted, fontStyle: 'italic' },
});

export default PointsOfInterestScreen;