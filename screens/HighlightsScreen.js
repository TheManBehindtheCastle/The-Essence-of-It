import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import MashrabiyaDivider from '../components/MashrabiyaDivider';

// ======================================================================
// Reusable Card Components
// ======================================================================

const FeaturedCard = ({ item, type, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={() => onPress(item)}>
    <View style={styles.featuredCardHeader}>
      <View style={[styles.featuredCardType, type === 'dispatch' ? styles.dispatchType : styles.manuscriptType]}>
        <Text style={styles.featuredCardTypeText}>
          {type === 'dispatch' ? '📄 DISPATCH' : '📖 MANUSCRIPT'}
        </Text>
      </View>
      <Text style={styles.featuredCardTitle} numberOfLines={2}>
        {item.title || item.heading}
      </Text>
      <Text style={styles.featuredCardMeta}>
        {type === 'dispatch' ? item.heading : `by ${item.author}`}
      </Text>
    </View>
    <View style={styles.featuredCardFooter}>
      <Text style={styles.featuredCardPreview} numberOfLines={3}>
        {type === 'dispatch' ? item.body : item.blurb}
      </Text>
    </View>
  </TouchableOpacity>
);

const TopicCarouselCard = ({ subject, dispatches, manuscripts, navigation }) => {
  // Combine first two items from each (total up to 4)
  const previewItems = [
    ...dispatches.slice(0, 2).map(d => ({ ...d, type: 'dispatch' })),
    ...manuscripts.slice(0, 2).map(m => ({ ...m, type: 'manuscript' })),
  ].slice(0, 4); // max 4 items

  return (
    <TouchableOpacity
      style={styles.topicCard}
      onPress={() => navigation.navigate('Topic', { subjectId: subject.id, title: subject.name })}
    >
      <Text style={styles.topicName}>{subject.name}</Text>
      <Text style={styles.topicField}>{subject.field}</Text>
      <View style={styles.topicPreview}>
        {previewItems.map((item, idx) => (
          <Text key={idx} style={styles.topicPreviewText} numberOfLines={1}>
            {item.type === 'dispatch' ? '📄' : '📖'} {item.title || item.heading}
          </Text>
        ))}
      </View>
      <Text style={styles.topicMore}>Tap to explore →</Text>
    </TouchableOpacity>
  );
};

const RecentDispatchItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.recentItem} onPress={() => onPress(item)}>
    <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title}</Text>
    <Text style={styles.recentItemMeta} numberOfLines={1}>{item.heading}</Text>
  </TouchableOpacity>
);

const RecentManuscriptItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.recentItem} onPress={() => onPress(item)}>
    <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title}</Text>
    <Text style={styles.recentItemAuthor} numberOfLines={1}>by {item.author}</Text>
  </TouchableOpacity>
);

// ======================================================================
// Main Screen
// ======================================================================

const HighlightsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { dispatches = [], manuscripts = [], subjects = [] } = useRepository();
  const topicScrollRef = useRef(null);

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const scrollHeight = height - topPadding - headerHeight - carouselHeight;

  // Sort by newest
  const sortedDispatches = useMemo(
    () => [...dispatches].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [dispatches]
  );
  const sortedManuscripts = useMemo(
    () => [...manuscripts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [manuscripts]
  );

  // Featured: take top 2 of each and interleave (dispatch, manuscript, dispatch, manuscript)
  const featured = [];
  for (let i = 0; i < 2; i++) {
    if (sortedDispatches[i]) featured.push({ ...sortedDispatches[i], featuredType: 'dispatch' });
    if (sortedManuscripts[i]) featured.push({ ...sortedManuscripts[i], featuredType: 'manuscript' });
  }

  // Recent lists
  const recentDispatches = sortedDispatches.slice(0, 8);
  const recentManuscripts = sortedManuscripts.slice(0, 8);

  // Topic carousel data
  const topicItems = subjects.map((sub) => ({
    subject: sub,
    dispatches: dispatches.filter((d) => d.subjectId === sub.id),
    manuscripts: manuscripts.filter((m) => m.subjectId === sub.id),
  }));

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <AppHeader title="HIGHLIGHTS" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Highlights" />
      <View style={[styles.scrollWrapper, { height: scrollHeight }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Al‑Khalasa</Text>
            <Text style={styles.heroSubtitle}>The Essence of Knowledge</Text>
            <MashrabiyaDivider />
          </View>

          {/* Featured Section – Vertical Stack */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured</Text>
            {featured.map((item) => (
              <FeaturedCard
                key={item.id}
                item={item}
                type={item.featuredType}
                onPress={() => navigation.navigate(
                  item.featuredType === 'dispatch' ? 'DispatchReader' : 'ManuscriptReader',
                  { item }
                )}
              />
            ))}
          </View>

          {/* Topic Carousel – Horizontal Scroll */}
          <View style={styles.topicSection}>
            <Text style={styles.sectionTitle}>Browse by Topic</Text>
            <FlatList
              ref={topicScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={topicItems}
              keyExtractor={(item) => item.subject.id}
              renderItem={({ item }) => (
                <TopicCarouselCard
                  subject={item.subject}
                  dispatches={item.dispatches}
                  manuscripts={item.manuscripts}
                  navigation={navigation}
                />
              )}
              contentContainerStyle={styles.topicCarouselContent}
              snapToInterval={300} // approximate card width + gap
              decelerationRate="fast"
            />
          </View>

          {/* Recent Section – Two Columns with Divider */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recents</Text>
            <View style={styles.recentRow}>
              {/* Left Column – Dispatches */}
              <View style={styles.recentColumn}>
                <Text style={styles.recentColumnTitle}>Dispatches</Text>
                <View style={styles.recentList}>
                  {recentDispatches.map((d) => (
                    <RecentDispatchItem
                      key={d.id}
                      item={d}
                      onPress={() => navigation.navigate('DispatchReader', { item: d })}
                    />
                  ))}
                </View>
              </View>

              {/* Vertical Divider */}
              <View style={styles.verticalDivider} />

              {/* Right Column – Manuscripts */}
              <View style={styles.recentColumn}>
                <Text style={styles.recentColumnTitle}>Manuscripts</Text>
                <View style={styles.recentList}>
                  {recentManuscripts.map((m) => (
                    <RecentManuscriptItem
                      key={m.id}
                      item={m}
                      onPress={() => navigation.navigate('ManuscriptReader', { item: m })}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

// ======================================================================
// Styles
// ======================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.parchment,
  },
  scrollWrapper: {
    width: '100%',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.onyx,
    textAlign: 'center',
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: THEME.gold,
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.onyx,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
    paddingBottom: 4,
  },
  // Featured
  featuredSection: {
    marginBottom: 30,
  },
  featuredCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredCardHeader: {
    marginBottom: 10,
  },
  featuredCardType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  dispatchType: {
    backgroundColor: THEME.charcoal,
  },
  manuscriptType: {
    backgroundColor: THEME.gold,
  },
  featuredCardTypeText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.parchment,
    letterSpacing: 0.5,
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.onyx,
    marginBottom: 4,
  },
  featuredCardMeta: {
    fontSize: 12,
    color: THEME.muted,
    fontStyle: 'italic',
  },
  featuredCardFooter: {
    borderTopWidth: 1,
    borderTopColor: THEME.subtle,
    paddingTop: 10,
  },
  featuredCardPreview: {
    fontSize: 13,
    color: THEME.text,
    lineHeight: 18,
  },
  // Topic Carousel
  topicSection: {
    marginBottom: 30,
  },
  topicCarouselContent: {
    paddingRight: 20,
  },
  topicCard: {
    width: 280,
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: THEME.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topicName: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.onyx,
  },
  topicField: {
    fontSize: 12,
    color: THEME.gold,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  topicPreview: {
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.subtle,
  },
  topicPreviewText: {
    fontSize: 12,
    color: THEME.text,
    marginVertical: 2,
  },
  topicMore: {
    fontSize: 11,
    color: THEME.gold,
    fontWeight: '700',
    textAlign: 'right',
  },
  // Recent Section
  recentSection: {
    marginTop: 10,
  },
  recentRow: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.subtle,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentColumn: {
    flex: 1,
    padding: 12,
  },
  recentColumnTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.gold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentList: {
    // no extra styling
  },
  recentItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.subtle,
  },
  recentItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.onyx,
  },
  recentItemMeta: {
    fontSize: 11,
    color: THEME.muted,
    marginTop: 2,
  },
  recentItemAuthor: {
    fontSize: 11,
    color: THEME.gold,
    marginTop: 2,
    fontStyle: 'italic',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: THEME.subtle,
    marginVertical: 8,
  },
});

export default HighlightsScreen;