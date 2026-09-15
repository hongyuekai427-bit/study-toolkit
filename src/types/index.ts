// Core types for StudyScope

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  estimatedTime: number;
  completed: boolean;
  tags: string[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  tags: string[];
  cards: Flashcard[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  lastReviewed: string | null;
  reviewCount: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher?: string;
  room?: string;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  day: number; // 0-6 (Sun-Sat)
  startTime: string;
  endTime: string;
  room?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  subject: string;
  deadline: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
  tasks: ProjectTask[];
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Assignment {
  id: string;
  name: string;
  subject: string;
  description: string;
  deadline: string;
  requirements: string;
  estimatedWorkload: number;
  status: 'not-started' | 'planning' | 'in-progress' | 'review' | 'completed';
  createdAt: string;
}

export interface Reference {
  id: string;
  title: string;
  author: string;
  website: string;
  url: string;
  date: string;
  accessDate: string;
  notes: string;
  tags: string[];
  citation: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  name: string;
  subject: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface TimerSession {
  id: string;
  duration: number;
  completedAt: string;
  type: 'focus' | 'short-break' | 'long-break';
  label: string;
}

export interface StudyStats {
  totalFocusTime: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  flashcardsReviewed: number;
  quizScores: number[];
  dailyLog: Record<string, number>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  pinnedTools: string[];
  pomodoroFocus: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  pomodoroSessionsBeforeLong: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  path: string;
  keywords: string[];
}

export interface GradeEntry {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

export interface GPAEntry {
  id: string;
  course: string;
  grade: string;
  gradePoint: number;
  credits: number;
}

export interface EssayPlan {
  id: string;
  title: string;
  subject: string;
  introduction: {
    hook: string;
    context: string;
    thesis: string;
  };
  bodyParagraphs: {
    id: string;
    topicSentence: string;
    evidence: string;
    explanation: string;
    example: string;
    link: string;
  }[];
  conclusion: {
    restateThesis: string;
    summarizePoints: string;
    finalThought: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PresentationSlide {
  id: string;
  title: string;
  keyPoints: string[];
  speakerNotes: string;
  visualIdea: string;
}

export interface Presentation {
  id: string;
  title: string;
  subject: string;
  slides: PresentationSlide[];
  createdAt: string;
  updatedAt: string;
}
