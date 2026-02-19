import { Building2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export default function Predios() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Prédios / Sedes"
        description="Gerencie as sedes e prédios da instituição"
        icon={<Building2 className="h-5 w-5" />}
        onAdd={() => {}}
        addLabel="Novo Prédio"
      />
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Nenhum prédio cadastrado"
        description="Adicione as sedes da instituição para organizar a localização dos equipamentos."
        action={<Button>Cadastrar Prédio</Button>}
      />
    </div>
  );
}
