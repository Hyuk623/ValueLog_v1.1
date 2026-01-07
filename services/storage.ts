
import { ExperienceEntry, Child, Language } from '../types';
import { SAMPLE_CHILDREN, SAMPLE_EXPERIENCES } from '../constants';

const KEYS = {
  CHILDREN: 'valuelog_children',
  ENTRIES: 'valuelog_entries',
  SELECTED_CHILD_ID: 'valuelog_selected_child',
  LANGUAGE: 'valuelog_language'
};

export const storage = {
  getChildren: (): Child[] => {
    const data = localStorage.getItem(KEYS.CHILDREN);
    return data ? JSON.parse(data) : SAMPLE_CHILDREN;
  },
  saveChildren: (children: Child[]) => {
    localStorage.setItem(KEYS.CHILDREN, JSON.stringify(children));
  },
  getEntries: (): ExperienceEntry[] => {
    const data = localStorage.getItem(KEYS.ENTRIES);
    return data ? JSON.parse(data) : SAMPLE_EXPERIENCES;
  },
  saveEntries: (entries: ExperienceEntry[]) => {
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
  },
  getSelectedChildId: (): string | null => {
    return localStorage.getItem(KEYS.SELECTED_CHILD_ID);
  },
  setSelectedChildId: (id: string) => {
    localStorage.setItem(KEYS.SELECTED_CHILD_ID, id);
  },
  getLanguage: (): Language => {
    return (localStorage.getItem(KEYS.LANGUAGE) as Language) || 'en';
  },
  setLanguage: (lang: Language) => {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  }
};
