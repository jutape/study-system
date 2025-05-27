import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { StudyFile, Quiz } from '@/types';

const studyDirectory = path.join(process.cwd(), 'study');

export function getStudyFiles(): StudyFile[] {
  if (!fs.existsSync(studyDirectory)) {
    return [];
  }
  
  // Get file names under /study
  const fileNames = fs.readdirSync(studyDirectory);
  
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');
      
      // Read markdown file as string
      const fullPath = path.join(studyDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
        // Use gray-matter to parse the post metadata section
      const { content } = matter(fileContents);
      
      // Extract title from content (first heading)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName;      // Extract quiz from content if it exists
      let quizMatch = content.match(/```json quiz\s*\n([\s\S]*?)\n```/);
      if (!quizMatch) {
        quizMatch = content.match(/```json quiz\r?\n([\s\S]*?)\r?\n```/);
      }
      if (!quizMatch) {
        quizMatch = content.match(/```json quiz\s*([\s\S]*?)```/);
      }
      
      let quiz: Quiz | undefined = undefined;
      
      if (quizMatch && quizMatch[1]) {
        try {
          const jsonString = quizMatch[1].trim();
          quiz = JSON.parse(jsonString);
        } catch (error) {
          console.error(`Error parsing quiz in ${fileName}:`, error);
        }
      }
      
      // Clean content by removing the quiz part
      let cleanContent = content;
      if (quizMatch) {
        cleanContent = content.replace(/```json quiz\s*\r?\n[\s\S]*?\r?\n```/, '');
      }
      
      return {
        slug,
        fileName,
        title,
        content: cleanContent,
        quiz,
      };
    });
}

export function getStudyFileBySlug(slug: string): StudyFile | null {
  if (!fs.existsSync(studyDirectory)) {
    return null;
  }
  
  const fullPath = path.join(studyDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { content } = matter(fileContents);
  
  // Extract title from content (first heading)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slug;
    // Extract quiz from content if it exists
  let quizMatch = content.match(/```json quiz\s*\n([\s\S]*?)\n```/);
  if (!quizMatch) {
    quizMatch = content.match(/```json quiz\r?\n([\s\S]*?)\r?\n```/);
  }
  if (!quizMatch) {
    quizMatch = content.match(/```json quiz\s*([\s\S]*?)```/);
  }
  
  let quiz: Quiz | undefined = undefined;
  
  if (quizMatch && quizMatch[1]) {
    try {
      const jsonString = quizMatch[1].trim();
      quiz = JSON.parse(jsonString);
    } catch (error) {
      console.error(`Error parsing quiz in ${slug}.md:`, error);
    }
  }
  
  // Clean content by removing the quiz part
  let cleanContent = content;
  if (quizMatch) {
    cleanContent = content.replace(/```json quiz\s*\r?\n[\s\S]*?\r?\n```/, '');
  }
  
  return {
    slug,
    fileName: `${slug}.md`,
    title,
    content: cleanContent,
    quiz,
  };
}
