import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Key, Pencil, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addMonths, addYears, startOfYear, endOfYear } from "date-fns";

export default function Licencas() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    software_name: "", license_key: "", username: "", password: "",
    payment_type: "", purchase_price: "", group_id: "", supplier_id: "",
    two_factor_enabled: false, two_factor_method: "",
  });

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("*, license_groups(name), suppliers(company_name)")
        .order("software_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["license_groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("license_groups").select("id, name").order("name");
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

  const createFinancialRecords = async (licenseId: string, supplierId: string | null, paymentType: string, price: number) => {
    if (!price || !paymentType || !supplierId) return;

    const today = new Date();
    const records: any[] = [];

    if (paymentType === "mensal") {
      // Criar 12 parcelas mensais
      for (let i = 0; i < 12; i++) {
        records.push({
          license_id: licenseId,
          supplier_id: supplierId,
          amount: price,
          start_date: addMonths(today, i).toISOString().split('T')[0],
          description: `Licença mensal - ${i + 1}ª parcela`,
        });
      }
    } else if (paymentType === "anual") {
      // Criar 1 parcela para o ano vigente
      records.push({
        license_id: licenseId,
        supplier_id: supplierId,
        amount: price,
        start_date: today.toISOString().split('T')[0],
        description: `Licença anual - ${today.getFullYear()}`,
      });
    } else if (paymentType === "vitalicio") {
      // Criar 1 parcela para o ano vigente
      records.push({
        license_id: licenseId,
        supplier_id: supplierId,
        amount: price,
        start_date: today.toISOString().split('T')[0],
        description: `Licença vitalícia`,
      });
    }

    if (records.length > 0) {
      const { error } = await supabase.from("financial_records").insert(records);
      if (error) console.error("Erro ao criar registros financeiros:", error);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        software_name: form.software_name,
        license_key: form.license_key || null,
        username: form.username || null,
        password: form.password || null,
        payment_type: form.payment_type || null,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        group_id: form.group_id || null,
        supplier_id: form.supplier_id || null,
        two_factor_enabled: form.two_factor_enabled,
        two_factor_method: form.two_factor_method || null,
      };

      if (editingId) {
        const { error } = await supabase.from("licenses").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("licenses").insert(payload).select();
        if (error) throw error;

        // Criar registros financeiros para nova licença
        if (data && data[0]) {
          await createFinancialRecords(
            data[0].id,
            form.supplier_id,
            form.payment_type,
            Number(form.purchase_price)
          );
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["licenses"] });
      qc.invalidateQueries({ queryKey: ["financial_records"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Licença atualizada!" : "Licença cadastrada!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const releaseLicenseFunding = useMutation({
    mutationFn: async (licenseId: string) => {
      const license = licenses.find((l: any) => l.id === licenseId);
      if (!license) throw new Error("Licença não encontrada");

      await createFinancialRecords(
        licenseId,
        license.supplier_id,
        license.payment_type,
        license.purchase_price
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financial_records"] });
      toast({ title: "Valores relançados para o próximo período!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("licenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["licenses"] });
      setDeleteId(null);
      toast({ title: "Licença removida!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditingId(null);
    setShowPassword(false);
    setForm({ software_name: "", license_key: "", username: "", password: "", payment_type: "", purchase_price: "", group_id: "", supplier_id: "", two_factor_enabled: false, two_factor_method: "" });
    setDialogOpen(true);
  }

  function openEdit(l: any) {
    setEditingId(l.id);
    setShowPassword(false);
    setForm({
      software_name: l.software_name,
      license_key: l.license_key ?? "",
      username: l.username ?? "",
      password: l.password ?? "",
      payment_type: l.payment_type ?? "",
      purchase_price: l.purchase_price?.toString() ?? "",
      group_id: l.group_id ?? "",
      supplier_id: l.supplier_id ?? "",
      two_factor_enabled: l.two_factor_enabled ?? false,
      two_factor_method: l.two_factor_method ?? "",
    });
    setDialogOpen(true);
  }

  const setField = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  const paymentLabel: Record<string, string> = { mensal: "Mensal", anual: "Anual", vitalicio: "Vitalício" };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Licenças" description="Gerencie as licenças de software" icon={<Key className="h-5 w-5" />} onAdd={openCreate} addLabel="Nova Licença" />

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : licenses.length === 0 ? (
        <EmptyState icon={<Key className="h-6 w-6" />} title="Nenhuma licença cadastrada" description="Cadastre as licenças de software." action={<Button onClick={openCreate}>Cadastrar Licença</Button>} />
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Software</TableHead>
                <TableHead className="hidden md:table-cell">Grupo</TableHead>
                <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                <TableHead className="hidden lg:table-cell">Valor</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.software_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{l.license_groups?.name || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {l.payment_type ? <Badge variant="secondary">{paymentLabel[l.payment_type] || l.payment_type}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {l.purchase_price ? `R$ ${Number(l.purchase_price).toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(l)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => releaseLicenseFunding.mutate(l.id)}
                        disabled={releaseLicenseFunding.isPending}
                        title="Relançar valores"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)} title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">{editingId ? "Editar Licença" : "Nova Licença"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-6">
            <div className="space-y-2"><Label>Nome do Software *</Label><Input required value={form.software_name} onChange={(e) => setField("software_name", e.target.value)} placeholder="Ex: Microsoft Office 365" /></div>
            
            <div className="space-y-2"><Label>Chave de Licença</Label><Input value={form.license_key} onChange={(e) => setField("license_key", e.target.value)} placeholder="XXXXX-XXXXX-XXXXX" /></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Usuário</Label><Input value={form.username} onChange={(e) => setField("username", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox 
                  id="2fa" 
                  checked={form.two_factor_enabled}
                  onCheckedChange={(checked) => setField("two_factor_enabled", checked as boolean)}
                />
                <Label htmlFor="2fa" className="font-medium cursor-pointer">Autenticação de 2 Fatores</Label>
              </div>
              
              {form.two_factor_enabled && (
                <div className="space-y-2 ml-6">
                  <Label>Meio de Recebimento do Código</Label>
                  <Select value={form.two_factor_method} onValueChange={(v) => setField("two_factor_method", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="app">App Autenticador</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Pagamento</Label>
                <Select value={form.payment_type} onValueChange={(v) => setField("payment_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="vitalicio">Vitalício</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Valor Pago (R$)</Label><Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setField("purchase_price", e.target.value)} placeholder="0.00" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select value={form.group_id} onValueChange={(v) => setField("group_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select value={form.supplier_id} onValueChange={(v) => setField("supplier_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
