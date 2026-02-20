import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Supplier = Tables<"suppliers">;

export default function Fornecedores() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ company_name: "", trade_name: "", document: "", contacts: "", address: "", contract_url: "" });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("suppliers").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDialogOpen(false);
      toast({ title: editing ? "Fornecedor atualizado!" : "Fornecedor cadastrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleteId(null);
      toast({ title: "Fornecedor removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ company_name: "", trade_name: "", document: "", contacts: "", address: "", contract_url: "" });
    setDialogOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({
      company_name: s.company_name,
      trade_name: s.trade_name ?? "",
      document: s.document ?? "",
      contacts: s.contacts ?? "",
      address: s.address ?? "",
      contract_url: s.contract_url ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fornecedores" description="Gerencie fornecedores de serviços e produtos" icon={<Users className="h-5 w-5" />} onAdd={openCreate} addLabel="Novo Fornecedor" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="Nenhum fornecedor cadastrado" description="Cadastre os fornecedores." action={<Button onClick={openCreate}>Cadastrar Fornecedor</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead className="hidden md:table-cell">Nome Fantasia</TableHead>
                <TableHead className="hidden lg:table-cell">CNPJ/CPF</TableHead>
                <TableHead className="hidden lg:table-cell">Contatos</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.company_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.trade_name || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.document || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.contacts || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Razão Social *</Label><Input required value={form.company_name} onChange={(e) => setField("company_name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Nome Fantasia</Label><Input value={form.trade_name} onChange={(e) => setField("trade_name", e.target.value)} /></div>
            <div className="space-y-2"><Label>CNPJ/CPF</Label><Input value={form.document} onChange={(e) => setField("document", e.target.value)} /></div>
            <div className="space-y-2"><Label>Contatos</Label><Textarea value={form.contacts} onChange={(e) => setField("contacts", e.target.value)} /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={(e) => setField("address", e.target.value)} /></div>
            <div className="space-y-2"><Label>URL do Contrato</Label><Input value={form.contract_url} onChange={(e) => setField("contract_url", e.target.value)} /></div>
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
