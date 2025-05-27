'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'

interface PDFGeneratorProps {
  title: string
  content: string
  quizzes?: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }>
  includeAnswers?: boolean
}

const PDFGeneratorHTML: React.FC<PDFGeneratorProps> = ({ 
  title, 
  content, 
  quizzes = [], 
  includeAnswers = true 
}) => {
  // Função para converter markdown básico para HTML
  const markdownToHTML = (markdown: string): string => {
    // Primeiro, remover blocos de quiz
    let html = markdown.replace(/```json quiz[\s\S]*?```/g, '')
    
    // Remover comentários HTML
    html = html.replace(/<!--[\s\S]*?-->/g, '')
    
    // Headers (em ordem específica para evitar conflitos)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Links
    html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2" target="_blank">$1</a>')
    
    // Bold e Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code blocks (antes de inline code)
    html = html.replace(/```([^`]*)```/g, '<pre><code>$1</code></pre>')
    html = html.replace(/`([^`]*)`/g, '<code>$1</code>')
    
    // Listas com bullet points
    html = html.replace(/^[\s]*[-*] (.*$)/gim, '<li>$1</li>')
    
    // Listas numeradas
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    
    // Converter grupos de li em ul
    html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
    
    // Separadores horizontais
    html = html.replace(/^---$/gm, '<hr>')
    
    // Quebras de linha e parágrafos
    html = html.replace(/\n\n+/g, '</p><p>')
    html = html.replace(/\n/g, '<br>')
    
    // Limpar tags vazias
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<br><\/p>/g, '</p>')
    html = html.replace(/<p><br>/g, '<p>')
    
    // Envolver conteúdo em parágrafos se necessário
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre') && !html.startsWith('<hr')) {
      html = '<p>' + html + '</p>'
    }
    
    return html
  }

  // Função para formatar texto do quiz (igual à do quiz.tsx)
  const formatText = (text: string): string => {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
  }

  const generatePDF = async () => {
    try {
      // Criar o HTML estilizado
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
            font-size: 14px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .main-title {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 400;
        }
        
        .content-section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 20px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .content {
            background: #f8fafc;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1e40af;
            margin: 24px 0 16px 0;
        }
        
        h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1e40af;
            margin: 20px 0 12px 0;
        }
        
        h3 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin: 16px 0 8px 0;
        }
        
        h4 {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin: 14px 0 6px 0;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin: 12px 0;
            padding-left: 24px;
        }
        
        li {
            margin-bottom: 6px;
        }
        
        strong {
            font-weight: 600;
            color: #1f2937;
        }
        
        em {
            font-style: italic;
            color: #4b5563;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            border: 1px solid #e2e8f0;
        }
        
        pre {
            background: #f1f5f9;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            margin: 16px 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            border: none;
            font-size: 13px;
        }
        
        a {
            color: #3b82f6;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 24px 0;
        }
        
        .quiz-section {
            margin-top: 40px;
        }
        
        .quiz-question {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .question-number {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 12px;
        }
        
        .question-text {
            font-size: 15px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 16px;
            white-space: pre-wrap;
        }
        
        .options {
            margin-bottom: 16px;
        }
        
        .option {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .option-letter {
            font-weight: 600;
            color: #3b82f6;
            margin-right: 8px;
            min-width: 20px;
        }
        
        .option-text {
            flex: 1;
            white-space: pre-wrap;
        }
        
        .correct-answer {
            background: #dcfce7 !important;
            border-color: #16a34a !important;
        }
        
        .answer-section {
            margin-top: 16px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 6px;
            border: 1px solid #0284c7;
        }
        
        .answer-label {
            font-weight: 600;
            color: #0284c7;
            margin-bottom: 8px;
        }
        
        .explanation {
            color: #374151;
            white-space: pre-wrap;
        }
        
        @media print {
            body {
                padding: 20px;
                font-size: 12px;
            }
            
            .quiz-question {
                break-inside: avoid;
                margin-bottom: 20px;
            }
            
            .content-section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>    <div class="header">
        <h1 class="main-title">${title}</h1>
        <p class="subtitle">Material de Estudo • Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
    
    <div class="content-section">
        <h2 class="section-title">📚 Conteúdo do Material</h2>
        <div class="content">
            ${markdownToHTML(content)}
        </div>
    </div>
    
    ${quizzes.length > 0 ? `
    <div class="quiz-section">
        <h2 class="section-title">📝 Exercícios${includeAnswers ? ' e Respostas' : ''}</h2>
        ${quizzes.map((quiz, index) => `
            <div class="quiz-question">
                <div class="question-number">Questão ${index + 1}</div>
                <div class="question-text">${formatText(quiz.question)}</div>
                <div class="options">
                    ${quiz.options.map((option, optIndex) => `
                        <div class="option ${includeAnswers && optIndex === quiz.correctAnswer ? 'correct-answer' : ''}">
                            <span class="option-letter">${String.fromCharCode(65 + optIndex)})</span>
                            <span class="option-text">${formatText(option)}</span>
                        </div>
                    `).join('')}
                </div>
                ${includeAnswers ? `
                    <div class="answer-section">
                        <div class="answer-label">✅ Resposta Correta: ${String.fromCharCode(65 + quiz.correctAnswer)}</div>
                        ${quiz.explanation ? `<div class="explanation">${formatText(quiz.explanation)}</div>` : ''}
                    </div>
                ` : `
                    <div class="answer-section">
                        <div class="answer-label">Resposta: ___________</div>
                    </div>
                `}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>`

      // Criar uma nova janela para o PDF
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Popup bloqueado. Permita popups para gerar o PDF.')
      }

      printWindow.document.open()
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Aguardar o carregamento das fontes
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Configurar e imprimir
      printWindow.focus()
      printWindow.print()

      // Fechar a janela após um tempo
      setTimeout(() => {
        printWindow.close()
      }, 2000)

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const generateQuizOnly = async () => {
    if (quizzes.length === 0) {
      alert('Não há exercícios para gerar PDF.')
      return
    }

    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercícios - \${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
            font-size: 14px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .main-title {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 400;
        }
        
        .quiz-question {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .question-number {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 12px;
        }
        
        .question-text {
            font-size: 15px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 16px;
            white-space: pre-wrap;
        }
        
        .options {
            margin-bottom: 16px;
        }
        
        .option {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .option-letter {
            font-weight: 600;
            color: #3b82f6;
            margin-right: 8px;
            min-width: 20px;
        }
        
        .option-text {
            flex: 1;
            white-space: pre-wrap;
        }
        
        .answer-section {
            margin-top: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        
        .answer-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        @media print {
            body {
                padding: 20px;
                font-size: 12px;
            }
            
            .quiz-question {
                break-inside: avoid;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>    <div class="header">
        <h1 class="main-title">📝 Exercícios - ${title}</h1>
        <p class="subtitle">Lista de Exercícios • Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
    
    ${quizzes.map((quiz, index) => `
        <div class="quiz-question">
            <div class="question-number">Questão ${index + 1}</div>
            <div class="question-text">${formatText(quiz.question)}</div>
            <div class="options">
                ${quiz.options.map((option, optIndex) => `
                    <div class="option">
                        <span class="option-letter">${String.fromCharCode(65 + optIndex)})</span>
                        <span class="option-text">${formatText(option)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="answer-section">
                <div class="answer-label">Resposta: ___________</div>
            </div>
        </div>
    `).join('')}
</body>
</html>`

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Popup bloqueado. Permita popups para gerar o PDF.')
      }

      printWindow.document.open()
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      await new Promise(resolve => setTimeout(resolve, 1000))

      printWindow.focus()
      printWindow.print()

      setTimeout(() => {
        printWindow.close()
      }, 2000)

    } catch (error) {
      console.error('Erro ao gerar PDF dos exercícios:', error)
      alert('Erro ao gerar PDF dos exercícios. Tente novamente.')
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={generatePDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText size={16} />
        Baixar PDF Completo
      </Button>
      
      {quizzes.length > 0 && (
        <Button
          onClick={generateQuizOnly}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          PDF só Exercícios
        </Button>
      )}
    </div>
  )
}

export default PDFGeneratorHTML
