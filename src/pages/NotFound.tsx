import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-bold text-primary/20">404</p>
        <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">A página que você procura não existe ou foi movida.</p>
        <Button asChild className="mt-6 gap-2">
          <Link to="/"><Home className="h-4 w-4" /> Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
