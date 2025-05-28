#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and update quiz files to add mandatory text field
function updateQuizFile(filePath) {
  console.log(`Updating quiz file: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find the JSON quiz section
  const jsonQuizMatch = content.match(/```json quiz\n([\s\S]*?)\n```/);
  
  if (!jsonQuizMatch) {
    console.log(`No quiz JSON found in ${filePath}`);
    return;
  }
  
  try {
    const quizData = JSON.parse(jsonQuizMatch[1]);
    
    // Update each question to add text field if it doesn't exist
    quizData.questions.forEach((question, index) => {
      if (!question.text) {
        // Extract text from question field if it contains "Texto" at the beginning
        if (question.question.startsWith('Texto')) {
          const parts = question.question.split('\n\n');
          if (parts.length >= 2) {
            // First part after "Texto" is the reference text
            const textStart = parts.findIndex(part => part.trim() !== 'Texto');
            if (textStart >= 0) {
              // Find where the actual question starts (usually marked by "Enunciado:" or similar)
              let textEnd = parts.length;
              for (let i = textStart; i < parts.length; i++) {
                if (parts[i].includes('Julgue o item') || 
                    parts[i].includes('Enunciado:') ||
                    parts[i].includes('Com base no texto')) {
                  textEnd = i;
                  break;
                }
              }
              
              question.text = parts.slice(textStart, textEnd).join('\n\n');
              question.question = parts.slice(textEnd).join('\n\n');
            }
          }
        } else {
          // If no text separation is clear, add a placeholder
          question.text = "Texto de referência não especificado para esta questão.";
        }
      }
    });
    
    // Replace the quiz JSON in the file
    const updatedJson = JSON.stringify(quizData, null, 2);
    const updatedContent = content.replace(
      /```json quiz\n[\s\S]*?\n```/,
      `\`\`\`json quiz\n${updatedJson}\n\`\`\``
    );
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Successfully updated ${filePath}`);
    
  } catch (error) {
    console.error(`Error parsing JSON in ${filePath}:`, error);
  }
}

// Update quiz files
const studyDir = path.join(__dirname, '..', 'study');
const quizFiles = [
  path.join(studyDir, 'acentuacao-grafica.md'),
  path.join(studyDir, 'tipologia-textual.md'),
  path.join(studyDir, 'compreensao-interpretacao-texto.md')
];

quizFiles.forEach(file => {
  if (fs.existsSync(file)) {
    updateQuizFile(file);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Quiz update completed!');
