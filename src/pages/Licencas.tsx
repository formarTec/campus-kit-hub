import { Key } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Licencas() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Licenças"
        description="Gerencie as licenças de software"
        icon={<Key className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Nova Licença"
      />
      <EmptyState
        icon={<Key className="h-6 w-6" />}
        title="Nenhuma licença cadastrada"
        description="Cadastre as licenças de software com chave, valor e tipo de pagamento."
        action={<Button>Cadastrar Licença</Button>}
      />
    </div>
  );
}
