
export type Language = 'en' | 'ko' | 'ja' | 'es';

export interface User {
  id: string;
  name: string;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
}

export interface STARR {
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
}

export interface ExperienceEntry {
  id: string;
  childId: string;
  userId: string;
  title: string;
  date: string;
  starr: STARR;
  activityTags: string[];
  competencyTags: string[];
  satisfaction: number;
  image?: string; // Base64 string
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  TIMELINE = 'TIMELINE',
  CREATE = 'CREATE',
  PROFILES = 'PROFILES'
}

export interface DashboardStats {
  activityDistribution: { name: string; value: number }[];
  competencyDistribution: { name: string; value: number }[];
  avgSatisfaction: number;
  totalEntries: number;
}
