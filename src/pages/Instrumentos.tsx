import { Music } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Instrumentos() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Instrumentos Musicais"
        description="Cadastro e empréstimos de instrumentos e equipamentos musicais"
        icon={<Music className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Instrumento"
      />
      <EmptyState
        icon={<Music className="h-6 w-6" />}
        title="Nenhum instrumento cadastrado"
        description="Cadastre instrumentos, microfones, caixas de som e mesas de som para controle de inventário e empréstimos."
        action={<Button>Cadastrar Instrumento</Button>}
      />
    </div>
  );
}
