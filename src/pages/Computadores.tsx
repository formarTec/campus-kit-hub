import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, Pencil, Trash2 } from "lucide-react";
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

export default function Computadores() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", hardware_specs: "", software_specs: "", ip_address: "",
    acquisition_type: "", location: "", building_id: "",
  });

  const { data: computers = [], isLoading } = useQuery({
    queryKey: ["computers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("computers").select("*, buildings(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("buildings").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        hardware_specs: form.hardware_specs || null,
        software_specs: form.software_specs || null,
        ip_address: form.ip_address || null,
        acquisition_type: form.acquisition_type || null,
        location: form.location || null,
        building_id: form.building_id || null,
      };
      if (editingId) {
        const { error } = await supabase.from("computers").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("computers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["computers"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Computador atualizado!" : "Computador cadastrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("computers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["computers"] });
      setDeleteId(null);
      toast({ title: "Computador removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", hardware_specs: "", software_specs: "", ip_address: "", acquisition_type: "", location: "", building_id: "" });
    setDialogOpen(true);
  }

  function openEdit(c: any) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      hardware_specs: c.hardware_specs ?? "",
      software_specs: c.software_specs ?? "",
      ip_address: c.ip_address ?? "",
      acquisition_type: c.acquisition_type ?? "",
      location: c.location ?? "",
      building_id: c.building_id ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Computadores" description="Gerencie os computadores e suas especificações" icon={<Monitor className="h-5 w-5" />} onAdd={openCreate} addLabel="Novo Computador" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : computers.length === 0 ? (
        <EmptyState icon={<Monitor className="h-6 w-6" />} title="Nenhum computador cadastrado" description="Cadastre os computadores da instituição." action={<Button onClick={openCreate}>Cadastrar Computador</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Prédio</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Local</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {computers.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.buildings?.name || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">{c.ip_address || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {c.acquisition_type ? <Badge variant="secondary">{c.acquisition_type === "comprado" ? "Comprado" : "Doado"}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{c.location || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Editar Computador" : "Novo Computador"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Nome da Máquina (Setor) *</Label><Input required value={form.name} onChange={(e) => setField("name", e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Prédio / Sede</Label>
              <Select value={form.building_id} onValueChange={(v) => setField("building_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Especificação de Hardware</Label><Textarea value={form.hardware_specs} onChange={(e) => setField("hardware_specs", e.target.value)} placeholder="Processador, RAM, HD..." /></div>
            <div className="space-y-2"><Label>Especificação de Softwares</Label><Textarea value={form.software_specs} onChange={(e) => setField("software_specs", e.target.value)} placeholder="Windows 11, Office 365..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>IP Atribuído</Label><Input value={form.ip_address} onChange={(e) => setField("ip_address", e.target.value)} placeholder="192.168.0.1" /></div>
              <div className="space-y-2">
                <Label>Tipo de Aquisição</Label>
                <Select value={form.acquisition_type} onValueChange={(v) => setField("acquisition_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprado">Comprado</SelectItem>
                    <SelectItem value="doado">Doado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Local da Máquina</Label><Input value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="Sala 201, Lab 3..." /></div>
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
