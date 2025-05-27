import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold mb-4">Material de Estudo Não Encontrado</h2>
      <p className="text-muted-foreground mb-8">
        O material de estudo que você está procurando não existe.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao Início</Link>
      </Button>
    </div>
  );
}
