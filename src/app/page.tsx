import { getStudyFiles } from '@/lib/study-utils';
import { StudyFilesList } from '@/components/study-files-list';

export default function Home() {
  const files = getStudyFiles();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Material de Estudo</h1>
      
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
