import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardCheck, Search, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Chamada() {
  const navigate = useNavigate();
  const [filterClass, setFilterClass] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance_summary", filterClass, filterDate],
    queryFn: async () => {
      let query = supabase.from("attendance_records").select("*, classes(name), students(name)").order("date", { ascending: false });
      if (filterClass) query = query.eq("class_id", filterClass);
      if (filterDate) query = query.eq("date", filterDate);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, { class_id: string; class_name: string; date: string; total: number; presentes: number; ausentes: number; justificados: number }>();
    records.forEach((r: any) => {
      const key = `${r.class_id}_${r.date}`;
      if (!map.has(key)) {
        map.set(key, { class_id: r.class_id, class_name: r.classes?.name || "—", date: r.date, total: 0, presentes: 0, ausentes: 0, justificados: 0 });
      }
      const g = map.get(key)!;
      g.total++;
      if (r.status === "presente") g.presentes++;
      else if (r.status === "ausente") g.ausentes++;
      else if (r.status === "justificado") g.justificados++;
    });
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Chamada"
        description="Consulta e registro de presença dos alunos"
        icon={<ClipboardCheck className="h-5 w-5" />}
        onAdd={() => navigate("/chamada/lancar")}
        addLabel="Lançar Chamada"
      />

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Filtrar por Aula</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger><SelectValue placeholder="Todas as aulas" /></SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filtrar por Data</Label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div>
            <Button variant="outline" onClick={() => { setFilterClass(""); setFilterDate(""); }}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Summary table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-6 w-6" />}
          title="Nenhuma chamada registrada"
          description="Lance a chamada de uma aula para começar."
          action={<Button onClick={() => navigate("/chamada/lancar")}><Plus className="h-4 w-4 mr-2" /> Lançar Chamada</Button>}
        />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Presentes</TableHead>
                <TableHead className="text-center">Ausentes</TableHead>
                <TableHead className="text-center">Justificados</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grouped.map((g) => (
                <TableRow key={`${g.class_id}_${g.date}`}>
                  <TableCell className="font-medium">{g.class_name}</TableCell>
                  <TableCell>{format(new Date(g.date + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-center"><Badge className="bg-success/10 text-success">{g.presentes}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className="bg-destructive/10 text-destructive">{g.ausentes}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className="bg-warning/10 text-warning">{g.justificados}</Badge></TableCell>
                  <TableCell className="text-center">{g.total}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/chamada/lancar?aula=${g.class_id}&data=${g.date}`)}>
                      <Eye className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
