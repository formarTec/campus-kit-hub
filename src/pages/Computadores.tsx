import { Monitor } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Computadores() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Computadores"
        description="Gerencie os computadores e suas especificações"
        icon={<Monitor className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Computador"
      />
      <EmptyState
        icon={<Monitor className="h-6 w-6" />}
        title="Nenhum computador cadastrado"
        description="Cadastre os computadores da instituição com suas especificações de hardware e software."
        action={<Button>Cadastrar Computador</Button>}
      />
    </div>
  );
}
