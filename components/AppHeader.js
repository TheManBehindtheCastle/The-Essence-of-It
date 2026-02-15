import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';

const AppHeader = ({ title = 'AL-KHALASA', showBack = false, onBack, hideNavLinks = false }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) onBack();
    else navigation.goBack();
  };

  const openTopics = () => navigation.navigate('TopicsList');
  const openLibris = () => navigation.navigate('LibrisEditor');
  const openArchive = () => navigation.navigate('Archive');
  const openSearch = () => navigation.navigate('Search');
  const openPortfolio = () => navigation.navigate('Portfolio');
  const openPoints = () => navigation.navigate('Points');
  const openHighlights = () => navigation.navigate('Highlights');
  const openFiction = () => navigation.navigate('Fiction');

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={THEME.onyx} />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.leftContainer}>
            {showBack && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.logo}>{title}</Text>
          </View>
          {!hideNavLinks && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollLinks}>
              <View style={styles.rightContainer}>
                <TouchableOpacity onPress={openHighlights} style={styles.navLink}>
                  <Text style={styles.navLinkText}>HIGHLIGHTS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openFiction} style={styles.navLink}>
                  <Text style={styles.navLinkText}>FICTION</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openTopics} style={styles.navLink}>
                  <Text style={styles.navLinkText}>TOPICS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openLibris} style={styles.navLink}>
                  <Text style={styles.navLinkText}>LIBRIS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openArchive} style={styles.navLink}>
                  <Text style={styles.navLinkText}>ARCHIVE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openSearch} style={styles.navLink}>
                  <Text style={styles.navLinkText}>SEARCH</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openPortfolio} style={styles.navLink}>
                  <Text style={styles.navLinkText}>PORTFOLIO</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openPoints} style={styles.navLink}>
                  <Text style={styles.navLinkText}>POINTS</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </>
  );
};

export const getHeaderHeight = () => Platform.OS === 'web' ? 60 : 56;

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.onyx,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: getHeaderHeight(),
  },
  leftContainer: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12, padding: 4 },
  backText: { color: THEME.gold, fontSize: 24, fontWeight: '900' },
  logo: { color: THEME.parchment, fontSize: 14, fontWeight: '900', letterSpacing: 4 },
  scrollLinks: { flex: 1, marginLeft: 10 },
  rightContainer: { flexDirection: 'row', gap: 16, paddingRight: 16 },
  navLink: { paddingVertical: 6, paddingHorizontal: 8 },
  navLinkText: { color: '#AAA', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});

export default AppHeader;