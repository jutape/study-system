# Study Markdown Application

This is a Next.js application that allows you to:

1. Browse and read markdown files from the `study` folder
2. Extract titles and content from the markdown files
3. Generate interactive quizzes based on JSON data at the end of markdown files

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## How to Use

### Creating Study Content

1. Place your markdown files in the `study` folder
2. Each file should have a title as the first h1 header (e.g., `# Title Here`)
3. At the end of the file, add a quiz in JSON format surrounded by triple backticks with "json quiz" annotation:

```json quiz
{
  "title": "Your Quiz Title",
  "questions": [
    {
      "question": "Question text here",
      "options": [
        "Option 1", 
        "Option 2", 
        "Option 3", 
        "Option 4"
      ],
      "correctAnswer": 1,  // Index of the correct answer (starting from 0)
      "explanation": "Explanation of why this answer is correct"
    },
    // More questions...
  ]
}
```

### Features

- Browse all markdown files on the home page
- Search for study content by title or content
- Read individual study content with proper markdown formatting
- Dark/light mode support for better reading experience
- Interactive table of contents for easy navigation
- Take interactive quizzes with immediate feedback and progress tracking
- View explanations for correct and incorrect answers
- Comprehensive results summary after completing quizzes

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- gray-matter (for markdown parsing)
- react-markdown (for rendering markdown)

## Project Structure

- `/study` - Contains all markdown study files
- `/src/app` - Next.js application pages
- `/src/components` - React components including the Quiz component
- `/src/lib` - Utility functions for working with markdown files
- `/src/types` - TypeScript interfaces

## Adding More Content

There are two ways to add new study materials:

1. **Manually**: Simply add new markdown files to the `study` folder with the proper format, and they will automatically appear in the application.

2. **Using the helper script**: Run the following command and follow the prompts:

```bash
npm run new-study
```

This will create a new markdown file with the basic structure and an optional quiz template.
