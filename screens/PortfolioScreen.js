import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import MashrabiyaDivider from '../components/MashrabiyaDivider';

const PortfolioScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { portfolio } = useRepository();

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const scrollHeight = height - topPadding - headerHeight - carouselHeight;

  const { name, subtitle, about, skills = [], experience = [], education = [], contact = {} } = portfolio;

  const openLink = (url) => {
    Linking.openURL(url).catch(() => alert('Could not open link'));
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <AppHeader title="PORTFOLIO" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="Portfolio" />
      <View style={[styles.scrollWrapper, { height: scrollHeight }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.name}>{name || 'Your Name'}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <MashrabiyaDivider />
          </View>

          {about ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.text}>{about}</Text>
            </View>
          ) : null}

          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              <View style={styles.skillsGrid}>
                {skills.map((skill, i) => (
                  <View key={i} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {experience.map((exp, i) => (
                <View key={i} style={styles.timelineItem}>
                  <Text style={styles.timelineYear}>{exp.year}</Text>
                  <Text style={styles.timelineTitle}>{exp.title}</Text>
                  <Text style={styles.timelineDesc}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((edu, i) => (
                <View key={i} style={styles.timelineItem}>
                  <Text style={styles.timelineYear}>{edu.year}</Text>
                  <Text style={styles.timelineTitle}>{edu.title}</Text>
                </View>
              ))}
            </View>
          )}

          {Object.keys(contact).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {Object.entries(contact).map(([key, value]) => {
                const isUrl = typeof value === 'string' && value.match(/^https?:\/\//);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => isUrl && openLink(value)}
                    disabled={!isUrl}
                  >
                    <Text style={[styles.contactText, isUrl && styles.link]}>
                      {key}: {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.parchment },
  scrollWrapper: { width: '100%' },
  content: { padding: 20, paddingBottom: 40 },
  headerSection: { alignItems: 'center', marginBottom: 30 },
  name: { fontSize: 32, fontWeight: '900', color: THEME.onyx, textAlign: 'center' },
  subtitle: { fontSize: 14, color: THEME.gold, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.onyx,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
    paddingBottom: 4,
  },
  text: { fontSize: 14, lineHeight: 22, color: THEME.text },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillPill: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  skillText: { fontSize: 12, color: THEME.onyx, fontWeight: '600' },
  timelineItem: { marginBottom: 16 },
  timelineYear: { fontSize: 12, color: THEME.gold, fontWeight: '800', textTransform: 'uppercase' },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: THEME.onyx, marginTop: 2 },
  timelineDesc: { fontSize: 13, color: THEME.muted, marginTop: 4, lineHeight: 18 },
  contactText: { fontSize: 14, color: THEME.text, marginBottom: 8 },
  link: { color: THEME.gold, textDecorationLine: 'underline' },
});

export default PortfolioScreen;