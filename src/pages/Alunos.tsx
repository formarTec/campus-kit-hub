import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Pencil, Trash2, Mail, Phone, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  trancado: "Trancado",
};
const statusColors: Record<string, string> = {
  ativo: "bg-success/10 text-success border-success/20",
  inativo: "bg-muted text-muted-foreground border-muted",
  trancado: "bg-warning/10 text-warning border-warning/20",
};

interface StudentForm {
  name: string;
  email: string;
  phone: string;
  instrument: string;
  enrollment_date: string;
  status: string;
  notes: string;
}

const emptyForm: StudentForm = {
  name: "", email: "", phone: "", instrument: "",
  enrollment_date: new Date().toISOString().split("T")[0],
  status: "ativo", notes: "",
};

export default function Alunos() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<StudentForm>(emptyForm);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.instrument?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        instrument: form.instrument || null,
        enrollment_date: form.enrollment_date || null,
        status: form.status,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase.from("students").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Aluno atualizado!" : "Aluno cadastrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      setDeleteId(null);
      toast({ title: "Aluno removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      email: s.email ?? "",
      phone: s.phone ?? "",
      instrument: s.instrument ?? "",
      enrollment_date: s.enrollment_date ?? "",
      status: s.status,
      notes: s.notes ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const activeCount = students.filter((s) => s.status === "ativo").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Alunos"
        description="Cadastro de alunos para aulas de instrumentos musicais"
        icon={<GraduationCap className="h-5 w-5" />}
        onAdd={openCreate}
        addLabel="Novo Aluno"
        searchValue={search}
        onSearch={setSearch}
      />

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-xs text-muted-foreground">Total de alunos</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-success">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-warning">{students.filter((s) => s.status === "trancado").length}</p>
            <p className="text-xs text-muted-foreground">Trancados</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-muted-foreground">{students.filter((s) => s.status === "inativo").length}</p>
            <p className="text-xs text-muted-foreground">Inativos</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        students.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-6 w-6" />}
            title="Nenhum aluno cadastrado"
            description="Cadastre os alunos que farão aulas com os instrumentos."
            action={<Button onClick={openCreate}>Cadastrar Aluno</Button>}
          />
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="Nenhum resultado encontrado"
            description={`Nenhum aluno corresponde a "${search}".`}
          />
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="glass-card group hover:shadow-md transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {s.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.name}</p>
                      {s.instrument && (
                        <p className="text-xs text-muted-foreground truncate">{s.instrument}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`shrink-0 text-[10px] ${statusColors[s.status]}`}>
                    {statusLabels[s.status] || s.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {s.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                </div>

                {s.enrollment_date && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Matrícula: {format(new Date(s.enrollment_date + "T12:00:00"), "dd/MM/yyyy")}
                  </p>
                )}

                <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize as informações do aluno." : "Preencha os dados para cadastrar um novo aluno."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Nome do aluno" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="aluno@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instrumento</Label>
                <Input value={form.instrument} onChange={(e) => setField("instrument", e.target.value)} placeholder="Violão, Piano..." />
              </div>
              <div className="space-y-2">
                <Label>Data de Matrícula</Label>
                <Input type="date" value={form.enrollment_date} onChange={(e) => setField("enrollment_date", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="trancado">Trancado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Notas sobre o aluno..." rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O aluno será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
