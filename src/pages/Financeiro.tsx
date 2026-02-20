import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

export default function Financeiro() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplier_id: "", amount: "", start_date: "", grace_period_days: "", due_day: "", description: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["financial_records"],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_records").select("*, suppliers(company_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, company_name").order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        supplier_id: form.supplier_id || null,
        amount: Number(form.amount),
        start_date: form.start_date || null,
        grace_period_days: form.grace_period_days ? Number(form.grace_period_days) : null,
        due_day: form.due_day ? Number(form.due_day) : null,
        description: form.description || null,
      };
      if (editingId) {
        const { error } = await supabase.from("financial_records").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("financial_records").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial_records"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Registro atualizado!" : "Registro cadastrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial_records"] });
      setDeleteId(null);
      toast({ title: "Registro removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ supplier_id: "", amount: "", start_date: "", grace_period_days: "", due_day: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(r: any) {
    setEditingId(r.id);
    setForm({
      supplier_id: r.supplier_id ?? "",
      amount: r.amount?.toString() ?? "",
      start_date: r.start_date ?? "",
      grace_period_days: r.grace_period_days?.toString() ?? "",
      due_day: r.due_day?.toString() ?? "",
      description: r.description ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Financeiro" description="Controle financeiro de serviços, licenças e manutenções" icon={<DollarSign className="h-5 w-5" />} onAdd={openCreate} addLabel="Novo Registro" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : records.length === 0 ? (
        <EmptyState icon={<DollarSign className="h-6 w-6" />} title="Nenhum registro financeiro" description="Registre pagamentos de fornecedores, licenças e serviços." action={<Button onClick={openCreate}>Novo Registro</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden md:table-cell">Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="hidden lg:table-cell">Vencimento</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.description || "Sem descrição"}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.suppliers?.company_name || "—"}</TableCell>
                  <TableCell className="font-mono">R$ {Number(r.amount).toFixed(2)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{r.due_day ? `Dia ${r.due_day}` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Editar Registro" : "Novo Registro"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={form.supplier_id} onValueChange={(v) => setField("supplier_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Valor (R$) *</Label><Input required type="number" step="0.01" value={form.amount} onChange={(e) => setField("amount", e.target.value)} /></div>
              <div className="space-y-2"><Label>Data de Início</Label><Input type="date" value={form.start_date} onChange={(e) => setField("start_date", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Carência (dias)</Label><Input type="number" value={form.grace_period_days} onChange={(e) => setField("grace_period_days", e.target.value)} /></div>
              <div className="space-y-2"><Label>Dia de Vencimento</Label><Input type="number" min="1" max="31" value={form.due_day} onChange={(e) => setField("due_day", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
