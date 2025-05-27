'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { StudyFile, Quiz } from '@/types';

interface PDFGeneratorProps {
  studyFile: StudyFile;
  quiz?: Quiz;
}

// Função para processar markdown e converter para texto estruturado
function processMarkdownContent(content: string): Array<{type: string, content: string, level?: number}> {
  // Remover blocos de quiz primeiro
  let cleanContent = content.replace(/```json quiz[\s\S]*?```/g, '');
  
  const lines = cleanContent.split('\n');
  const processedContent: Array<{type: string, content: string, level?: number}> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      // Linha vazia - adicionar espaço
      processedContent.push({type: 'space', content: ''});
      continue;
    }
    
    // Headers
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      processedContent.push({type: 'header', content: text, level});
      continue;
    }
    
    // Lista com bullets
    if (line.match(/^\s*[-*+]\s+/)) {
      const text = line.replace(/^\s*[-*+]\s+/, '');
      processedContent.push({type: 'bullet', content: text});
      continue;
    }
    
    // Lista numerada
    if (line.match(/^\s*\d+\.\s+/)) {
      const text = line.replace(/^\s*\d+\.\s+/, '');
      processedContent.push({type: 'numbered', content: text});
      continue;
    }
    
    // Código inline ou blocos
    if (line.startsWith('```') || line.includes('`')) {
      const text = line.replace(/`/g, '');
      processedContent.push({type: 'code', content: text});
      continue;
    }
    
    // Texto normal
    if (line.length > 0) {
      // Processar formatação inline
      let text = line
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/`(.*?)`/g, '$1') // Code inline
        .replace(/!\[.*?\]\(.*?\)/g, '[IMAGEM]') // Imagens
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
      
      processedContent.push({type: 'paragraph', content: text});
    }
  }
  
  return processedContent;
}

export function PDFGenerator({ studyFile, quiz }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
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
      const title = studyFile.title;
      const titleLines = pdf.splitTextToSize(title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 10;

      // Data de geração
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${date}`, margin, yPosition);
      yPosition += 15;

      // Linha separadora
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Conteúdo do markdown
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTEÚDO DO ESTUDO', margin, yPosition);
      yPosition += 15;

      // Processar conteúdo markdown
      const processedContent = processMarkdownContent(studyFile.content);
      
      for (const item of processedContent) {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - margin - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        
        switch (item.type) {
          case 'header':
            yPosition += 5; // Espaço antes do header
            if (item.level === 1) {
              pdf.setFontSize(16);
              pdf.setFont('helvetica', 'bold');
            } else if (item.level === 2) {
              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'bold');
            }
            
            const headerLines = pdf.splitTextToSize(item.content, contentWidth);
            headerLines.forEach((line: string) => {
              pdf.text(line, margin, yPosition);
              yPosition += (item.level === 1 ? 8 : 7);
            });
            yPosition += 5; // Espaço depois do header
            break;
            
          case 'paragraph':
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const paragraphLines = pdf.splitTextToSize(item.content, contentWidth);
            paragraphLines.forEach((line: string) => {
              if (yPosition > pageHeight - margin - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin, yPosition);
              yPosition += 6;
            });
            yPosition += 3; // Espaço entre parágrafos
            break;
            
          case 'bullet':
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const bulletText = `• ${item.content}`;
            const bulletLines = pdf.splitTextToSize(bulletText, contentWidth - 10);
            bulletLines.forEach((line: string, index: number) => {
              if (yPosition > pageHeight - margin - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin + (index === 0 ? 0 : 10), yPosition);
              yPosition += 6;
            });
            break;
            
          case 'numbered':
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const numberedLines = pdf.splitTextToSize(item.content, contentWidth - 15);
            numberedLines.forEach((line: string, index: number) => {
              if (yPosition > pageHeight - margin - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              if (index === 0) {
                pdf.text(`• ${line}`, margin, yPosition);
              } else {
                pdf.text(line, margin + 15, yPosition);
              }
              yPosition += 6;
            });
            break;
            
          case 'code':
            pdf.setFontSize(10);
            pdf.setFont('courier', 'normal');
            const codeLines = pdf.splitTextToSize(item.content, contentWidth - 10);
            codeLines.forEach((line: string) => {
              if (yPosition > pageHeight - margin - 20) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin + 5, yPosition);
              yPosition += 6;
            });
            yPosition += 3;
            break;
            
          case 'space':
            yPosition += 8;
            break;
        }
      }

      // Adicionar quiz se existir
      if (quiz && quiz.questions.length > 0) {
        // Nova página para o quiz
        pdf.addPage();
        yPosition = margin;

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('QUESTÕES PARA PRÁTICA', margin, yPosition);
        yPosition += 15;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        quiz.questions.forEach((question, index) => {
          // Verificar se precisa de nova página
          if (yPosition > pageHeight - margin - 60) {
            pdf.addPage();
            yPosition = margin;
          }

          // Número da questão
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}.`, margin, yPosition);
          yPosition += 8;

          // Texto da questão (formatado)
          pdf.setFont('helvetica', 'normal');
          let questionText = question.question
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\t/g, ' '); // Converter tabs em espaços
          
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

          yPosition += 10; // Espaço entre questões
        });

        // Adicionar espaço para respostas
        yPosition += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text('ESPAÇO PARA RESPOSTAS:', margin, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        for (let i = 0; i < quiz.questions.length; i++) {
          if (yPosition > pageHeight - margin - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`${i + 1}. ___________`, margin, yPosition);
          yPosition += 8;
        }
      }

      // Salvar o PDF
      const fileName = `${studyFile.title.replace(/[^a-zA-Z0-9]/g, '_')}_estudo.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      {isGenerating ? 'Gerando PDF...' : 'Imprimir PDF'}
    </Button>
  );
}
