import { Bell } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Notificacoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notificações"
        description="Lembretes de manutenções, vencimentos e alertas"
        icon={<Bell className="h-5 w-5" />}
      />
      <EmptyState
        icon={<Bell className="h-6 w-6" />}
        title="Nenhuma notificação"
        description="Notificações sobre manutenções próximas, licenças vencendo e empréstimos aparecerão aqui."
      />
    </div>
  );
}
