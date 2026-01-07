
import { ExperienceEntry, Child, Language, User } from '../types';
import { SAMPLE_CHILDREN, SAMPLE_EXPERIENCES } from '../constants';

const KEYS = {
  USER: 'valuelog_active_user',
  CHILDREN: (userId: string) => `valuelog_children_${userId}`,
  ENTRIES: (userId: string) => `valuelog_entries_${userId}`,
  SELECTED_CHILD_ID: (userId: string) => `valuelog_selected_child_${userId}`,
  LANGUAGE: 'valuelog_language',
  CUSTOM_ACTIVITY_TAGS: (userId: string) => `valuelog_custom_activity_tags_${userId}`,
  CUSTOM_COMPETENCY_TAGS: (userId: string) => `valuelog_custom_competency_tags_${userId}`
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.USER);
  },
  getChildren: (userId: string): Child[] => {
    const data = localStorage.getItem(KEYS.CHILDREN(userId));
    return data ? JSON.parse(data) : SAMPLE_CHILDREN;
  },
  saveChildren: (userId: string, children: Child[]) => {
    localStorage.setItem(KEYS.CHILDREN(userId), JSON.stringify(children));
  },
  getEntries: (userId: string): ExperienceEntry[] => {
    const data = localStorage.getItem(KEYS.ENTRIES(userId));
    return data ? JSON.parse(data) : SAMPLE_EXPERIENCES;
  },
  saveEntries: (userId: string, entries: ExperienceEntry[]) => {
    localStorage.setItem(KEYS.ENTRIES(userId), JSON.stringify(entries));
  },
  getSelectedChildId: (userId: string): string | null => {
    return localStorage.getItem(KEYS.SELECTED_CHILD_ID(userId));
  },
  setSelectedChildId: (userId: string, id: string) => {
    localStorage.setItem(KEYS.SELECTED_CHILD_ID(userId), id);
  },
  getLanguage: (): Language => {
    return (localStorage.getItem(KEYS.LANGUAGE) as Language) || 'en';
  },
  setLanguage: (lang: Language) => {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  },
  getCustomActivityTags: (userId: string): string[] => {
    const data = localStorage.getItem(KEYS.CUSTOM_ACTIVITY_TAGS(userId));
    return data ? JSON.parse(data) : [];
  },
  saveCustomActivityTags: (userId: string, tags: string[]) => {
    localStorage.setItem(KEYS.CUSTOM_ACTIVITY_TAGS(userId), JSON.stringify(tags));
  },
  getCustomCompetencyTags: (userId: string): string[] => {
    const data = localStorage.getItem(KEYS.CUSTOM_COMPETENCY_TAGS(userId));
    return data ? JSON.parse(data) : [];
  },
  saveCustomCompetencyTags: (userId: string, tags: string[]) => {
    localStorage.setItem(KEYS.CUSTOM_COMPETENCY_TAGS(userId), JSON.stringify(tags));
  }
};
