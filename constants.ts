
import { Child, ExperienceEntry } from './types';

export const ACTIVITY_TAGS = [
  'Art', 'Science', 'Sports', 'Volunteering', 'Career', 'Coding', 'Music', 'Leadership', 'Language', 'Reading'
];

export const COMPETENCY_TAGS = [
  'Curiosity', 'Collaboration', 'Grit', 'Leadership', 'Problem Solving', 'Creativity', 'Empathy', 'Communication'
];

export const SAMPLE_CHILDREN: Child[] = [
  { id: '1', name: 'Ji-won', avatar: 'https://picsum.photos/seed/child1/200' },
  { id: '2', name: 'Min-soo', avatar: 'https://picsum.photos/seed/child2/200' }
];

export const SAMPLE_EXPERIENCES: ExperienceEntry[] = [
  {
    id: 'e1',
    childId: '1',
    title: 'School Science Fair',
    date: '2025-11-15',
    starr: {
      situation: 'Annual science competition at school.',
      task: 'Build a working model demonstrating renewable energy.',
      action: 'Designed and assembled a small-scale wind turbine using recycled materials.',
      result: 'Won 2nd place and successfully explained the mechanics to judges.',
      reflection: 'I learned that persistence is key when things do not work on the first try.'
    },
    activityTags: ['Science', 'Leadership'],
    competencyTags: ['Problem Solving', 'Grit'],
    satisfaction: 5
  },
  {
    id: 'e2',
    childId: '1',
    title: 'Local Art Exhibition',
    date: '2025-12-05',
    starr: {
      situation: 'Community art show for youth.',
      task: 'Create a painting reflecting environmental awareness.',
      action: 'Painted a landscape using eco-friendly watercolors.',
      result: 'Received positive feedback from local artists.',
      reflection: 'I realized how art can be a powerful tool for advocacy.'
    },
    activityTags: ['Art'],
    competencyTags: ['Creativity', 'Communication'],
    satisfaction: 4
  }
];
