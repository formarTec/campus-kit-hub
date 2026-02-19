import { DollarSign } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Financeiro() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Financeiro"
        description="Controle financeiro de serviços, licenças e manutenções"
        icon={<DollarSign className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Registro"
      />
      <EmptyState
        icon={<DollarSign className="h-6 w-6" />}
        title="Nenhum registro financeiro"
        description="Registre pagamentos de fornecedores, licenças e serviços de manutenção."
        action={<Button>Novo Registro</Button>}
      />
    </div>
  );
}
