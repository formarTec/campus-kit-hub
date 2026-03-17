import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Pencil, Trash2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const dayLabels: Record<number, string> = {
  0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado",
};

export default function Aulas() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", day_of_week: "", start_time: "", end_time: "", instructor: "",
  });

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("day_of_week").order("start_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students_active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, name").eq("status", "ativo").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["class_students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_students").select("*, students(name)");
      if (error) throw error;
      return data as any[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        day_of_week: form.day_of_week ? parseInt(form.day_of_week) : null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        instructor: form.instructor || null,
      };
      if (editingId) {
        const { error } = await supabase.from("classes").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("classes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); setDialogOpen(false); toast({ title: editingId ? "Aula atualizada!" : "Aula cadastrada!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("classes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); setDeleteId(null); toast({ title: "Aula removida!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const enroll = useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      const { error } = await supabase.from("class_students").insert({ class_id: classId, student_id: studentId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class_students"] }); toast({ title: "Aluno matriculado!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const unenroll = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("class_students").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["class_students"] }); toast({ title: "Matrícula removida!" }); },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", day_of_week: "", start_time: "", end_time: "", instructor: "" });
    setDialogOpen(true);
  }

  function openEdit(c: any) {
    setEditingId(c.id);
    setForm({
      name: c.name, description: c.description ?? "", day_of_week: c.day_of_week?.toString() ?? "",
      start_time: c.start_time ?? "", end_time: c.end_time ?? "", instructor: c.instructor ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  function getClassEnrollments(classId: string) {
    return enrollments.filter((e: any) => e.class_id === classId);
  }

  function getEnrolledStudentIds(classId: string) {
    return new Set(getClassEnrollments(classId).map((e: any) => e.student_id));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Aulas" description="Gestão de aulas e turmas" icon={<BookOpen className="h-5 w-5" />} onAdd={openCreate} addLabel="Nova Aula" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : classes.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Nenhuma aula cadastrada" description="Cadastre aulas e turmas." action={<Button onClick={openCreate}>Nova Aula</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead className="hidden md:table-cell">Dia</TableHead>
                <TableHead className="hidden md:table-cell">Horário</TableHead>
                <TableHead className="hidden lg:table-cell">Instrutor</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.day_of_week != null ? dayLabels[c.day_of_week] : "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.start_time && c.end_time ? `${c.start_time.slice(0, 5)} - ${c.end_time.slice(0, 5)}` : c.start_time?.slice(0, 5) || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{c.instructor || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getClassEnrollments(c.id).length}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEnrollDialog(c.id)} title="Gerenciar alunos"><Users className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Class form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Editar Aula" : "Nova Aula"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Nome da Aula *</Label><Input required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex: Violão Iniciante" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select value={form.day_of_week} onValueChange={(v) => setField("day_of_week", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(dayLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Instrutor</Label><Input value={form.instructor} onChange={(e) => setField("instructor", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Início</Label><Input type="time" value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} /></div>
              <div className="space-y-2"><Label>Término</Label><Input type="time" value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enrollment dialog */}
      <Dialog open={!!enrollDialog} onOpenChange={() => setEnrollDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Alunos Matriculados</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {enrollDialog && (
              <>
                <div className="space-y-2">
                  {getClassEnrollments(enrollDialog).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-2 px-3">
                      <span className="text-sm">{e.students?.name || "—"}</span>
                      <Button variant="ghost" size="sm" onClick={() => unenroll.mutate(e.id)} className="text-destructive h-7 px-2">Remover</Button>
                    </div>
                  ))}
                  {getClassEnrollments(enrollDialog).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno matriculado.</p>
                  )}
                </div>
                <div className="border-t border-border pt-3">
                  <Label className="text-xs text-muted-foreground">Adicionar aluno</Label>
                  <Select onValueChange={(studentId) => enroll.mutate({ classId: enrollDialog, studentId })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
                    <SelectContent>
                      {students
                        .filter((s) => !getEnrolledStudentIds(enrollDialog).has(s.id))
                        .map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Os registros de chamada vinculados também serão removidos.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
