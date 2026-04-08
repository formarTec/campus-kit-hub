import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Monitor, Music } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabels: Record<string, string> = {
  disponivel: "Disponível", em_uso: "Em Uso", emprestado: "Emprestado", manutencao: "Manutenção",
};
const statusColors: Record<string, string> = {
  disponivel: "bg-success/10 text-success", em_uso: "bg-info/10 text-info",
  emprestado: "bg-warning/10 text-warning", manutencao: "bg-destructive/10 text-destructive",
};

export default function Estoque() {
  const { data: computers = [] } = useQuery<any[]>({
    queryKey: ["computers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("computers").select("*, buildings(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: instruments = [] } = useQuery<any[]>({
    queryKey: ["instruments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instruments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const computersInUse = computers.filter((c) => c.in_use).length;
  const computersAvailable = computers.filter((c) => !c.in_use).length;

  const instrumentsByStatus = instruments.reduce<Record<string, number>>((acc, instrument) => {
    const status = instrument.status || "desconhecido";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {
    disponivel: 0,
    em_uso: 0,
    emprestado: 0,
    manutencao: 0,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Estoque (Almoxarifado)" description="Visão geral dos equipamentos disponíveis e em uso" icon={<Package className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{computers.length}</p>
                <p className="text-sm text-muted-foreground">Equipamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{computersAvailable}</p>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{computersInUse}</p>
                <p className="text-sm text-muted-foreground">Em Uso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{instruments.length}</p>
                <p className="text-sm text-muted-foreground">Instrumentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(instrumentsByStatus).map(([status, count]) => (
          <Card key={status} className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Monitor className="h-5 w-5" /> Equipamentos</h2>
        {computers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado.</p>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Prédio</TableHead>
                  <TableHead className="hidden md:table-cell">Local</TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.buildings?.name || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.location || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs">{c.ip_address || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Music className="h-5 w-5" /> Instrumentos</h2>
        {instruments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum instrumento cadastrado.</p>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Marca</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instruments.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{[i.brand, i.model].filter(Boolean).join(" ") || "—"}</TableCell>
                    <TableCell><Badge className={statusColors[i.status]}>{statusLabels[i.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
