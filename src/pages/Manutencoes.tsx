import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Pencil, Trash2 } from "lucide-react";
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
import { format } from "date-fns";

export default function Manutencoes() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    computer_id: "", instrument_id: "", last_maintenance: "", next_maintenance: "", notes: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_records").select("*, computers(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: computers = [] } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("computers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: instruments = [] } = useQuery({
    queryKey: ["instruments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instruments").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        computer_id: form.computer_id || null,
        instrument_id: form.instrument_id || null,
        last_maintenance: form.last_maintenance || null,
        next_maintenance: form.next_maintenance || null,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase.from("maintenance_records").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("maintenance_records").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance_records"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Manutenção atualizada!" : "Manutenção registrada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maintenance_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance_records"] });
      setDeleteId(null);
      toast({ title: "Registro removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ computer_id: "", instrument_id: "", last_maintenance: "", next_maintenance: "", notes: "" });
    setDialogOpen(true);
  }

  function openEdit(r: any) {
    setEditingId(r.id);
    setForm({
      computer_id: r.computer_id ?? "",
      instrument_id: r.instrument_id ?? "",
      last_maintenance: r.last_maintenance ?? "",
      next_maintenance: r.next_maintenance ?? "",
      notes: r.notes ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  function getStatus(next: string | null) {
    if (!next) return null;
    const diff = new Date(next).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return <Badge variant="destructive">Atrasada</Badge>;
    if (days <= 7) return <Badge className="bg-warning text-warning-foreground">Próxima</Badge>;
    return <Badge variant="secondary">Programada</Badge>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manutenções" description="Controle de manutenções de PCs e equipamentos" icon={<Wrench className="h-5 w-5" />} onAdd={openCreate} addLabel="Nova Manutenção" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : records.length === 0 ? (
        <EmptyState icon={<Wrench className="h-6 w-6" />} title="Nenhuma manutenção registrada" description="Registre as manutenções realizadas." action={<Button onClick={openCreate}>Registrar Manutenção</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead className="hidden md:table-cell">Última</TableHead>
                <TableHead className="hidden md:table-cell">Próxima</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.computers?.name || "Instrumento"}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.last_maintenance ? format(new Date(r.last_maintenance), "dd/MM/yyyy") : "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.next_maintenance ? format(new Date(r.next_maintenance), "dd/MM/yyyy") : "—"}</TableCell>
                  <TableCell>{getStatus(r.next_maintenance) || "—"}</TableCell>
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
          <DialogHeader><DialogTitle>{editingId ? "Editar Manutenção" : "Nova Manutenção"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Computador</Label>
              <Select value={form.computer_id} onValueChange={(v) => setField("computer_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {computers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instrumento</Label>
              <Select value={form.instrument_id} onValueChange={(v) => setField("instrument_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Última Manutenção</Label><Input type="date" value={form.last_maintenance} onChange={(e) => setField("last_maintenance", e.target.value)} /></div>
              <div className="space-y-2"><Label>Próxima Manutenção</Label><Input type="date" value={form.next_maintenance} onChange={(e) => setField("next_maintenance", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Descreva o que foi realizado..." /></div>
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
