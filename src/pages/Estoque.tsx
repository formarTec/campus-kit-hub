import { Package } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Estoque() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Estoque (Almoxarifado)"
        description="Relação de equipamentos disponíveis e em uso"
        icon={<Package className="h-5 w-5" />}
      />
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Estoque vazio"
        description="Os equipamentos cadastrados aparecerão aqui com o status de disponibilidade."
      />
    </div>
  );
}
