'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { Quiz } from '@/types';

interface QuizPDFGeneratorProps {
  quiz: Quiz;
  studyTitle: string;
}

export function QuizPDFGenerator({ quiz, studyTitle }: QuizPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuizPDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Configurações de fonte
      pdf.setFont('helvetica', 'normal');
      
      // Título principal
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const title = `${quiz.title} - ${studyTitle}`;
      const titleLines = pdf.splitTextToSize(title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 10;

      // Data de geração
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${date}`, margin, yPosition);
      yPosition += 15;

      // Instruções
      pdf.setFontSize(11);
      pdf.text('Instruções: Responda às questões marcando a alternativa correta.', margin, yPosition);
      yPosition += 10;

      // Linha separadora
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Questões
      pdf.setFontSize(12);
      
      quiz.questions.forEach((question, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - margin - 80) {
          pdf.addPage();
          yPosition = margin;
        }

        // Número da questão
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}.`, margin, yPosition);
        yPosition += 8;        // Texto da questão (formatado)
        pdf.setFont('helvetica', 'normal');
        let questionText = question.question
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\t/g, ' ');
        
        const questionLines = pdf.splitTextToSize(questionText, contentWidth - 10);
        questionLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
        
        yPosition += 5;

        // Opções de resposta
        question.options.forEach((option, optionIndex) => {
          if (yPosition > pageHeight - margin - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D...
          const optionText = `${optionLetter}) ${option}`;
          const optionLines = pdf.splitTextToSize(optionText, contentWidth - 15);
          
          optionLines.forEach((line: string) => {
            pdf.text(line, margin + 10, yPosition);
            yPosition += 6;
          });
        });

        yPosition += 15; // Espaço entre questões
      });

      // Nova página para gabarito
      pdf.addPage();
      yPosition = margin;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GABARITO', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Criar gabarito em colunas
      const columns = 3;
      const columnWidth = contentWidth / columns;
      let currentColumn = 0;
      let columnYPosition = yPosition;

      quiz.questions.forEach((question, index) => {
        const correctLetter = String.fromCharCode(65 + question.correctAnswer);
        const gabaritoText = `${index + 1}. ${correctLetter}`;
        
        const xPosition = margin + (currentColumn * columnWidth);
        
        if (columnYPosition > pageHeight - margin - 20) {
          pdf.addPage();
          columnYPosition = margin;
          currentColumn = 0;
        }
        
        pdf.text(gabaritoText, xPosition, columnYPosition);
        
        currentColumn++;
        if (currentColumn >= columns) {
          currentColumn = 0;
          columnYPosition += 8;
        }
      });

      // Salvar o PDF
      const fileName = `${studyTitle.replace(/[^a-zA-Z0-9]/g, '_')}_quiz.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF do quiz:', error);
      alert('Erro ao gerar PDF do quiz. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateQuizPDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      {isGenerating ? 'Gerando Quiz...' : 'Quiz em PDF'}
    </Button>
  );
}
