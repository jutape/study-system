import { getStudyFileBySlug } from '@/lib/study-utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { Quiz as QuizComponent } from '@/components/quiz';
import PDFGeneratorHTML from '@/components/pdf-generator-html';
import { BookOpen, FileText, CheckSquare } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StudyPage({ params }: PageProps) {
  const { slug } = await params;
  const file = getStudyFileBySlug(slug);

  if (!file) {
    notFound();
  }
  return (
    <div className="container mx-auto py-10">      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" asChild>
          <Link href="/">← Voltar para Todas as Notas</Link>
        </Button>        <div className="flex items-center gap-2">
          <PDFGeneratorHTML 
            title={file.title} 
            content={file.content} 
            quizzes={file.quiz?.questions || []} 
            includeAnswers={true} 
          />
          
          {file.quiz && (
            <Button variant="outline" asChild>
              <Link href="#quiz" className="flex items-center">
                <CheckSquare className="mr-2 h-4 w-4" />
                Ir para Quiz
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <div className="sticky top-24 p-4 border rounded-lg bg-card">            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Índice</h3>
            </div>
            <Separator className="my-2" />
            <nav className="mt-4">
              <ul className="space-y-2 text-sm">
                {file.content.match(/^##\s+(.+)$/mg)?.map((heading, index) => {
                  const title = heading.replace(/^##\s+/, '');
                  const anchor = title.toLowerCase().replace(/[^\w]+/g, '-');
                  return (
                    <li key={index}>
                      <Link 
                        href={`#${anchor}`} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {title}
                      </Link>
                    </li>
                  );
                })}
                {file.quiz && (
                  <li className="mt-4">
                    <Link 
                      href="#quiz"
                      className="text-primary font-medium flex items-center"
                    >
                      <CheckSquare className="mr-1 h-4 w-4" />
                      {file.quiz.title}
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </aside>
        
        <div className="lg:col-span-9 order-1 lg:order-2">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold">{file.title}</h1>
            </div>
            
            <Separator className="my-4" />
            
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}                components={{
                  h2: ({ ...props }) => {
                    const id = props.children
                      ? props.children.toString().toLowerCase().replace(/[^\w]+/g, '-')
                      : '';
                    return <h2 id={id} {...props} className="scroll-mt-20" />;
                  },
                }}
              >
                {file.content}
              </ReactMarkdown>
            </article>
          </div>

          {file.quiz && (
            <div id="quiz" className="mt-12 pt-4 scroll-mt-20">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CheckSquare className="mr-2 h-5 w-5 text-primary" />
                  {file.quiz.title}
                </h2>
                <Separator className="my-4" />
                <QuizComponent quiz={file.quiz} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
