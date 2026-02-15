import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { useRepository } from '../context/RepositoryContext';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';

const ManuscriptReader = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { item } = route.params;
  const { deleteManuscript } = useRepository();
  const [selectedTreatiseIndex, setSelectedTreatiseIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [subheadings, setSubheadings] = useState([]);
  const [headingPositions, setHeadingPositions] = useState({});

  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const scrollHeight = height - topPadding - headerHeight - carouselHeight;

  const treatises = item?.treatises || [];
  const attachments = item?.attachments || [];

  useEffect(() => {
    setSelectedTreatiseIndex(0);
    setSubheadings([]);
    setHeadingPositions({});
  }, [treatises.length]);

  useMemo(() => {
    if (!treatises[selectedTreatiseIndex]?.content) return;
    const lines = treatises[selectedTreatiseIndex].content.split('\n');
    const headings = [];
    lines.forEach((line, index) => {
      if (line.trim().startsWith('## ')) {
        headings.push({ text: line.trim().substring(3), lineIndex: index });
      }
    });
    setSubheadings(headings);
    setHeadingPositions({});
  }, [treatises, selectedTreatiseIndex]);

  const handleHeadingLayout = (index, event) => {
    const { y } = event.nativeEvent.layout;
    setHeadingPositions((prev) => ({ ...prev, [index]: y }));
  };

  const scrollToHeading = (lineIndex) => {
    const y = headingPositions[lineIndex];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  };

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Manuscript', `Permanently remove "${item?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          navigation.goBack();
          await deleteManuscript(item.id);
        },
      },
    ]);
  }, [item, deleteManuscript, navigation]);

  const openAttachment = async (uri) => {
    try {
      const supported = await Linking.canOpenURL(uri);
      if (supported) await Linking.openURL(uri);
      else Alert.alert('Cannot open file', 'No app found to open this file type.');
    } catch (error) {
      Alert.alert('Error', 'Failed to open file.');
    }
  };

  if (!item) return null;

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ CLOSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LibrisEditor', { initialItem: item })}
            style={styles.editBtn}
          >
            <Text style={styles.editText}>✎ EDIT</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>MANUSCRIPT FOLIO</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>🗑 DELETE</Text>
        </TouchableOpacity>
      </View>

      <TopicNavCarousel navigation={navigation} currentScreen="ManuscriptReader" />

      <View style={[styles.scrollWrapper, { height: scrollHeight }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.metaBox}>
            <Text style={styles.readerTitleLarge}>{item.title}</Text>
            <Text style={styles.readerAuthor}>By {item.author}</Text>
            <View style={styles.dividerWide} />
            <Text style={styles.metaLabel}>FULL BLURB</Text>
            <Text style={styles.metaText}>{item.blurb}</Text>
            <Text style={styles.metaLabel}>COMPREHENSIVE SUMMARY</Text>
            <Text style={styles.metaText}>{item.summary}</Text>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>ATTACHMENTS</Text>
              {attachments.map((att, index) => (
                <TouchableOpacity key={index} style={styles.attachmentItem} onPress={() => openAttachment(att.uri)}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <Text style={styles.attachmentMeta}>{(att.size / 1024).toFixed(1)} KB</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {treatises.length > 0 && (
            <>
              <View style={styles.treatiseNavContainer}>
                <Text style={styles.treatiseNavTitle}>TREATISES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.treatiseScroll}>
                  {treatises.map((t, index) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.treatisePill, index === selectedTreatiseIndex && styles.treatisePillActive]}
                      onPress={() => setSelectedTreatiseIndex(index)}
                    >
                      <Text
                        style={[
                          styles.treatisePillText,
                          index === selectedTreatiseIndex && styles.treatisePillTextActive,
                        ]}
                      >
                        {t.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.treatiseContentContainer}>
                <Text style={styles.treatiseTitle}>{treatises[selectedTreatiseIndex]?.title}</Text>
                {subheadings.length > 0 && (
                  <View style={styles.tocContainer}>
                    <Text style={styles.tocTitle}>CONTENTS</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tocScroll}>
                      {subheadings.map((h, i) => (
                        <TouchableOpacity key={i} style={styles.tocItem} onPress={() => scrollToHeading(h.lineIndex)}>
                          <Text style={styles.tocItemText}>{h.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.treatiseScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {treatises[selectedTreatiseIndex]?.content?.split('\n').map((line, idx) => {
                    if (line.trim().startsWith('## ')) {
                      return (
                        <Text key={idx} style={styles.subheading} onLayout={(e) => handleHeadingLayout(idx, e)}>
                          {line.trim().substring(3)}
                        </Text>
                      );
                    }
                    return (
                      <Text key={idx} style={styles.readerBody}>
                        {line}
                      </Text>
                    );
                  })}
                  <View style={styles.ender}>
                    <Text style={styles.enderText}>FINIS</Text>
                  </View>
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.parchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: THEME.onyx,
    borderBottomWidth: 2,
    borderBottomColor: THEME.gold,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: THEME.parchment, borderRadius: 4 },
  closeText: { fontSize: 10, fontWeight: '900', color: THEME.parchment },
  editBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: THEME.gold, borderRadius: 4 },
  editText: { fontSize: 10, fontWeight: '900', color: THEME.onyx },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#8B0000', borderRadius: 4 },
  deleteText: { fontSize: 10, fontWeight: '900', color: THEME.parchment },
  headerTitle: { fontSize: 10, fontWeight: '900', color: THEME.gold, letterSpacing: 2 },
  scrollWrapper: { width: '100%' },
  content: { paddingBottom: 50 },
  metaBox: { backgroundColor: THEME.white, padding: 20, borderWidth: 1, borderColor: THEME.subtle, marginBottom: 20 },
  readerTitleLarge: { fontSize: 28, fontWeight: '900', color: THEME.onyx, textAlign: 'center' },
  readerAuthor: { fontSize: 12, color: '#666', fontStyle: 'italic', textAlign: 'center', marginBottom: 20 },
  dividerWide: { width: '100%', height: 1, backgroundColor: THEME.subtle, marginVertical: 20 },
  metaLabel: { fontSize: 8, fontWeight: '900', color: '#BBB', marginBottom: 5 },
  metaText: { fontSize: 13, color: THEME.onyx, lineHeight: 20, marginBottom: 20 },
  attachmentsContainer: { marginBottom: 30, paddingHorizontal: 20 },
  attachmentsTitle: { fontSize: 12, fontWeight: '900', color: THEME.gold, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  attachmentItem: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentName: { fontSize: 14, fontWeight: '600', color: THEME.onyx, flex: 1 },
  attachmentMeta: { fontSize: 10, color: THEME.muted, marginLeft: 8 },
  treatiseNavContainer: { paddingHorizontal: 20, marginBottom: 15 },
  treatiseNavTitle: { fontSize: 9, fontWeight: '900', color: THEME.gold, marginBottom: 8, textTransform: 'uppercase' },
  treatiseScroll: { flexDirection: 'row' },
  treatisePill: {
    backgroundColor: THEME.charcoal,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  treatisePillActive: { backgroundColor: THEME.gold, borderColor: THEME.gold },
  treatisePillText: { color: THEME.parchment, fontSize: 11, fontWeight: '600' },
  treatisePillTextActive: { color: THEME.onyx, fontWeight: '800' },
  treatiseContentContainer: { flex: 1, paddingHorizontal: 20 },
  treatiseTitle: { fontSize: 20, fontWeight: '900', color: THEME.onyx, marginBottom: 15 },
  tocContainer: {
    backgroundColor: THEME.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: THEME.subtle,
    marginBottom: 20,
  },
  tocTitle: { fontSize: 8, fontWeight: '900', color: THEME.gold, marginBottom: 6, textTransform: 'uppercase' },
  tocScroll: { flexDirection: 'row' },
  tocItem: { backgroundColor: THEME.charcoal, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 10 },
  tocItemText: { color: THEME.parchment, fontSize: 10, fontWeight: '600' },
  treatiseScrollView: { maxHeight: 400 },
  subheading: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.onyx,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.gold,
    paddingBottom: 5,
  },
  readerBody: { fontSize: 16, lineHeight: 28, color: THEME.text, marginBottom: 20 },
  ender: { alignItems: 'center', marginVertical: 40 },
  enderText: { color: THEME.gold, fontSize: 14, letterSpacing: 4 },
});

export default ManuscriptReader;