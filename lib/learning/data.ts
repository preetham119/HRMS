import type { Assignment, Course, LearningNotification, Lesson, Quiz } from '@/lib/learning/types';
import { LEARNING_TONES } from '@/lib/learning/tones';

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Leadership Essentials',
    category: 'Leadership',
    description: 'Develop collaborative leadership habits for modern teams.',
    duration: '6 weeks',
    level: 'Intermediate',
    enrolled: 128,
    rating: 4.8,
    tone: LEARNING_TONES.blue,
  },
  {
    id: 2,
    title: 'React for Enterprise Teams',
    category: 'Engineering',
    description: 'Scale React applications with best practices and architecture.',
    duration: '4 weeks',
    level: 'Advanced',
    enrolled: 93,
    rating: 4.9,
    tone: LEARNING_TONES.violet,
  },
  {
    id: 3,
    title: 'Data Storytelling',
    category: 'Analytics',
    description: 'Learn to present insights in business-friendly narratives.',
    duration: '3 weeks',
    level: 'Beginner',
    enrolled: 82,
    rating: 4.7,
    tone: LEARNING_TONES.teal,
  },
  {
    id: 4,
    title: 'Introduction to AI',
    category: 'Engineering',
    description: 'Understand the foundations of artificial intelligence and practical business applications.',
    duration: '5 weeks',
    level: 'Beginner',
    enrolled: 76,
    rating: 4.8,
    tone: LEARNING_TONES.lavender,
  },
  {
    id: 5,
    title: 'Prompt Engineering',
    category: 'Engineering',
    description: 'Learn how to craft effective prompts for AI tools and improve output quality.',
    duration: '3 weeks',
    level: 'Beginner',
    enrolled: 61,
    rating: 4.7,
    tone: LEARNING_TONES.sky,
  },
  {
    id: 6,
    title: 'Playwright for Web Testing',
    category: 'Engineering',
    description: 'Build reliable browser automation and end-to-end tests with Playwright.',
    duration: '4 weeks',
    level: 'Intermediate',
    enrolled: 58,
    rating: 4.6,
    tone: LEARNING_TONES.amber,
  },
  {
    id: 7,
    title: 'Selenium Automation Essentials',
    category: 'Engineering',
    description: 'Master Selenium workflows for web automation and test execution.',
    duration: '4 weeks',
    level: 'Intermediate',
    enrolled: 54,
    rating: 4.5,
    tone: LEARNING_TONES.rose,
  },
  {
    id: 8,
    title: 'Machine Learning Fundamentals',
    category: 'Analytics',
    description: 'Explore core machine learning concepts, workflows, and real-world applications.',
    duration: '6 weeks',
    level: 'Intermediate',
    enrolled: 69,
    rating: 4.9,
    tone: LEARNING_TONES.mint,
  },
];

export const LESSONS: Lesson[] = [
  {
    id: 1,
    courseId: 2,
    title: 'Introduction to Design Systems',
    type: 'video',
    duration: '12 min',
    completed: false,
  },
  {
    id: 2,
    courseId: 2,
    title: 'Component Architecture',
    type: 'pdf',
    duration: '8 min',
    completed: true,
  },
  {
    id: 3,
    courseId: 1,
    title: 'Coaching Conversations',
    type: 'video',
    duration: '10 min',
    completed: false,
  },
];

export const QUIZZES: Quiz[] = [
  {
    id: 1,
    courseId: 2,
    title: 'React.js Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What is a React component?',
        options: ['A function or class', 'A CSS class', 'A database table', 'A browser tab'],
        answer: 0,
      },
      {
        id: 2,
        prompt: 'Which hook is used for state in functional components?',
        options: ['useEffect', 'useState', 'useMemo', 'useContext'],
        answer: 1,
      },
      {
        id: 3,
        prompt: 'What is JSX primarily used for in React?',
        options: ['Styling pages', 'Writing UI markup', 'Connecting to a database', 'Managing server logs'],
        answer: 1,
      },
      {
        id: 4,
        prompt: 'Why are keys important when rendering lists in React?',
        options: ['They improve CSS loading', 'They help React identify list items', 'They stop component re-renders', 'They encrypt data'],
        answer: 1,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.violet,
  },
  {
    id: 2,
    courseId: 4,
    title: 'Introduction to AI Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What does AI stand for?',
        options: ['Artificial Intelligence', 'Automated Input', 'Application Interface', 'Adaptive Internet'],
        answer: 0,
      },
      {
        id: 2,
        prompt: 'Which of these is a common AI application?',
        options: ['Manual data entry', 'Image recognition', 'Paper filing', 'Static documents'],
        answer: 1,
      },
      {
        id: 3,
        prompt: 'What helps AI systems improve over time?',
        options: ['More data', 'Less testing', 'No feedback', 'Fewer users'],
        answer: 0,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.lavender,
  },
  {
    id: 3,
    courseId: 5,
    title: 'Prompt Engineering Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What is prompt engineering?',
        options: ['Writing code for apps', 'Designing effective AI inputs', 'Managing servers', 'Creating databases'],
        answer: 1,
      },
      {
        id: 2,
        prompt: 'Why are clear instructions important in prompts?',
        options: ['They reduce accuracy', 'They help the AI understand the goal', 'They make responses shorter', 'They remove creativity'],
        answer: 1,
      },
      {
        id: 3,
        prompt: 'Which practice improves prompt quality?',
        options: ['Adding unrelated details', 'Giving context and constraints', 'Using vague language', 'Ignoring examples'],
        answer: 1,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.sky,
  },
  {
    id: 4,
    courseId: 6,
    title: 'Playwright Testing Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What is Playwright mainly used for?',
        options: ['Backend database design', 'Browser automation and testing', 'Cloud storage', 'Graphics editing'],
        answer: 1,
      },
      {
        id: 2,
        prompt: 'Which browser engines does Playwright support?',
        options: ['Only Chrome', 'Chromium, Firefox, and WebKit', 'Only Safari', 'Only Edge'],
        answer: 1,
      },
      {
        id: 3,
        prompt: 'What does a good UI test usually verify?',
        options: ['Only visual color', 'Core user flows', 'Printer settings', 'Server cooling'],
        answer: 1,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.amber,
  },
  {
    id: 5,
    courseId: 7,
    title: 'Selenium Automation Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What is Selenium used for?',
        options: ['Database administration', 'Web browser automation', 'Mobile app design', 'Graphic rendering'],
        answer: 1,
      },
      {
        id: 2,
        prompt: 'Which language is commonly used with Selenium?',
        options: ['Python', 'HTML', 'CSS', 'SQL'],
        answer: 0,
      },
      {
        id: 3,
        prompt: 'What is a typical Selenium use case?',
        options: ['Creating reports', 'Automating browser tasks', 'Managing infrastructure', 'Generating invoices'],
        answer: 1,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.rose,
  },
  {
    id: 6,
    courseId: 8,
    title: 'Machine Learning Fundamentals Quiz',
    questions: [
      {
        id: 1,
        prompt: 'What is machine learning?',
        options: ['Writing manual scripts', 'Teaching systems from data', 'Designing chips', 'Creating websites'],
        answer: 1,
      },
      {
        id: 2,
        prompt: 'What is a typical machine learning goal?',
        options: ['Reduce internet usage', 'Predict outcomes from data', 'Create backup files', 'Improve hardware speed'],
        answer: 1,
      },
      {
        id: 3,
        prompt: 'Why is training data important?',
        options: ['It powers the learning process', 'It replaces need for testing', 'It reduces code size', 'It creates databases'],
        answer: 0,
      },
    ],
    passingScore: 70,
    tone: LEARNING_TONES.mint,
  },
];

export const ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    courseId: 2,
    title: 'Design System Reflection',
    status: 'Pending',
    feedback: '',
  },
  {
    id: 2,
    courseId: 1,
    title: 'Leadership Journal',
    status: 'Reviewed',
    feedback: 'Excellent insights into team coaching.',
  },
];

export const LEARNING_NOTIFICATIONS: LearningNotification[] = [
  { id: 1, title: 'New course published', detail: 'React for Enterprise Teams is now live.' },
  { id: 2, title: 'Reminder', detail: 'Submit your leadership assignment before Friday.' },
];

export const COURSE_CATEGORIES = ['All', 'Leadership', 'Engineering', 'Analytics'] as const;

export const WEEKLY_HOURS = [
  { name: 'Mon', hours: 3 },
  { name: 'Tue', hours: 4 },
  { name: 'Wed', hours: 2 },
  { name: 'Thu', hours: 5 },
  { name: 'Fri', hours: 4 },
];

export const COMPLETION_STATS = [
  { name: 'Completed', value: 72, color: 'bg-brand-600' },
  { name: 'In Progress', value: 18, color: 'bg-sky-400' },
  { name: 'Planned', value: 10, color: 'bg-slate-300' },
];

export function getCourseById(id: number) {
  return COURSES.find((course) => course.id === id);
}

export function getLessonsForCourse(courseId: number) {
  return LESSONS.filter((lesson) => lesson.courseId === courseId);
}

export function getQuizById(id: number) {
  return QUIZZES.find((quiz) => quiz.id === id);
}

export function getQuizzesForCourse(courseId: number) {
  return QUIZZES.filter((quiz) => quiz.courseId === courseId);
}

export function getRelatedCourses(courseId: number, limit = 3) {
  const course = getCourseById(courseId);
  if (!course) return COURSES.slice(0, limit);

  const sameCategory = COURSES.filter((item) => item.id !== courseId && item.category === course.category);
  const others = COURSES.filter((item) => item.id !== courseId && item.category !== course.category);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getRelatedQuizzes(quizId: number, limit = 3) {
  const quiz = getQuizById(quizId);
  if (!quiz) return QUIZZES.slice(0, limit);

  const sameCourse = QUIZZES.filter((item) => item.id !== quizId && item.courseId === quiz.courseId);
  const others = QUIZZES.filter((item) => item.id !== quizId && item.courseId !== quiz.courseId);
  return [...sameCourse, ...others].slice(0, limit);
}

export function getFeaturedQuizzes(limit = 4) {
  return QUIZZES.slice(0, limit);
}

export function getFeaturedCourses(limit = 4) {
  return COURSES.slice(0, limit);
}
