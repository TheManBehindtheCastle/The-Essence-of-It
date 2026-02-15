import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { SEGMENTS } from '../constants/segments';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import MashrabiyaDivider from '../components/MashrabiyaDivider';
import CompactDispatchRail from '../components/CompactDispatchRail';
import CompactManuscriptRail from '../components/CompactManuscriptRail';
import StandardDispatchCarousel from '../components/StandardDispatchCarousel';
import StandardManuscriptCarousel from '../components/StandardManuscriptCarousel';

const TopicScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { subjectId } = route.params;
  const { subjects, dispatches, manuscripts, refreshKey } = useRepository();

  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => setRefresh((v) => v + 1), []));

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const scrollHeight = height - topPadding - headerHeight - carouselHeight;

  const subject = useMemo(
    () => subjects.find((s) => s?.id === subjectId),
    [subjects, subjectId, refreshKey, refresh]
  );

  const subDispatches = useMemo(
    () => dispatches.filter((d) => d.subjectId === subjectId),
    [dispatches, subjectId, refreshKey, refresh]
  );
  const subManuscripts = useMemo(
    () => manuscripts.filter((m) => m.subjectId === subjectId),
    [manuscripts, subjectId, refreshKey, refresh]
  );

  const segments = useMemo(
    () =>
      SEGMENTS.map((seg) => ({
        ...seg,
        dispatches: subDispatches.filter((d) => d.segmentId === seg.id),
        manuscripts: subManuscripts.filter((m) => m.segmentId === seg.id),
      })),
    [subDispatches, subManuscripts, refreshKey, refresh]
  );

  if (!subject) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="AL-KHALASA" showBack />
        <TopicNavCarousel navigation={navigation} currentScreen="Topic" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Topic not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={subject.name} showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Topic" />
      <View style={[styles.scrollWrapper, { height: scrollHeight }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleSection}>
            <Text style={styles.arabicHeading}>{subject.name}</Text>
            <Text style={styles.englishHeading}>{subject.field}</Text>
            <Text style={styles.metaHeading}>
              {subject.era} Zenith • Question: "{subject.question || 'How does knowledge endure?'}"
            </Text>
            <MashrabiyaDivider />
            <Text style={styles.mainQuestion}>
              "{subject.question || 'How does the preservation of knowledge illuminate the modern seeker?'}"
            </Text>
          </View>

          <View style={styles.generalBelt}>
            <Text style={styles.beltTitle}>General Dispatches</Text>
            <CompactDispatchRail
              key={`dispatch-${subDispatches.length}`}
              items={subDispatches.slice(0, 6)}
              onPress={(item) => navigation.navigate('DispatchReader', { item })}
            />
            <View style={{ height: 20 }} />
            <Text style={styles.beltTitle}>General Manuscripts</Text>
            <CompactManuscriptRail
              key={`manuscript-${subManuscripts.length}`}
              items={subManuscripts.slice(0, 6)}
              onPress={(item) => navigation.navigate('ManuscriptReader', { item })}
            />
          </View>

          <View style={styles.stackedTopics}>
            {segments.map((seg) => (
              <View key={seg.id} style={styles.topicStack}>
                <View style={styles.topicTextContent}>
                  <Text style={styles.topicLabel}>{seg.label}</Text>
                  <Text style={styles.topicValue}>{seg.value}</Text>
                </View>
                <View style={styles.assetColumns}>
                  <Text style={styles.assetSubHeader}>Core Manuscripts</Text>
                  <StandardManuscriptCarousel
                    key={`${seg.id}-ms-${seg.manuscripts.length}`}
                    items={seg.manuscripts}
                    onPress={(item) => navigation.navigate('ManuscriptReader', { item })}
                  />
                  <Text style={styles.assetSubHeader}>Topic Dispatches</Text>
                  <StandardDispatchCarousel
                    key={`${seg.id}-disp-${seg.dispatches.length}`}
                    items={seg.dispatches}
                    onPress={(item) => navigation.navigate('DispatchReader', { item })}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.parchment },
  scrollWrapper: { width: '100%' },
  scrollContent: { paddingVertical: 30, paddingHorizontal: 16 },
  titleSection: { alignItems: 'center', marginBottom: 40 },
  arabicHeading: { fontSize: 48, color: THEME.onyx, marginBottom: 8 },
  englishHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -5,
  },
  metaHeading: { fontSize: 10, color: '#AAA', marginTop: 8, textTransform: 'uppercase' },
  mainQuestion: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: THEME.text,
    paddingHorizontal: 20,
    lineHeight: 28,
    marginTop: 10,
  },
  generalBelt: {
    backgroundColor: THEME.white,
    paddingVertical: 25,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.subtle,
    marginBottom: 30,
  },
  beltTitle: { fontSize: 8, fontWeight: '900', color: THEME.gold, marginLeft: 20, textTransform: 'uppercase', marginBottom: 15 },
  stackedTopics: { gap: 30 },
  topicStack: {
    backgroundColor: THEME.white,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderLeftWidth: 5,
    borderLeftColor: THEME.onyx,
  },
  topicTextContent: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F7F7F7', paddingBottom: 12 },
  topicLabel: { fontSize: 8, fontWeight: '900', color: '#BBB', textTransform: 'uppercase' },
  topicValue: { fontSize: 14, color: THEME.onyx, fontWeight: '700' },
  assetColumns: { gap: 20 },
  assetSubHeader: { fontSize: 9, fontWeight: '900', color: THEME.gold, textTransform: 'uppercase', marginBottom: 8 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: THEME.muted },
});

export default TopicScreen;