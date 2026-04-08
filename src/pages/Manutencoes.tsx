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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Manutencoes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedComputerIds, setSelectedComputerIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    last_maintenance: "", next_maintenance: "", notes: "",
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

  const toggleComputerSelection = async (computerId: string) => {
    setSelectedComputerIds(prev => {
      const isSelected = prev.includes(computerId);
      return isSelected ? prev.filter(id => id !== computerId) : [...prev, computerId];
    });

    // Buscar última manutenção do computador se for seleção única
    if (!selectedComputerIds.includes(computerId)) {
      const { data } = await supabase
        .from("maintenance_records")
        .select("last_maintenance")
        .eq("computer_id", computerId)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (data && data[0]?.last_maintenance) {
        const lastDate = new Date(data[0].last_maintenance).toISOString().split('T')[0];
        setForm(f => ({ ...f, last_maintenance: lastDate }));
      }
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) {
        // Editar registro único
        const payload = {
          last_maintenance: form.last_maintenance || null,
          next_maintenance: form.next_maintenance || null,
          notes: form.notes || null,
        };
        const { error } = await supabase.from("maintenance_records").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        // Criar múltiplos registros
        const computerIds = selectedComputerIds.length > 0 ? selectedComputerIds : [null];
        const records = computerIds.map(computerId => ({
          computer_id: computerId,
          last_maintenance: form.last_maintenance || null,
          next_maintenance: form.next_maintenance || null,
          notes: form.notes || null,
        }));
        const { error } = await supabase.from("maintenance_records").insert(records);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance_records"] });
      setDialogOpen(false);
      const count = editingId ? 1 : selectedComputerIds.length;
      toast({ title: editingId ? "Manutenção atualizada!" : `${count} manutenção(ções) registrada(s)!` });
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
    setSelectedComputerIds([]);
    setForm({ last_maintenance: "", next_maintenance: "", notes: "" });
    setDialogOpen(true);
  }

  function openEdit(r: any) {
    setEditingId(r.id);
    setSelectedComputerIds([]);
    setForm({
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
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Editar Manutenção" : "Agendar Manutenção"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {!editingId && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Selecione os Equipamentos</Label>
                <div className="border rounded-lg p-4 max-h-[250px] overflow-y-auto space-y-2">
                  {computers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado</p>
                  ) : (
                    computers.map((c) => (
                      <div key={c.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={c.id}
                          checked={selectedComputerIds.includes(c.id)}
                          onCheckedChange={() => toggleComputerSelection(c.id)}
                        />
                        <Label htmlFor={c.id} className="font-normal cursor-pointer">{c.name}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Última Manutenção</Label><Input type="date" value={form.last_maintenance} onChange={(e) => setField("last_maintenance", e.target.value)} /></div>
              <div className="space-y-2"><Label>Próxima Manutenção</Label><Input type="date" value={form.next_maintenance} onChange={(e) => setField("next_maintenance", e.target.value)} /></div>
            </div>
            
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Descreva o que foi realizado..." className="min-h-[100px]" /></div>
            
            <DialogFooter><Button type="submit" disabled={save.isPending || (!editingId && selectedComputerIds.length === 0)}>{save.isPending ? "Salvando..." : (editingId ? "Atualizar" : "Registrar")}</Button></DialogFooter>
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
