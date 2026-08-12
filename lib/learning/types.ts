/** Soft pastel theme — matches login feature-card palette. */
export interface LearningTone {
  bg: string;
  border: string;
  accent: string;
  button: string;
  buttonHover: string;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  duration: string;
  level: string;
  enrolled: number;
  rating: number;
  tone: LearningTone;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  type: string;
  duration: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: number;
  prompt: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  tone?: LearningTone;
}

export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  status: string;
  feedback: string;
}

export interface LearningNotification {
  id: number;
  title: string;
  detail: string;
}
