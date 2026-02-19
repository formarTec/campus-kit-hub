import { Wrench } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Manutencoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Manutenções"
        description="Controle de manutenções de PCs e equipamentos"
        icon={<Wrench className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Nova Manutenção"
      />
      <EmptyState
        icon={<Wrench className="h-6 w-6" />}
        title="Nenhuma manutenção registrada"
        description="Registre as manutenções realizadas e programe as próximas."
        action={<Button>Registrar Manutenção</Button>}
      />
    </div>
  );
}
