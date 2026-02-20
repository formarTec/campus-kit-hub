import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

export default function Notificacoes() {
  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_records").select("*, computers(name)").order("next_maintenance");
      if (error) throw error;
      return data;
    },
  });

  const { data: loans = [] } = useQuery({
    queryKey: ["instrument_loans_pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instrument_loans")
        .select("*, instruments(name)")
        .is("actual_return", null)
        .order("expected_return");
      if (error) throw error;
      return data;
    },
  });

  const today = new Date();

  const maintenanceAlerts = maintenance
    .filter((m) => m.next_maintenance)
    .map((m: any) => ({ ...m, diff: differenceInDays(new Date(m.next_maintenance), today) }))
    .filter((m) => m.diff <= 30)
    .sort((a, b) => a.diff - b.diff);

  const loanAlerts = loans
    .filter((l: any) => l.expected_return)
    .map((l: any) => ({ ...l, diff: differenceInDays(new Date(l.expected_return), today) }))
    .sort((a: any, b: any) => a.diff - b.diff);

  const hasNotifications = maintenanceAlerts.length > 0 || loanAlerts.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notificações" description="Lembretes de manutenções e empréstimos" icon={<Bell className="h-5 w-5" />} />

      {!hasNotifications ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-semibold">Tudo em dia!</h3>
            <p className="text-sm text-muted-foreground mt-1">Nenhuma notificação pendente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {maintenanceAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Manutenções</h2>
              {maintenanceAlerts.map((m: any) => (
                <Card key={m.id} className={`glass-card border-l-4 ${m.diff < 0 ? "border-l-destructive" : m.diff <= 7 ? "border-l-warning" : "border-l-info"}`}>
                  <CardContent className="flex items-start gap-3 py-4">
                    {m.diff < 0 ? <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> : <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{m.computers?.name || "Equipamento"}</p>
                        {m.diff < 0 ? <Badge variant="destructive">{Math.abs(m.diff)} dias atrasada</Badge> : m.diff === 0 ? <Badge className="bg-warning text-warning-foreground">Hoje</Badge> : <Badge variant="secondary">Em {m.diff} dias</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Próxima: {format(new Date(m.next_maintenance), "dd/MM/yyyy")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {loanAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Empréstimos Pendentes</h2>
              {loanAlerts.map((l: any) => (
                <Card key={l.id} className={`glass-card border-l-4 ${l.diff < 0 ? "border-l-destructive" : l.diff <= 7 ? "border-l-warning" : "border-l-info"}`}>
                  <CardContent className="flex items-start gap-3 py-4">
                    {l.diff < 0 ? <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> : <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{l.instruments?.name}</p>
                        <span className="text-sm text-muted-foreground">→ {l.student_name}</span>
                        {l.diff < 0 ? <Badge variant="destructive">{Math.abs(l.diff)} dias atrasado</Badge> : l.diff === 0 ? <Badge className="bg-warning text-warning-foreground">Vence hoje</Badge> : <Badge variant="secondary">Em {l.diff} dias</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Devolução: {format(new Date(l.expected_return), "dd/MM/yyyy")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
