/**
 * LibrisEditor – The primary content creation and editing screen.
 * 
 * This screen provides a tabbed interface for managing all data types:
 *   - Topics
 *   - Dispatches
 *   - Manuscripts
 *   - Portfolio (a single CV‑style object)
 *   - Points of Interest (a list of persons/places with links)
 * 
 * It consumes the RepositoryContext for data and CRUD operations.
 * Local state (`draft`) holds the current form data until saved.
 * 
 * @module LibrisEditor
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { SEGMENTS } from '../constants/segments';
import { getSegmentLabel } from '../utils/segmentHelper';
import { generateId } from '../utils/idGenerator';
import { useRepository } from '../context/RepositoryContext';
import AppHeader, { getHeaderHeight } from '../components/AppHeader';
import TopicNavCarousel, { getCarouselHeight } from '../components/TopicNavCarousel';

// ------------------------------------------------------------------------
// Default values for new items
// ------------------------------------------------------------------------
/**
 * Default empty portfolio structure.
 * To add a new field to the portfolio, add it here and update:
 *   - updatePortfolio in context (optional)
 *   - renderPortfolioForm to include the new input
 *   - PortfolioScreen to display it
 */
const DEFAULT_PORTFOLIO = {
  name: '',
  subtitle: '',
  about: '',
  skills: [],
  experience: [],
  education: [],
  contact: {},
};

/**
 * Default empty point structure.
 * To add a new field to a point, add it here and update:
 *   - addPoint/updatePoint in context (automatic if spreading)
 *   - renderPointForm to include the new input
 *   - PointsOfInterestScreen to display it
 */
const DEFAULT_POINT = {
  name: '',
  description: '',
  links: [],
};

// ------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------

/**
 * LibrisEditor – main editor screen.
 * 
 * @param {object} route – React Navigation route, may contain `initialItem` for editing.
 * @param {object} navigation – React Navigation navigation object.
 * @returns {JSX.Element}
 */
const LibrisEditor = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { initialItem } = route.params || {};

  // --------------------------------------------------------------------
  // 1. Context data – all collections are guaranteed to be arrays by the provider
  // --------------------------------------------------------------------
  const {
    subjects = [],
    dispatches = [],
    manuscripts = [],
    portfolio = DEFAULT_PORTFOLIO,
    points = [],
    addSubject,
    updateSubject,
    deleteSubject,
    addDispatch,
    updateDispatch,
    deleteDispatch,
    addManuscript,
    updateManuscript,
    deleteManuscript,
    updatePortfolio,
    addPoint,
    updatePoint,
    deletePoint,
  } = useRepository();

  // --------------------------------------------------------------------
  // 2. Local UI state
  // --------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('topics');          // current tab: topics, dispatches, manuscripts, portfolio, points
  const [editingItem, setEditingItem] = useState(null);          // the item being edited (if any)
  const [draft, setDraft] = useState({});                        // form data for the current item
  const [contactError, setContactError] = useState('');          // validation error for portfolio contact JSON
  const [refreshFlag, setRefreshFlag] = useState(0);             // forces list remount after changes (delete/add)

  // --------------------------------------------------------------------
  // 3. Effects
  // --------------------------------------------------------------------

  /**
   * When `initialItem` is provided (e.g., from a reader screen), load it into the editor.
   * This sets the correct tab and populates the draft.
   */
  useEffect(() => {
    if (initialItem) {
      // Determine which tab to open based on item type
      if (initialItem.type === 'dispatch') setActiveTab('dispatch');
      else if (initialItem.type === 'manuscript') setActiveTab('manuscript');
      else setActiveTab('topic');  // assume it's a topic
      setEditingItem(initialItem);
      setDraft(initialItem);
    } else {
      setEditingItem(null);
      setDraft({});
    }
  }, [initialItem]);

  /**
   * When entering the portfolio tab, load the current portfolio into draft and clear any errors.
   */
  useEffect(() => {
    if (activeTab === 'portfolio') {
      setDraft(portfolio);
      setContactError('');
    }
  }, [activeTab, portfolio]);

  // --------------------------------------------------------------------
  // 4. Height calculations – ensure scrollable areas have proper size
  //    These values are derived from known component heights and screen dimensions.
  //    Adjust the constants if header/carousel heights change.
  // --------------------------------------------------------------------
  const headerHeight = getHeaderHeight();
  const carouselHeight = getCarouselHeight();
  const topPadding = insets.top;
  const tabsHeight = 50;
  const addButtonHeight = 60;
  const listAvailableHeight =
    height -
    topPadding -
    headerHeight -
    carouselHeight -
    tabsHeight -
    addButtonHeight -
    20;
  const safeListHeight = Math.max(listAvailableHeight, 250);   // never below 250px
  const editorHeight = height - topPadding - headerHeight - carouselHeight - 60;

  // --------------------------------------------------------------------
  // 5. DELETE handler – generic for all item types
  // --------------------------------------------------------------------
  /**
   * Displays a confirmation alert and, on confirmation, deletes the item.
   * After deletion, increments `refreshFlag` to force list remount.
   * 
   * @param {string} type – 'topic', 'dispatch', 'manuscript', or 'point'
   * @param {string} id – Unique identifier of the item
   * @param {string} title – Display title for the alert
   */
  const handleDelete = (type, id, title) => {
    Alert.alert('Confirm Deletion', `Permanently delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          console.log(`[LibrisEditor] Deleting ${type}: ${id} (${title})`);
          try {
            // Call the appropriate context method
            if (type === 'topic') await deleteSubject(id);
            else if (type === 'dispatch') await deleteDispatch(id);
            else if (type === 'manuscript') await deleteManuscript(id);
            else if (type === 'point') await deletePoint(id);

            // If we were editing this item, exit edit mode
            if (editingItem?.id === id) {
              setEditingItem(null);
              setDraft({});
              setActiveTab(
                type === 'topic' ? 'topics' :
                type === 'dispatch' ? 'dispatches' :
                type === 'manuscript' ? 'manuscripts' :
                'points'
              );
            }
            setRefreshFlag(f => f + 1);   // forces list remount
            console.log(`[LibrisEditor] Deletion successful`);
          } catch (error) {
            console.error(`[LibrisEditor] Deletion failed:`, error);
            Alert.alert('Error', 'Failed to delete item. Please try again.');
          }
        },
      },
    ]);
  };

  // --------------------------------------------------------------------
  // 6. SAVE handler – creates or updates an item
  // --------------------------------------------------------------------
  /**
   * Saves the current draft to the appropriate context method.
   * For new items, generates an ID (portfolio has no ID).
   * After saving, resets state and navigates back (or stays on portfolio tab).
   */
  const handleSave = async () => {
    // Generate an ID if this is a new item (portfolio has no ID)
    if (!draft.id && activeTab !== 'portfolio') {
      const prefix = activeTab === 'dispatch' ? 'D' : activeTab === 'manuscript' ? 'M' : 'P';
      draft.id = generateId(prefix);
    }

    console.log(`[LibrisEditor] Saving ${activeTab}:`, draft.id || 'portfolio');
    try {
      if (activeTab === 'dispatch') {
        draft.type = 'dispatch';
        if (editingItem) await updateDispatch(draft.id, draft);
        else await addDispatch(draft);
      } else if (activeTab === 'manuscript') {
        draft.type = 'manuscript';
        // Ensure arrays exist
        if (!draft.treatises) draft.treatises = [];
        if (!draft.attachments) draft.attachments = [];
        // Migrate old `article` field if present (from earlier versions)
        if (draft.article && draft.treatises.length === 0) {
          draft.treatises.push({
            id: generateId('T'),
            title: 'Treatise I',
            content: draft.article,
          });
          delete draft.article;
        }
        if (editingItem) await updateManuscript(draft.id, draft);
        else await addManuscript(draft);
      } else if (activeTab === 'topic') {
        if (editingItem) await updateSubject(draft.id, draft);
        else await addSubject(draft);
      } else if (activeTab === 'portfolio') {
        await updatePortfolio(draft);
      } else if (activeTab === 'pointForm') {
        if (editingItem) await updatePoint(editingItem.id, draft);
        else await addPoint(draft);
      }

      // Reset state and navigate away
      setEditingItem(null);
      setDraft({});
      if (activeTab === 'portfolio') {
        Alert.alert('Portfolio Saved', 'Your portfolio has been updated.');
      } else if (activeTab === 'pointForm') {
        setActiveTab('points');
      } else {
        navigation.goBack();
      }
      setRefreshFlag(f => f + 1);   // force list remount after add/update
    } catch (error) {
      console.error(`[LibrisEditor] Save failed:`, error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  // --------------------------------------------------------------------
  // 7. Cancel handler – returns to list view without saving
  // --------------------------------------------------------------------
  const handleCancel = () => {
    setActiveTab(
      activeTab === 'topic' ? 'topics' :
      activeTab === 'dispatch' ? 'dispatches' :
      'manuscripts'
    );
    setEditingItem(null);
    setDraft({});
  };

  // --------------------------------------------------------------------
  // 8. Upload helpers (document picker) – dynamic import to avoid requiring the package
  // --------------------------------------------------------------------
  /**
   * Generic document upload for a text field.
   * @param {string} fieldToSet – The field in `draft` to set with the placeholder text.
   */
  const handleUpload = async (fieldToSet) => {
    try {
      const DocumentPicker = await import('react-native-document-picker');
      const res = await DocumentPicker.default.pick({
        type: [
          DocumentPicker.default.types.docx,
          DocumentPicker.default.types.odt,
          'com.apple.iwork.pages.pages',
          DocumentPicker.default.types.pdf,
          'com.adobe.epub',
        ],
      });
      Alert.alert('File Selected', res[0].name);
      setDraft({ ...draft, [fieldToSet]: `[Content from ${res[0].name}]` });
    } catch (err) {
      if (err?.code === 'MODULE_NOT_FOUND') {
        Alert.alert(
          'Document Picker Not Installed',
          'Please paste or type the content directly.\n\nTo enable file upload, install:\nnpm install react-native-document-picker'
        );
      } else if (!err?.message?.includes('cancel')) {
        Alert.alert('Upload Error', err.message);
      }
    }
  };

  /**
   * Upload one or more attachments (PDF/EPUB) and add to the attachments array.
   */
  const handleAttachmentUpload = async () => {
    try {
      const DocumentPicker = await import('react-native-document-picker');
      const res = await DocumentPicker.default.pick({
        type: [DocumentPicker.default.types.pdf, 'com.adobe.epub'],
        allowMultiSelection: true,
      });
      const newAttachments = res.map((file) => ({
        name: file.name,
        uri: file.uri,
        type: file.type,
        size: file.size,
      }));
      setDraft({
        ...draft,
        attachments: [...(draft.attachments || []), ...newAttachments],
      });
    } catch (err) {
      if (!err?.message?.includes('cancel')) Alert.alert('Upload Error', err.message);
    }
  };

  /**
   * Remove an attachment from the draft.
   * @param {number} index – Index of the attachment to remove.
   */
  const removeAttachment = (index) => {
    const updated = [...draft.attachments];
    updated.splice(index, 1);
    setDraft({ ...draft, attachments: updated });
  };

  // --------------------------------------------------------------------
  // 9. Subject toggling (for dispatch/manuscript forms)
  // --------------------------------------------------------------------
  /**
   * Toggles the selected subject. If the same pill is pressed, deselects.
   * Also clears the segment when subject changes.
   * @param {string} subjectId – The id of the subject to toggle.
   */
  const toggleSubject = (subjectId) => {
    setDraft((prev) => ({
      ...prev,
      subjectId: prev.subjectId === subjectId ? undefined : subjectId,
      segmentId: undefined, // clear segment when subject changes
    }));
  };

  /**
   * Inserts a subheading marker (`##`) at the end of the given field.
   * Used for body content and treatise content.
   * @param {string} fieldName – The field in `draft` to append to.
   */
  const insertSubheading = (fieldName) => {
    const current = draft[fieldName] || '';
    const newText = current + (current ? '\n\n' : '') + '## New Subheading\n\nSubheading content...';
    setDraft({ ...draft, [fieldName]: newText });
  };

  // --------------------------------------------------------------------
  // 10. Treatise management helpers
  // --------------------------------------------------------------------
  const addTreatise = () => {
    const newTreatise = {
      id: generateId('T'),
      title: `Treatise ${(draft.treatises?.length || 0) + 1}`,
      content: '',
    };
    setDraft({ ...draft, treatises: [...(draft.treatises || []), newTreatise] });
  };

  const updateTreatise = (index, field, value) => {
    const updated = [...draft.treatises];
    updated[index] = { ...updated[index], [field]: value };
    setDraft({ ...draft, treatises: updated });
  };

  const deleteTreatise = (index) => {
    Alert.alert('Delete Treatise', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = draft.treatises.filter((_, i) => i !== index);
          setDraft({ ...draft, treatises: updated });
        },
      },
    ]);
  };

  // --------------------------------------------------------------------
  // 11. Segment selector (for dispatch/manuscript)
  // --------------------------------------------------------------------
  /**
   * Renders a horizontal scrollable list of segment pills.
   * Only enabled if a subject is selected.
   */
  const renderSegmentSelector = () => {
    if (!draft.subjectId) {
      return (
        <View style={styles.segmentNote}>
          <Text style={styles.segmentNoteText}>• Select a subject first to choose a sub‑topic</Text>
        </View>
      );
    }
    return (
      <View style={styles.pickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SEGMENTS.map((seg) => (
            <TouchableOpacity
              key={seg.id}
              onPress={() => setDraft((prev) => ({ ...prev, segmentId: seg.id }))}
              style={[styles.segmentPill, draft.segmentId === seg.id && styles.segmentPillActive]}
            >
              <Text
                style={[
                  styles.segmentPillText,
                  draft.segmentId === seg.id && styles.segmentPillTextActive,
                ]}
              >
                {seg.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // --------------------------------------------------------------------
  // 12. Portfolio helpers – Skills, Experience, Education
  // --------------------------------------------------------------------
  const addSkill = () => {
    setDraft({
      ...draft,
      skills: [...(draft.skills || []), ''],
    });
  };

  const updateSkill = (index, value) => {
    const updated = [...(draft.skills || [])];
    updated[index] = value;
    setDraft({ ...draft, skills: updated });
  };

  const deleteSkill = (index) => {
    Alert.alert('Delete Skill', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = draft.skills.filter((_, i) => i !== index);
          setDraft({ ...draft, skills: updated });
        },
      },
    ]);
  };

  const addExperience = () => {
    const newExp = { year: '', title: '', description: '' };
    setDraft({
      ...draft,
      experience: [...(draft.experience || []), newExp],
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...(draft.experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setDraft({ ...draft, experience: updated });
  };

  const deleteExperience = (index) => {
    Alert.alert('Delete Experience', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = draft.experience.filter((_, i) => i !== index);
          setDraft({ ...draft, experience: updated });
        },
      },
    ]);
  };

  const addEducation = () => {
    const newEdu = { year: '', title: '' };
    setDraft({
      ...draft,
      education: [...(draft.education || []), newEdu],
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...(draft.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setDraft({ ...draft, education: updated });
  };

  const deleteEducation = (index) => {
    Alert.alert('Delete Education', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = draft.education.filter((_, i) => i !== index);
          setDraft({ ...draft, education: updated });
        },
      },
    ]);
  };

  // ======================================================================
  // 13. FORM RENDERERS
  // ======================================================================

  // ----- Topic Form -----
  /**
   * Renders the form for editing a Topic.
   * Fields: id (editable only for new topics), name, field, era, guiding question.
   */
  const renderTopicForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>ID (unique, no spaces)</Text>
        <TextInput
          style={styles.input}
          value={draft.id || ''}
          onChangeText={(t) => setDraft({ ...draft, id: t })}
          placeholder="e.g. falsafa"
          placeholderTextColor={THEME.muted}
          editable={!editingItem}   // can't edit ID after creation
        />
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={draft.name || ''}
          onChangeText={(t) => setDraft({ ...draft, name: t })}
          placeholder="Falsafa"
          placeholderTextColor={THEME.muted}
        />
        <Text style={styles.label}>Field</Text>
        <TextInput
          style={styles.input}
          value={draft.field || ''}
          onChangeText={(t) => setDraft({ ...draft, field: t })}
          placeholder="Philosophy"
          placeholderTextColor={THEME.muted}
        />
        <Text style={styles.label}>Era</Text>
        <TextInput
          style={styles.input}
          value={draft.era || ''}
          onChangeText={(t) => setDraft({ ...draft, era: t })}
          placeholder="Abbasid"
          placeholderTextColor={THEME.muted}
        />
        <Text style={styles.label}>Guiding Question</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={draft.question || ''}
          onChangeText={(t) => setDraft({ ...draft, question: t })}
          placeholder="How does the preservation of Philosophy illuminate the modern seeker?"
          placeholderTextColor={THEME.muted}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  // ----- Dispatch Form -----
  /**
   * Renders the form for editing a Dispatch.
   * Fields: title, heading, subject (pill selector with NONE), sub‑topic (segment), body.
   * Includes a toolbar for adding subheadings and a document upload button.
   */
  const renderDispatchForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={draft.title || ''}
          onChangeText={(t) => setDraft({ ...draft, title: t })}
          placeholder="Inquiry #101"
        />
        <Text style={styles.label}>Heading</Text>
        <TextInput
          style={styles.input}
          value={draft.heading || ''}
          onChangeText={(t) => setDraft({ ...draft, heading: t })}
          placeholder="On Philosophy Dynamics"
        />
        <Text style={styles.label}>Subject (Topic)</Text>
        <View style={styles.pickerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setDraft({ ...draft, subjectId: undefined, segmentId: undefined })}
              style={[styles.subjectPill, draft.subjectId === undefined && styles.subjectPillActive]}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  draft.subjectId === undefined && styles.subjectPillTextActive,
                ]}
              >
                NONE
              </Text>
            </TouchableOpacity>
            {subjects.filter(Boolean).map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => toggleSubject(s.id)}
                style={[styles.subjectPill, draft.subjectId === s.id && styles.subjectPillActive]}
              >
                <Text
                  style={[
                    styles.subjectPillText,
                    draft.subjectId === s.id && styles.subjectPillTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.label}>Sub‑topic (required)</Text>
        {renderSegmentSelector()}

        <Text style={styles.label}>Body (use ## for subheadings)</Text>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => insertSubheading('body')}>
            <Text style={styles.toolbarBtnText}>➕ Add Subheading</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={draft.body || ''}
          onChangeText={(t) => setDraft({ ...draft, body: t })}
          multiline
          numberOfLines={10}
          placeholder="Dispatch content... (use ## for subheadings)"
        />
        <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload('body')}>
          <Text style={styles.uploadText}>📄 Upload Document (DOCX, ODT, PAGES)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ----- Manuscript Form -----
  /**
   * Renders the form for editing a Manuscript.
   * Includes:
   *   - Metadata: title, author, subject, sub‑topic, blurb, summary
   *   - Attachments (PDF/EPUB) with add/remove
   *   - Treatises (multiple) with title, content, subheading toolbar, and document upload
   */
  const renderManuscriptForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={draft.title || ''}
          onChangeText={(t) => setDraft({ ...draft, title: t })}
          placeholder="Codex Falsafa Vol. 1"
        />
        <Text style={styles.label}>Author</Text>
        <TextInput
          style={styles.input}
          value={draft.author || ''}
          onChangeText={(t) => setDraft({ ...draft, author: t })}
          placeholder="Al-Farabi"
        />
        <Text style={styles.label}>Subject (Topic)</Text>
        <View style={styles.pickerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setDraft({ ...draft, subjectId: undefined, segmentId: undefined })}
              style={[styles.subjectPill, draft.subjectId === undefined && styles.subjectPillActive]}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  draft.subjectId === undefined && styles.subjectPillTextActive,
                ]}
              >
                NONE
              </Text>
            </TouchableOpacity>
            {subjects.filter(Boolean).map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => toggleSubject(s.id)}
                style={[styles.subjectPill, draft.subjectId === s.id && styles.subjectPillActive]}
              >
                <Text
                  style={[
                    styles.subjectPillText,
                    draft.subjectId === s.id && styles.subjectPillTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.label}>Sub‑topic (required)</Text>
        {renderSegmentSelector()}

        <Text style={styles.label}>Blurb</Text>
        <TextInput
          style={styles.input}
          value={draft.blurb || ''}
          onChangeText={(t) => setDraft({ ...draft, blurb: t })}
          placeholder="Short description"
        />

        <Text style={styles.label}>Summary</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={draft.summary || ''}
          onChangeText={(t) => setDraft({ ...draft, summary: t })}
          multiline
          numberOfLines={3}
          placeholder="Detailed summary..."
        />

        {/* ----- ATTACHMENTS ----- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>ATTACHMENTS (PDF/EPUB)</Text>
          <TouchableOpacity style={styles.addAttachmentBtn} onPress={handleAttachmentUpload}>
            <Text style={styles.addAttachmentBtnText}>+ Add File</Text>
          </TouchableOpacity>
        </View>

        {draft.attachments?.map((att, index) => (
          <View key={index} style={styles.attachmentCard}>
            <View style={styles.attachmentInfo}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {att.name}
              </Text>
              <Text style={styles.attachmentMeta}>
                {(att.size / 1024).toFixed(1)} KB • {att.type}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeAttachment(index)} style={styles.removeAttachmentBtn}>
              <Text style={styles.removeAttachmentText}>🗑</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ----- TREATISES ----- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>TREATISES</Text>
          <TouchableOpacity style={styles.addTreatiseBtn} onPress={addTreatise}>
            <Text style={styles.addTreatiseBtnText}>+ Add Treatise</Text>
          </TouchableOpacity>
        </View>

        {draft.treatises?.map((treatise, index) => (
          <View key={treatise.id} style={styles.treatiseCard}>
            <View style={styles.treatiseHeader}>
              <TextInput
                style={styles.treatiseTitleInput}
                value={treatise.title}
                onChangeText={(t) => updateTreatise(index, 'title', t)}
                placeholder="Treatise Title"
                placeholderTextColor={THEME.muted}
              />
              <TouchableOpacity onPress={() => deleteTreatise(index)} style={styles.deleteTreatiseBtn}>
                <Text style={styles.deleteTreatiseBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={styles.toolbarBtn}
                onPress={() => {
                  const current = treatise.content || '';
                  const newContent =
                    current + (current ? '\n\n' : '') + '## New Subheading\n\nSubheading content...';
                  updateTreatise(index, 'content', newContent);
                }}
              >
                <Text style={styles.toolbarBtnText}>➕ Add Subheading</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={treatise.content}
              onChangeText={(t) => updateTreatise(index, 'content', t)}
              multiline
              numberOfLines={6}
              placeholder="Treatise content... (use ## for subheadings)"
            />
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={async () => {
                try {
                  const DocumentPicker = await import('react-native-document-picker');
                  const res = await DocumentPicker.default.pick({
                    type: [
                      DocumentPicker.default.types.docx,
                      DocumentPicker.default.types.odt,
                      'com.apple.iwork.pages.pages',
                    ],
                  });
                  Alert.alert('File Selected', res[0].name);
                  updateTreatise(index, 'content', `[Content from ${res[0].name}]`);
                } catch (err) {
                  if (!err?.message?.includes('cancel')) Alert.alert('Upload Error', err.message);
                }
              }}
            >
              <Text style={styles.uploadText}>📄 Upload Document</Text>
            </TouchableOpacity>
          </View>
        ))}

        {(!draft.treatises || draft.treatises.length === 0) && (
          <Text style={styles.emptyTreatises}>No treatises added yet.</Text>
        )}
      </View>
    </View>
  );

  // ----- Portfolio Form -----
  /**
   * Renders the portfolio editor.
   * Sections:
   *   - Name, Subtitle, About (text inputs)
   *   - Skills (list of text inputs, add/delete)
   *   - Experience (list with year, title, description)
   *   - Education (list with year, title)
   *   - Contact (JSON textarea with validation)
   */
  const renderPortfolioForm = () => {
    const handleContactChange = (text) => {
      try {
        const parsed = JSON.parse(text);
        setDraft({ ...draft, contact: parsed });
        setContactError('');
      } catch (e) {
        setContactError('Invalid JSON format');
      }
    };

    return (
      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={draft.name || ''}
            onChangeText={(t) => setDraft({ ...draft, name: t })}
            placeholder="Dr. Alia Al‑Rashid"
          />

          <Text style={styles.label}>Subtitle</Text>
          <TextInput
            style={styles.input}
            value={draft.subtitle || ''}
            onChangeText={(t) => setDraft({ ...draft, subtitle: t })}
            placeholder="Scholar of Islamic Philosophy & Digital Humanities"
          />

          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={draft.about || ''}
            onChangeText={(t) => setDraft({ ...draft, about: t })}
            multiline
            numberOfLines={6}
            placeholder="Write about yourself..."
          />

          {/* ----- SKILLS SECTION ----- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>SKILLS</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={addSkill}>
              <Text style={styles.addButtonSmallText}>+ Add Skill</Text>
            </TouchableOpacity>
          </View>

          {draft.skills?.map((skill, index) => (
            <View key={index} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>Skill #{index + 1}</Text>
                <TouchableOpacity onPress={() => deleteSkill(index)} style={styles.deleteSubBtn}>
                  <Text style={styles.deleteSubBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={skill}
                onChangeText={(value) => updateSkill(index, value)}
                placeholder="e.g., Islamic Philosophy, Digital Humanities, React Native"
                multiline
              />
            </View>
          ))}

          {/* ----- EXPERIENCE SECTION ----- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>EXPERIENCE</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={addExperience}>
              <Text style={styles.addButtonSmallText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {draft.experience?.map((exp, index) => (
            <View key={index} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>Experience #{index + 1}</Text>
                <TouchableOpacity onPress={() => deleteExperience(index)} style={styles.deleteSubBtn}>
                  <Text style={styles.deleteSubBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={exp.year}
                onChangeText={(t) => updateExperience(index, 'year', t)}
                placeholder="2020 – Present"
              />
              <Text style={styles.subLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={exp.title}
                onChangeText={(t) => updateExperience(index, 'title', t)}
                placeholder="Lead Curator, Al‑Khalasa Project"
              />
              <Text style={styles.subLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                value={exp.description}
                onChangeText={(t) => updateExperience(index, 'description', t)}
                multiline
                numberOfLines={3}
                placeholder="Developing a digital archive..."
              />
            </View>
          ))}

          {/* ----- EDUCATION SECTION ----- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>EDUCATION</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={addEducation}>
              <Text style={styles.addButtonSmallText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {draft.education?.map((edu, index) => (
            <View key={index} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>Education #{index + 1}</Text>
                <TouchableOpacity onPress={() => deleteEducation(index)} style={styles.deleteSubBtn}>
                  <Text style={styles.deleteSubBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subLabel}>Year</Text>
              <TextInput
                style={styles.input}
                value={edu.year}
                onChangeText={(t) => updateEducation(index, 'year', t)}
                placeholder="2012 – 2016"
              />
              <Text style={styles.subLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={edu.title}
                onChangeText={(t) => updateEducation(index, 'title', t)}
                placeholder="PhD in Islamic Philosophy, University of Oxford"
              />
            </View>
          ))}

          {/* ----- CONTACT ----- */}
          <Text style={styles.label}>Contact (JSON format)</Text>
          <TextInput
            style={[styles.input, styles.textArea, contactError ? styles.inputError : null]}
            value={typeof draft.contact === 'object' ? JSON.stringify(draft.contact, null, 2) : ''}
            onChangeText={handleContactChange}
            multiline
            numberOfLines={4}
            placeholder='{"email":"alia@alkhalasa.org", "twitter":"@alia_alkhalasa"}'
          />
          {contactError ? <Text style={styles.errorText}>{contactError}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>💾 SAVE PORTFOLIO</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // ----- Points List View -----
  /**
   * Renders a list of points with edit and delete buttons.
   */
  const renderPointsList = () => {
    const items = points.filter(Boolean);

    return (
      <View style={[styles.listContainer, { height: safeListHeight }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingItem(null);
            setDraft(DEFAULT_POINT);
            setActiveTab('pointForm');
          }}
        >
          <Text style={styles.addButtonText}>+ ADD NEW POINT</Text>
        </TouchableOpacity>

        <FlatList
          key={`points-list-${items.length}-${refreshFlag}`}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.id}</Text>
                <Text numberOfLines={2} style={styles.itemDescription}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(item);
                    setDraft(item);
                    setActiveTab('pointForm');
                  }}
                  style={styles.editBtn}
                >
                  <Text style={styles.actionText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete('point', item.id, item.name)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.actionText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  // ----- Point Form -----
  /**
   * Renders the form for adding/editing a point.
   * Fields: name, description, links (one per line, format label|url)
   */
  const renderPointForm = () => {
    const handleLinksChange = (text) => {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const links = lines
        .map(line => {
          const parts = line.split('|').map(s => s.trim());
          if (parts.length === 2 && parts[0] && parts[1]) {
            return { label: parts[0], url: parts[1] };
          }
          return null;
        })
        .filter(Boolean);
      setDraft({ ...draft, links });
    };

    return (
      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={draft.name || ''}
            onChangeText={(t) => setDraft({ ...draft, name: t })}
            placeholder="Al-Khwarizmi"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={draft.description || ''}
            onChangeText={(t) => setDraft({ ...draft, description: t })}
            multiline
            numberOfLines={4}
            placeholder="Mini‑biography or details..."
          />

          <Text style={styles.label}>Links (one per line, format: label|url)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={Array.isArray(draft.links) ? draft.links.map(l => `${l.label}|${l.url}`).join('\n') : ''}
            onChangeText={handleLinksChange}
            multiline
            numberOfLines={4}
            placeholder="Wikipedia|https://en.wikipedia.org/wiki/Al-Khwarizmi"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>💾 SAVE POINT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveTab('points')}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ======================================================================
  // 14. LIST VIEW for topics/dispatches/manuscripts
  // ======================================================================
  /**
   * Renders the main list for the current tab (topics, dispatches, manuscripts).
   * Each item has edit and delete buttons.
   */
  const renderMainList = () => {
    let items = [];
    if (activeTab === 'topics') items = subjects;
    if (activeTab === 'dispatches') items = dispatches;
    if (activeTab === 'manuscripts') items = manuscripts;

    items = items.filter(Boolean);

    return (
      <View style={[styles.listContainer, { height: safeListHeight }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingItem(null);
            setDraft({});
            if (activeTab === 'topics') setActiveTab('topic');
            else if (activeTab === 'dispatches') setActiveTab('dispatch');
            else if (activeTab === 'manuscripts') setActiveTab('manuscript');
          }}
        >
          <Text style={styles.addButtonText}>+ ADD NEW</Text>
        </TouchableOpacity>

        <FlatList
          key={`main-list-${activeTab}-${items.length}-${refreshFlag}`} // Forces remount when data changes
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title || item.name}</Text>
                <Text style={styles.itemSub}>{item.id}</Text>
                {item.segmentId && (
                  <Text style={styles.itemSegment}>{getSegmentLabel(item.segmentId)}</Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingItem(item);
                    // If it's an old manuscript with `article`, convert to treatise
                    if (activeTab === 'manuscripts' && item.article && !item.treatises) {
                      item.treatises = [
                        { id: generateId('T'), title: 'Treatise I', content: item.article },
                      ];
                      delete item.article;
                    }
                    setDraft(item);
                    if (activeTab === 'topics') setActiveTab('topic');
                    else if (activeTab === 'dispatches') setActiveTab('dispatch');
                    else if (activeTab === 'manuscripts') setActiveTab('manuscript');
                  }}
                  style={styles.editBtn}
                >
                  <Text style={styles.actionText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleDelete(
                      activeTab === 'topics' ? 'topic' :
                      activeTab === 'dispatches' ? 'dispatch' :
                      'manuscript',
                      item.id,
                      item.title || item.name
                    )
                  }
                  style={styles.deleteBtn}
                >
                  <Text style={styles.actionText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  // ======================================================================
  // 15. EDITOR SWITCH – decides which form to show
  // ======================================================================
  /**
   * Determines which editor view to render based on activeTab.
   * For Topic, Dispatch, Manuscript – uses a fixed bottom bar with Save/Cancel.
   * For other tabs, uses the older layout (buttons inside scroll).
   */
  const renderEditor = () => {
    let form = null;
    let isFormWithButtons = false; // topic, dispatch, manuscript have fixed bottom bar

    if (activeTab === 'topic') {
      form = renderTopicForm();
      isFormWithButtons = true;
    } else if (activeTab === 'dispatch') {
      form = renderDispatchForm();
      isFormWithButtons = true;
    } else if (activeTab === 'manuscript') {
      form = renderManuscriptForm();
      isFormWithButtons = true;
    } else if (activeTab === 'portfolio') {
      form = renderPortfolioForm();
    } else if (activeTab === 'points') {
      form = renderPointsList();
    } else if (activeTab === 'pointForm') {
      form = renderPointForm();
    }

    if (!form) return null;

    // For topic, dispatch, manuscript: use a fixed bottom bar with Save/Cancel
    if (isFormWithButtons) {
      return (
        <View style={styles.editorWrapper}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveTab(
                activeTab === 'topic' ? 'topics' :
                activeTab === 'dispatch' ? 'dispatches' :
                'manuscripts'
              );
              setEditingItem(null);
              setDraft({});
            }}
          >
            <Text style={styles.backText}>← BACK TO LIST</Text>
          </TouchableOpacity>
          <View style={styles.editorScrollWrapper}>
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {form}
            </ScrollView>
          </View>
          <View style={styles.fixedButtonBar}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>💾 SAVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // For other tabs (portfolio, points, pointForm), use the old layout (buttons inside scroll)
    const scrollContent = (
      <ScrollView
        contentContainerStyle={styles.editorContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {form}
      </ScrollView>
    );

    return (
      <View style={styles.editorWrapper}>
        {activeTab === 'pointForm' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveTab('points');
              setEditingItem(null);
              setDraft({});
            }}
          >
            <Text style={styles.backText}>← BACK TO LIST</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'portfolio' && <View style={styles.backButtonPlaceholder} />}
        <View style={[styles.editorScrollWrapper, { height: editorHeight }]}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView
              style={styles.keyboardView}
              behavior="padding"
              keyboardVerticalOffset={headerHeight + carouselHeight + 20}
            >
              {scrollContent}
            </KeyboardAvoidingView>
          ) : (
            scrollContent
          )}
        </View>
      </View>
    );
  };

  // ======================================================================
  // 16. Tabs renderer
  // ======================================================================
  const renderTabs = () => (
    <View style={[styles.tabContainer, { height: tabsHeight }]}>
      {['topics', 'dispatches', 'manuscripts', 'portfolio', 'points'].map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => setActiveTab(t)}
          style={[styles.tab, activeTab === t && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
            {t.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ======================================================================
  // 17. Main render
  // ======================================================================
  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <AppHeader title="LIBRIS EDITOR" showBack />
      <TopicNavCarousel navigation={navigation} currentScreen="LibrisEditor" />
      {activeTab !== 'topic' &&
       activeTab !== 'dispatch' &&
       activeTab !== 'manuscript' &&
       activeTab !== 'portfolio' &&
       activeTab !== 'points' &&
       activeTab !== 'pointForm' ? (
        <>
          {renderTabs()}
          {renderMainList()}
        </>
      ) : (
        renderEditor()
      )}
    </View>
  );
};

// ========================================================================
// 18. Styles – all style definitions with comments
// ========================================================================
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.onyx },
  tabContainer: { flexDirection: 'row', backgroundColor: THEME.charcoal },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: THEME.gold },
  tabText: { color: '#666', fontSize: 10, fontWeight: '900' },
  tabTextActive: { color: THEME.gold },
  listContainer: { width: '100%' },
  listContent: { padding: 20, paddingBottom: 40 },
  addButton: {
    backgroundColor: THEME.gold,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  addButtonText: { color: THEME.onyx, fontWeight: '900', fontSize: 12 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.charcoal,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  itemInfo: { flex: 1 },
  itemTitle: { color: THEME.parchment, fontSize: 14, fontWeight: '700' },
  itemSub: { color: '#777', fontSize: 10, fontStyle: 'italic' },
  itemSegment: { color: THEME.gold, fontSize: 9, fontWeight: '700', marginTop: 4 },
  itemDescription: { color: '#AAA', fontSize: 12, marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 15 },
  editBtn: { padding: 5 },
  deleteBtn: { padding: 5 },
  actionText: { color: THEME.gold, fontSize: 16 },
  editorWrapper: { flex: 1, backgroundColor: THEME.parchment },
  editorScrollWrapper: { flex: 1 },
  keyboardView: { flex: 1 },
  editorContent: { padding: 20, paddingBottom: 40 },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME.parchment,
    borderBottomWidth: 1,
    borderBottomColor: THEME.subtle,
  },
  backButtonPlaceholder: { height: 0 },
  backText: { color: THEME.gold, fontWeight: '900', fontSize: 12 },
  formContainer: { width: '100%', padding: 20 },
  form: { gap: 15 },
  label: { fontSize: 10, fontWeight: '900', color: THEME.onyx, textTransform: 'uppercase', marginBottom: 4 },
  input: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    padding: 12,
    fontSize: 14,
    color: THEME.text,
    borderRadius: 4,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  subjectPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.subtle,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  subjectPillActive: { backgroundColor: THEME.gold, borderColor: THEME.gold },
  subjectPillText: { color: THEME.onyx, fontWeight: '700', fontSize: 12 },
  subjectPillTextActive: { color: THEME.onyx },
  segmentNote: { paddingVertical: 8, paddingHorizontal: 4 },
  segmentNoteText: { color: THEME.muted, fontSize: 11, fontStyle: 'italic' },
  segmentPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.subtle,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  segmentPillActive: { backgroundColor: THEME.gold, borderColor: THEME.gold },
  segmentPillText: { color: THEME.onyx, fontWeight: '700', fontSize: 12 },
  segmentPillTextActive: { color: THEME.onyx },
  uploadBtn: { backgroundColor: THEME.charcoal, padding: 15, alignItems: 'center', marginVertical: 10, borderRadius: 4 },
  uploadText: { color: THEME.gold, fontWeight: '900', fontSize: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, marginBottom: 20 },
  fixedButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.subtle,
    backgroundColor: THEME.parchment,
  },
  saveBtn: { backgroundColor: THEME.onyx, padding: 15, minWidth: 120, alignItems: 'center', borderRadius: 4 },
  saveBtnText: { color: THEME.parchment, fontWeight: '900' },
  cancelBtn: { backgroundColor: THEME.subtle, padding: 15, minWidth: 120, alignItems: 'center', borderRadius: 4 },
  cancelBtnText: { color: THEME.onyx, fontWeight: '900' },
  draftBtn: { backgroundColor: THEME.subtle, padding: 15, minWidth: 120, alignItems: 'center', borderRadius: 4 },
  draftBtnText: { color: THEME.onyx, fontWeight: '900' },
  addAttachmentBtn: { backgroundColor: THEME.gold, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  addAttachmentBtnText: { color: THEME.onyx, fontWeight: '900', fontSize: 10 },
  attachmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: 12, fontWeight: '700', color: THEME.onyx },
  attachmentMeta: { fontSize: 9, color: THEME.muted, marginTop: 2 },
  removeAttachmentBtn: { padding: 8 },
  removeAttachmentText: { color: THEME.gold, fontSize: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addButtonSmall: {
    backgroundColor: THEME.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonSmallText: {
    color: THEME.onyx,
    fontWeight: '900',
    fontSize: 10,
  },
  subCard: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.onyx,
    textTransform: 'uppercase',
  },
  deleteSubBtn: { padding: 4 },
  deleteSubBtnText: { color: THEME.gold, fontSize: 16 },
  subLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.muted,
    textTransform: 'uppercase',
    marginBottom: 2,
    marginTop: 8,
  },
  textAreaSmall: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#8B0000',
    borderWidth: 2,
  },
  errorText: {
    color: '#8B0000',
    fontSize: 10,
    marginTop: 4,
  },
  addTreatiseBtn: { backgroundColor: THEME.gold, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  addTreatiseBtnText: { color: THEME.onyx, fontWeight: '900', fontSize: 10 },
  treatiseCard: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.subtle,
    padding: 15,
    marginBottom: 20,
    borderRadius: 6,
  },
  treatiseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  treatiseTitleInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: THEME.onyx,
    borderBottomWidth: 1,
    borderBottomColor: THEME.subtle,
    paddingVertical: 4,
    marginRight: 10,
  },
  deleteTreatiseBtn: { padding: 5 },
  deleteTreatiseBtnText: { color: THEME.gold, fontSize: 16 },
  emptyTreatises: { color: THEME.muted, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  toolbar: { flexDirection: 'row', marginBottom: 8 },
  toolbarBtn: { backgroundColor: THEME.charcoal, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginRight: 10 },
  toolbarBtnText: { color: THEME.gold, fontWeight: '700', fontSize: 10 },
});

export default LibrisEditor;