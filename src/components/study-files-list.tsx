'use client';

import { useState } from 'react';
import { StudyFile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';

interface StudyFilesListProps {
  files: StudyFile[];
}

export function StudyFilesList({ files }: StudyFilesListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = searchTerm 
    ? files.filter(file => 
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        file.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : files;

  return (
    <>
      <div className="flex justify-center mb-8">
        <SearchBar onSearch={setSearchTerm} />
      </div>
        {filteredFiles.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">Nenhum arquivo encontrado</h2>
          <p className="text-muted-foreground mt-2">
            Tente um termo de busca diferente ou verifique sua pasta <code className="bg-muted p-1 rounded">study</code>.
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')} 
              className="mt-4"
            >
              Limpar Pesquisa
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <Card key={file.slug} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="truncate">{file.title}</CardTitle>
                <CardDescription>{file.fileName}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground">
                  {file.content.substring(0, 150).replace(/[#*`]/g, '')}...
                </p>
              </CardContent>              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/study/${file.slug}`}>Ler Conteúdo</Link>
                </Button>
                {file.quiz && (
                  <Button asChild>
                    <Link href={`/study/${file.slug}#quiz`}>Fazer Quiz</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
