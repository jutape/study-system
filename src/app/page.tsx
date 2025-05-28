import { getStudyFiles } from '@/lib/study-utils';
import { StudyFilesList } from '@/components/study-files-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Home() {
  const files = getStudyFiles();
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center flex-1">Material de Estudo</h1>
        <Link href="/quiz-generator">
          <Button variant="outline" className="ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Criar Quiz
          </Button>
        </Link>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">Nenhum arquivo markdown encontrado</h2>
          <p className="text-muted-foreground mt-2">
            Coloque seus arquivos markdown na pasta <code className="bg-muted p-1 rounded">study</code>.
          </p>
        </div>
      ) : (
        <StudyFilesList files={files} />
      )}
    </div>
  );
}
