export interface StudyFile {
  slug: string;
  fileName: string;
  title: string;
  content: string;
  quiz?: Quiz;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
