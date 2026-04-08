import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Monitor, Key, Music, DollarSign, Wrench } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Relatorios() {
  const { data: computers = [] } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const { data } = await supabase.from("computers").select("acquisition_type, value");
      return data || [];
    },
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["licenses_report"],
    queryFn: async () => {
      const { data } = await supabase.from("licenses").select("payment_type, purchase_price");
      return data || [];
    },
  });

  const { data: instruments = [] } = useQuery({
    queryKey: ["instruments"],
    queryFn: async () => {
      const { data } = await supabase.from("instruments").select("status");
      return data || [];
    },
  });

  const { data: financial = [] } = useQuery({
    queryKey: ["financial_records"],
    queryFn: async () => {
      const { data } = await supabase.from("financial_records").select("amount");
      return data || [];
    },
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_records").select("next_maintenance");
      return data || [];
    },
  });

  const comprados = computers.filter((c) => c.acquisition_type === "comprado").length;
  const doados = computers.filter((c) => c.acquisition_type === "doado").length;
  const totalAtivos = computers.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  const totalLicenses = licenses.reduce((sum, l) => sum + (Number(l.purchase_price) || 0), 0);
  const mensais = licenses.filter((l) => l.payment_type === "mensal").length;
  const anuais = licenses.filter((l) => l.payment_type === "anual").length;
  const vitalicios = licenses.filter((l) => l.payment_type === "vitalicio").length;
  const totalFinanceiro = financial.reduce((sum, f) => sum + Number(f.amount), 0);
  const pendentes = maintenance.filter((m) => m.next_maintenance && new Date(m.next_maintenance).getTime() <= Date.now()).length;

  const statusLabels: Record<string, string> = { disponivel: "Disponível", em_uso: "Em Uso", emprestado: "Emprestado", manutencao: "Manutenção" };
  const instrumentsByStatus = instruments.reduce((acc: Record<string, number>, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Relatórios" description="Relatórios gerenciais e financeiros" icon={<BarChart3 className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="stat-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> Equipamentos</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{computers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total investido: R$ {totalAtivos.toFixed(2)}</p>
            <div className="mt-2 flex gap-2 text-sm">
              <Badge variant="secondary">Comprados: {comprados}</Badge>
              <Badge variant="secondary">Doados: {doados}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Key className="h-4 w-4 text-accent" /> Licenças</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{licenses.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total investido: R$ {totalLicenses.toFixed(2)}</p>
            <div className="mt-2 flex flex-wrap gap-1 text-xs">
              <Badge variant="secondary">Mensal: {mensais}</Badge>
              <Badge variant="secondary">Anual: {anuais}</Badge>
              <Badge variant="secondary">Vitalício: {vitalicios}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Music className="h-4 w-4 text-warning" /> Instrumentos</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{instruments.length}</p>
            <div className="mt-2 flex flex-wrap gap-1 text-xs">
              {Object.entries(instrumentsByStatus).map(([status, count]) => (
                <Badge key={status} variant="secondary">{statusLabels[status]}: {count}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4 text-success" /> Financeiro</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">R$ {totalFinanceiro.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{financial.length} registros</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wrench className="h-4 w-4 text-destructive" /> Manutenções</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{maintenance.length}</p>
            {pendentes > 0 && <Badge variant="destructive" className="mt-2">{pendentes} atrasada(s)</Badge>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
