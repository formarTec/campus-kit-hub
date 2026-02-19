import { BarChart3 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Relatorios() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Relatórios"
        description="Relatórios gerenciais e financeiros"
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <EmptyState
        icon={<BarChart3 className="h-6 w-6" />}
        title="Sem dados suficientes"
        description="Os relatórios serão gerados automaticamente conforme os dados forem cadastrados no sistema."
      />
    </div>
  );
}
