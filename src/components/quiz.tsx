'use client';

import { useState } from 'react';
import { Quiz as QuizType, Question as QuestionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';

// Função para formatar texto com quebras de linha e outros caracteres especiais
function formatText(text: string): React.ReactElement {
  // Substituir caracteres escapados
  let formattedText = text
    .replace(/\\n/g, '\n')  // Quebras de linha
    .replace(/\\"/g, '"')   // Aspas duplas
    .replace(/\\'/g, "'")   // Aspas simples
    .replace(/\\t/g, '\t'); // Tabs
  
  // Dividir por quebras de linha reais
  const parts = formattedText.split('\n');
  
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

interface QuizProps {
  quiz: QuizType;
}

export function Quiz({ quiz }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const restartQuiz = () => {
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const totalQuestions = quiz.questions.length;
  const answeredQuestions = userAnswers.filter((answer) => answer !== null).length;
  const correctAnswers = userAnswers.reduce((count: number, answer, index) => {
    return answer !== null && answer === quiz.questions[index].correctAnswer ? count + 1 : count;
  }, 0);

  if (showResults) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Resultados do Quiz</CardTitle>
          <CardDescription>
            Você acertou {correctAnswers} de {totalQuestions} questões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 leading-relaxed">
                    Questão {index + 1}: {formatText(question.question)}
                  </h4>
                    <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = userAnswer === optionIndex;
                      const isCorrectOption = optionIndex === question.correctAnswer;
                      
                      let className = "p-3 rounded border break-words ";
                      if (isSelected && isCorrect) {
                        className += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-100";
                      } else if (isSelected && !isCorrect) {
                        className += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-100";
                      } else if (isCorrectOption) {
                        className += "bg-green-50 border-green-300 text-green-700 dark:bg-green-950 dark:border-green-600 dark:text-green-200";
                      } else {
                        className += "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600";
                      }
                      
                      return (
                        <div key={optionIndex} className={className}>
                          <div className="flex items-start">
                            <span className="flex-shrink-0 mr-3 font-semibold">
                              {optionIndex === 0 && 'A.'}
                              {optionIndex === 1 && 'B.'}
                              {optionIndex === 2 && 'C.'}
                              {optionIndex === 3 && 'D.'}
                            </span>
                            <div className="flex items-start flex-1">
                              {isSelected && isCorrect && <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />}
                              {isSelected && !isCorrect && <XCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />}
                              {!isSelected && isCorrectOption && <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />}
                              <span className="leading-relaxed">{formatText(option)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>                  <div className="bg-blue-50 border border-blue-200 rounded p-3 dark:bg-blue-950 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-800 mb-1 dark:text-blue-200">Explicação:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{formatText(question.explanation)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={restartQuiz} className="w-full">
            Refazer Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-medium">
            Questão {currentQuestionIndex + 1} de {totalQuestions}
          </span>
          <div className="h-2 w-full mt-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <span className="text-sm font-medium">
          {answeredQuestions} de {totalQuestions} respondidas
        </span>
      </div>

      <QuestionCard 
        key={currentQuestionIndex}
        question={quiz.questions[currentQuestionIndex]} 
        index={currentQuestionIndex}
        selectedOption={userAnswers[currentQuestionIndex]}
        onSelectOption={(optionIndex) => handleAnswer(currentQuestionIndex, optionIndex)}
      />

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={userAnswers[currentQuestionIndex] === null}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
          {currentQuestionIndex !== totalQuestions - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionType;
  index: number;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
}

function QuestionCard({ question, index, selectedOption, onSelectOption }: QuestionCardProps) {
  const handleOptionClick = (optionIndex: number) => {
    onSelectOption(optionIndex);
  };

  return (    <Card className="shadow-md border">
      <CardHeader className="bg-muted/30">
        <CardTitle>Questão {index + 1}</CardTitle>
        <CardDescription className="text-lg mt-2 leading-relaxed">
          {formatText(question.question)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, optIndex) => (
            <Button
              key={optIndex}
              className={`justify-start h-auto py-4 px-6 text-left whitespace-normal leading-relaxed ${
                selectedOption === optIndex 
                  ? 'ring-2 ring-primary' 
                  : ''
              }`}
              variant={selectedOption === optIndex ? 'default' : 'outline'}
              onClick={() => handleOptionClick(optIndex)}
            >              <span className="flex-shrink-0 mr-2 font-semibold">
                {optIndex === 0 && 'A.'}
                {optIndex === 1 && 'B.'}
                {optIndex === 2 && 'C.'}
                {optIndex === 3 && 'D.'}
              </span>
              <span className="flex-1">{formatText(option)}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


