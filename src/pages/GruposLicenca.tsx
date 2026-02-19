import { FolderOpen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function GruposLicenca() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Grupos de Licença"
        description="Organize as licenças por categorias"
        icon={<FolderOpen className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Grupo"
      />
      <EmptyState
        icon={<FolderOpen className="h-6 w-6" />}
        title="Nenhum grupo cadastrado"
        description="Crie grupos para organizar licenças (Windows, Office, VPS, etc)."
        action={<Button>Criar Grupo</Button>}
      />
    </div>
  );
}
