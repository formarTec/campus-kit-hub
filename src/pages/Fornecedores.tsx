import { Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Fornecedores() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Fornecedores"
        description="Gerencie fornecedores de serviços e produtos"
        icon={<Users className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Fornecedor"
      />
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Nenhum fornecedor cadastrado"
        description="Cadastre os fornecedores com razão social, CNPJ, contatos e contratos."
        action={<Button>Cadastrar Fornecedor</Button>}
      />
    </div>
  );
}
