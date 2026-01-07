
export type Language = 'en' | 'ko' | 'ja' | 'es';

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
  title: string;
  date: string;
  starr: STARR;
  activityTags: string[];
  competencyTags: string[];
  satisfaction: number;
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
