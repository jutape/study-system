#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to generate a slug from a title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

// Function to create a template markdown file
function createMarkdownTemplate(title, content = '', quiz = null) {
  let template = `# ${title}\n\n${content}\n\n`;
  
  if (quiz) {
    const quizTemplate = {
      title: quiz.title || `${title} Quiz`,
      questions: quiz.questions || [
        {
          question: "Sample question?",
          options: [
            "Option 1",
            "Option 2",
            "Option 3",
            "Option 4"
          ],
          correctAnswer: 0,
          explanation: "Explanation for the correct answer"
        }
      ]
    };
    
    template += "```json quiz\n";
    template += JSON.stringify(quizTemplate, null, 2);
    template += "\n```";
  }
  
  return template;
}

// Main function
function main() {
  console.log('Create New Study Material\n');
  
  rl.question('Enter the title for your study material: ', (title) => {
    const slug = generateSlug(title);
    const fileName = `${slug}.md`;
    const filePath = path.join(process.cwd(), 'study', fileName);
    
    rl.question('Include a basic quiz template? (y/n): ', (includeQuiz) => {
      const quiz = includeQuiz.toLowerCase() === 'y' ? { title: `${title} Quiz` } : null;
      
      const template = createMarkdownTemplate(title, '', quiz);
      
      // Ensure the study directory exists
      const studyDir = path.join(process.cwd(), 'study');
      if (!fs.existsSync(studyDir)) {
        fs.mkdirSync(studyDir);
      }
      
      // Write the file
      fs.writeFileSync(filePath, template);
      
      console.log(`\nStudy material created at: ${filePath}`);
      console.log('You can now edit this file to add your content!');
      
      rl.close();
    });
  });
}

// Run the main function
main();
