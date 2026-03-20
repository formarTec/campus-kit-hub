import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardCheck, Check, X, AlertCircle, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  presente: "Presente", ausente: "Ausente", justificado: "Justificado",
};
const statusColors: Record<string, string> = {
  presente: "bg-success/10 text-success", ausente: "bg-destructive/10 text-destructive", justificado: "bg-warning/10 text-warning",
};

export default function ChamadaLancar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const [selectedClass, setSelectedClass] = useState(searchParams.get("aula") || "");
  const [selectedDate, setSelectedDate] = useState(searchParams.get("data") || new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const aula = searchParams.get("aula");
    const data = searchParams.get("data");
    if (aula) setSelectedClass(aula);
    if (data) setSelectedDate(data);
  }, [searchParams]);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: classStudents = [] } = useQuery({
    queryKey: ["class_students", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const { data, error } = await supabase.from("class_students").select("*, students(id, name)").eq("class_id", selectedClass);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedClass,
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance_records", selectedClass, selectedDate],
    queryFn: async () => {
      if (!selectedClass || !selectedDate) return [];
      const { data, error } = await supabase.from("attendance_records")
        .select("*")
        .eq("class_id", selectedClass)
        .eq("date", selectedDate);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedClass && !!selectedDate,
  });

  const attendanceMap = useMemo(() => {
    const map: Record<string, { id: string; status: string }> = {};
    attendanceRecords.forEach((r: any) => { map[r.student_id] = { id: r.id, status: r.status }; });
    return map;
  }, [attendanceRecords]);

  const markAttendance = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const existing = attendanceMap[studentId];
      if (existing) {
        const { error } = await supabase.from("attendance_records").update({ status }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance_records").insert({
          class_id: selectedClass, student_id: studentId, date: selectedDate, status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance_records", selectedClass, selectedDate] });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const markAll = useMutation({
    mutationFn: async (status: string) => {
      const studentsToMark = classStudents.filter((cs: any) => cs.students);
      for (const cs of studentsToMark) {
        const existing = attendanceMap[cs.students.id];
        if (existing) {
          await supabase.from("attendance_records").update({ status }).eq("id", existing.id);
        } else {
          await supabase.from("attendance_records").insert({
            class_id: selectedClass, student_id: cs.students.id, date: selectedDate, status,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance_records", selectedClass, selectedDate] });
      toast({ title: "Chamada registrada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const summary = useMemo(() => {
    const total = classStudents.filter((cs: any) => cs.students).length;
    const presentes = Object.values(attendanceMap).filter(a => a.status === "presente").length;
    const ausentes = Object.values(attendanceMap).filter(a => a.status === "ausente").length;
    const justificados = Object.values(attendanceMap).filter(a => a.status === "justificado").length;
    return { total, presentes, ausentes, justificados };
  }, [classStudents, attendanceMap]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chamada")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lançar Chamada</h1>
          <p className="text-sm text-muted-foreground">Registre a presença dos alunos</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Aula *</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger><SelectValue placeholder="Selecione a aula" /></SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
          {selectedClass && classStudents.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll.mutate("presente")} disabled={markAll.isPending}>
                <Check className="h-4 w-4 mr-1" /> Todos Presentes
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll.mutate("ausente")} disabled={markAll.isPending}>
                <X className="h-4 w-4 mr-1" /> Todos Ausentes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {selectedClass && classStudents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{summary.presentes}</p>
            <p className="text-xs text-muted-foreground">Presentes</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{summary.ausentes}</p>
            <p className="text-xs text-muted-foreground">Ausentes</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{summary.justificados}</p>
            <p className="text-xs text-muted-foreground">Justificados</p>
          </div>
        </div>
      )}

      {/* Attendance table */}
      {!selectedClass ? (
        <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="Selecione uma aula" description="Escolha uma aula e a data para lançar a chamada." />
      ) : classStudents.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="Nenhum aluno matriculado" description="Matricule alunos na aula antes de fazer a chamada." />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-56">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classStudents.map((cs: any) => {
                if (!cs.students) return null;
                const current = attendanceMap[cs.students.id];
                return (
                  <TableRow key={cs.id}>
                    <TableCell className="font-medium">{cs.students.name}</TableCell>
                    <TableCell>
                      {current ? (
                        <Badge className={statusColors[current.status]}>
                          {current.status === "presente" && <Check className="h-3 w-3 mr-1" />}
                          {current.status === "ausente" && <X className="h-3 w-3 mr-1" />}
                          {current.status === "justificado" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {statusLabels[current.status]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant={current?.status === "presente" ? "default" : "outline"}
                          className="h-8 px-3 text-xs"
                          onClick={() => markAttendance.mutate({ studentId: cs.students.id, status: "presente" })}
                          disabled={markAttendance.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" /> Presente
                        </Button>
                        <Button
                          size="sm" variant={current?.status === "ausente" ? "destructive" : "outline"}
                          className="h-8 px-3 text-xs"
                          onClick={() => markAttendance.mutate({ studentId: cs.students.id, status: "ausente" })}
                          disabled={markAttendance.isPending}
                        >
                          <X className="h-3 w-3 mr-1" /> Ausente
                        </Button>
                        <Button
                          size="sm" variant={current?.status === "justificado" ? "secondary" : "outline"}
                          className="h-8 px-3 text-xs"
                          onClick={() => markAttendance.mutate({ studentId: cs.students.id, status: "justificado" })}
                          disabled={markAttendance.isPending}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> Just.
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Back button */}
      {selectedClass && classStudents.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate("/chamada")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Consultas
          </Button>
        </div>
      )}
    </div>
  );
}
