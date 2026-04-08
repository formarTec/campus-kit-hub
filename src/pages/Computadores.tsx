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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Computer {
  id: string;
  name: string;
  building_id?: string;
  location?: string;
  hardware_specs?: string;
  software_specs?: string;
  ip_address?: string;
  acquisition_type?: string;
  value?: number;
  in_use?: boolean;
  buildings?: { name: string };
}

interface MaintenanceRecord {
  id: string;
  computer_id?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  notes?: string;
  created_at: string;
}

export default function Computadores() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", hardware_specs: "", software_specs: "", ip_address: "",
    acquisition_type: "", location: "", building_id: "", value: "", in_use: false,
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

  const { data: maintenanceHistory = [] } = useQuery({
    queryKey: ["maintenance", editingId],
    queryFn: async () => {
      if (!editingId) return [];
      const { data, error } = await supabase.from("maintenance_records").select("*").eq("computer_id", editingId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!editingId,
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
        value: form.value ? parseFloat(form.value) : null,
        in_use: form.in_use,
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
      toast({ title: editingId ? "Equipamento atualizado!" : "Equipamento cadastrado!" });
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
      toast({ title: "Equipamento removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", hardware_specs: "", software_specs: "", ip_address: "", acquisition_type: "", location: "", building_id: "", value: "", in_use: false });
    setDialogOpen(true);
  }

  function openEdit(c: Computer) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      hardware_specs: c.hardware_specs ?? "",
      software_specs: c.software_specs ?? "",
      ip_address: c.ip_address ?? "",
      acquisition_type: c.acquisition_type ?? "",
      location: c.location ?? "",
      building_id: c.building_id ?? "",
      value: c.value ? String(c.value) : "",
      in_use: c.in_use ?? false,
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Equipamentos" description="Gerencie os equipamentos e suas especificações" icon={<Monitor className="h-5 w-5" />} onAdd={openCreate} addLabel="Novo Equipamento" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : computers.length === 0 ? (
        <EmptyState icon={<Monitor className="h-6 w-6" />} title="Nenhum equipamento cadastrado" description="Cadastre os equipamentos da instituição." action={<Button onClick={openCreate}>Cadastrar Equipamento</Button>} />
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
              {computers.map((c: Computer) => (
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle></DialogHeader>
          <Tabs defaultValue="dados" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados">Informações</TabsTrigger>
              <TabsTrigger value="manutencao">Histórico de Manutenção</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados" className="flex-1 overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-6 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome da Máquina (Setor) *</Label><Input required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex: PC Administração 01" /></div>
                  <div className="space-y-2">
                    <Label>Prédio / Sede</Label>
                    <Select value={form.building_id} onValueChange={(v) => setField("building_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2"><Label>Especificação de Hardware</Label><Textarea value={form.hardware_specs} onChange={(e) => setField("hardware_specs", e.target.value)} placeholder="Processador, RAM, HD..." className="min-h-[100px]" /></div>
                <div className="space-y-2"><Label>Especificação de Softwares</Label><Textarea value={form.software_specs} onChange={(e) => setField("software_specs", e.target.value)} placeholder="Windows 11, Office 365..." className="min-h-[100px]" /></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => setField("value", e.target.value)} placeholder="1500.00" /></div>
                  <div className="space-y-2 flex items-center justify-between">
                    <Label htmlFor="in_use">Em uso</Label>
                    <Switch id="in_use" checked={form.in_use} onCheckedChange={(checked) => setForm((f) => ({ ...f, in_use: checked }))} />
                  </div>
                </div>
                
                <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="manutencao" className="flex-1 overflow-y-auto">
              {editingId ? (
                <div className="pt-4 pr-4">
                  {maintenanceHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma manutenção registrada para este equipamento.</p>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceHistory.map((m: MaintenanceRecord) => (
                        <div key={m.id} className="p-4 bg-muted rounded-lg border">
                          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                            <div>
                              <span className="font-semibold">Última Manutenção:</span>
                              <p className="text-foreground">{m.last_maintenance ? new Date(m.last_maintenance).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-semibold">Próxima Manutenção:</span>
                              <p className="text-foreground">{m.next_maintenance ? new Date(m.next_maintenance).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            </div>
                          </div>
                          {m.notes && <p className="text-sm text-muted-foreground"><strong>Observações:</strong> {m.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Salve o equipamento para visualizar o histórico de manutenção</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
