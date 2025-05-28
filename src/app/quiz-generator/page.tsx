'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

interface Question {
  text: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: Question[];
}

export default function QuizGeneratorPage() {  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    questions: [
      {
        text: '',
        question: '',
        options: ['Certo', 'Errado'],
        correctAnswer: 0,
        explanation: ''
      }
    ]
  });

  const [copied, setCopied] = useState(false);

  const updateQuizTitle = (title: string) => {
    setQuiz(prev => ({ ...prev, title }));
  };
  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      question: '',
      options: ['Certo', 'Errado'],
      correctAnswer: 0,
      explanation: ''
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length > 1) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };
  const updateQuestion = (questionIndex: number, field: keyof Question, value: string | number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const generateJson = () => {
    const cleanQuiz = {
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        ...(q.text.trim() ? { text: q.text } : {}),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    };
    
    return JSON.stringify(cleanQuiz, null, 2);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateJson());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };
  const isQuestionValid = (question: Question) => {
    return (
      question.question.trim() !== '' &&
      question.explanation.trim() !== ''
    );
  };

  const isQuizValid = () => {
    return (
      quiz.title.trim() !== '' &&
      quiz.questions.every(isQuestionValid)
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Quiz JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">              {/* Título do Quiz */}
              <div className="space-y-2">
                <Label htmlFor="quiz-title">
                  Título do Quiz *
                </Label>
                <Input
                  id="quiz-title"
                  value={quiz.title}
                  onChange={(e) => updateQuizTitle(e.target.value)}
                  placeholder="Digite o título do quiz..."
                />
              </div>

              <Separator />

              {/* Questões */}
              <div className="space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Questão {questionIndex + 1}
                        </CardTitle>
                        {quiz.questions.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(questionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">                      {/* Texto de Referência */}
                      <div className="space-y-2">
                        <Label htmlFor={`text-${questionIndex}`}>
                          Texto de Referência (opcional)
                        </Label>
                        <Textarea
                          id={`text-${questionIndex}`}
                          value={question.text}
                          onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                          placeholder="Digite o texto de referência..."
                          className="min-h-[100px] resize-vertical"
                          rows={4}
                        />
                      </div>

                      {/* Pergunta */}
                      <div className="space-y-2">
                        <Label htmlFor={`question-${questionIndex}`}>
                          Pergunta *
                        </Label>
                        <Textarea
                          id={`question-${questionIndex}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                          placeholder="Digite a pergunta..."
                          className="min-h-[80px] resize-vertical"
                          rows={3}
                        />
                      </div>                      {/* Opções */}
                      <div className="space-y-2">
                        <Label>
                          Resposta Correta *
                        </Label>
                        <RadioGroup
                          value={question.correctAnswer.toString()}
                          onValueChange={(value) => updateQuestion(questionIndex, 'correctAnswer', parseInt(value))}
                          className="space-y-2"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-3">
                              <RadioGroupItem 
                                value={optionIndex.toString()} 
                                id={`option-${questionIndex}-${optionIndex}`}
                              />
                              <Label 
                                htmlFor={`option-${questionIndex}-${optionIndex}`}
                                className="font-medium text-sm min-w-[60px] px-3 py-2  rounded border cursor-pointer"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground">
                          Selecione a resposta correta
                        </p>
                      </div>

                      {/* Explicação */}
                      <div className="space-y-2">
                        <Label htmlFor={`explanation-${questionIndex}`}>
                          Explicação *
                        </Label>
                        <Textarea
                          id={`explanation-${questionIndex}`}
                          value={question.explanation}
                          onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                          placeholder="Digite a explicação da resposta correta..."
                          className="min-h-[80px] resize-vertical"
                          rows={3}
                        />
                      </div>

                      {/* Status da validação */}
                      <div className="flex items-center space-x-2 text-sm">
                        {isQuestionValid(question) ? (
                          <span className="text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Questão válida
                          </span>
                        ) : (
                          <span className="text-red-600">
                            ⚠️ Preencha todos os campos obrigatórios
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Adicionar Questão */}
              <Button
                onClick={addQuestion}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview do JSON */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Preview do JSON</CardTitle>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  disabled={!isQuizValid()}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar JSON
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!isQuizValid() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Complete todos os campos obrigatórios para gerar o JSON válido
                  </p>
                </div>
              )}
              <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-[70vh] dark:bg-gray-800 dark:text-gray-100">
                <code>{generateJson()}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
