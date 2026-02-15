import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import InteractiveDots from './InteractiveDots';
import { getHeaderHeight } from './AppHeader';

const TOPICS_PER_PAGE = 8;
const CAROUSEL_HEIGHT = 80; // fixed height, no flex

const TopicNavCarousel = ({ navigation, currentScreen }) => {
  const { subjects, refreshKey } = useRepository(); // refreshKey forces re-render
  const scrollRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const topicList = useMemo(() => subjects.filter(Boolean), [subjects, refreshKey]);

  const totalPages = Math.ceil(topicList.length / TOPICS_PER_PAGE);

  useEffect(() => {
    setActivePage(0);
    if (scrollRef.current && containerWidth > 0) {
      scrollRef.current.scrollTo({ x: 0, animated: false });
    }
  }, [topicList.length, containerWidth]);

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const w = e.nativeEvent.layoutMeasurement.width;
    setContainerWidth(w);
    const newPage = Math.round(x / w);
    if (newPage !== activePage) setActivePage(newPage);
  };

  const scrollToPage = (page) => {
    if (scrollRef.current && containerWidth > 0) {
      scrollRef.current.scrollTo({ x: page * containerWidth, animated: true });
      setActivePage(page);
    }
  };

  const navigateToTopic = (subjectId, name) => {
    if (currentScreen === 'Topic' && navigation.getParam?.('subjectId') === subjectId) return;
    navigation.navigate('Topic', { subjectId, title: name });
  };

  if (topicList.length === 0) return null;

  return (
    <View style={[styles.container, { height: CAROUSEL_HEIGHT }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <View key={pageIndex} style={[styles.pageContainer, { width: containerWidth }]}>
            {topicList
              .slice(pageIndex * TOPICS_PER_PAGE, (pageIndex + 1) * TOPICS_PER_PAGE)
              .map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicPill}
                  onPress={() => navigateToTopic(topic.id, topic.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.topicPillText}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </ScrollView>
      {totalPages > 1 && (
        <InteractiveDots
          total={topicList.length}
          active={activePage}
          perPage={TOPICS_PER_PAGE}
          onPagePress={scrollToPage}
        />
      )}
    </View>
  );
};

export const getCarouselHeight = () => CAROUSEL_HEIGHT;

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.charcoal,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
    paddingVertical: 12,
  },
  scrollView: { flexGrow: 0, height: '100%' },
  pageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    gap: 12,
  },
  topicPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  topicPillText: {
    color: THEME.gold,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default TopicNavCarousel;