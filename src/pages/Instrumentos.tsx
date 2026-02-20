import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Music, Pencil, Trash2, HandCoins } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Constants } from "@/integrations/supabase/types";

const typeLabels: Record<string, string> = {
  instrumento: "Instrumento", microfone: "Microfone",
  caixa_de_som: "Caixa de Som", mesa_de_som: "Mesa de Som", outro: "Outro",
};
const statusLabels: Record<string, string> = {
  disponivel: "Disponível", em_uso: "Em Uso", emprestado: "Emprestado", manutencao: "Manutenção",
};
const statusColors: Record<string, string> = {
  disponivel: "bg-success/10 text-success", em_uso: "bg-info/10 text-info",
  emprestado: "bg-warning/10 text-warning", manutencao: "bg-destructive/10 text-destructive",
};

export default function Instrumentos() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("instruments");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", type: "instrumento", brand: "", model: "", serial_number: "", status: "disponivel", notes: "",
  });
  const [loanForm, setLoanForm] = useState({
    instrument_id: "", student_name: "", student_contact: "", loan_date: "", expected_return: "", actual_return: "", notes: "",
  });

  const { data: instruments = [], isLoading } = useQuery({
    queryKey: ["instruments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instruments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["instrument_loans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instrument_loans").select("*, instruments(name)").order("loan_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Instrument mutations
  const saveInstrument = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        type: form.type as any,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        status: form.status as any,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase.from("instruments").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("instruments").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instruments"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Instrumento atualizado!" : "Instrumento cadastrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Loan mutations
  const saveLoan = useMutation({
    mutationFn: async () => {
      const payload = {
        instrument_id: loanForm.instrument_id,
        student_name: loanForm.student_name,
        student_contact: loanForm.student_contact || null,
        loan_date: loanForm.loan_date || new Date().toISOString().split("T")[0],
        expected_return: loanForm.expected_return || null,
        actual_return: loanForm.actual_return || null,
        notes: loanForm.notes || null,
      };
      if (editingLoanId) {
        const { error } = await supabase.from("instrument_loans").update(payload).eq("id", editingLoanId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("instrument_loans").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instrument_loans"] });
      setLoanDialogOpen(false);
      toast({ title: editingLoanId ? "Empréstimo atualizado!" : "Empréstimo registrado!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removeInstrument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instruments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instruments"] });
      setDeleteId(null);
      toast({ title: "Instrumento removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removeLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instrument_loans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instrument_loans"] });
      setDeleteLoanId(null);
      toast({ title: "Empréstimo removido!" });
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  function openCreateInstrument() {
    setEditingId(null);
    setForm({ name: "", type: "instrumento", brand: "", model: "", serial_number: "", status: "disponivel", notes: "" });
    setDialogOpen(true);
  }

  function openEditInstrument(i: any) {
    setEditingId(i.id);
    setForm({ name: i.name, type: i.type, brand: i.brand ?? "", model: i.model ?? "", serial_number: i.serial_number ?? "", status: i.status, notes: i.notes ?? "" });
    setDialogOpen(true);
  }

  function openCreateLoan() {
    setEditingLoanId(null);
    setLoanForm({ instrument_id: "", student_name: "", student_contact: "", loan_date: new Date().toISOString().split("T")[0], expected_return: "", actual_return: "", notes: "" });
    setLoanDialogOpen(true);
  }

  function openEditLoan(l: any) {
    setEditingLoanId(l.id);
    setLoanForm({
      instrument_id: l.instrument_id,
      student_name: l.student_name,
      student_contact: l.student_contact ?? "",
      loan_date: l.loan_date,
      expected_return: l.expected_return ?? "",
      actual_return: l.actual_return ?? "",
      notes: l.notes ?? "",
    });
    setLoanDialogOpen(true);
  }

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const setLoanField = (field: string, value: string) => setLoanForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Instrumentos Musicais"
        description="Cadastro e empréstimos de instrumentos e equipamentos musicais"
        icon={<Music className="h-5 w-5" />}
        onAdd={tab === "instruments" ? openCreateInstrument : openCreateLoan}
        addLabel={tab === "instruments" ? "Novo Instrumento" : "Novo Empréstimo"}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="instruments">Instrumentos</TabsTrigger>
          <TabsTrigger value="loans">Empréstimos</TabsTrigger>
        </TabsList>

        <TabsContent value="instruments" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : instruments.length === 0 ? (
            <EmptyState icon={<Music className="h-6 w-6" />} title="Nenhum instrumento cadastrado" description="Cadastre instrumentos musicais." action={<Button onClick={openCreateInstrument}>Cadastrar Instrumento</Button>} />
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden lg:table-cell">Marca/Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instruments.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{typeLabels[i.type] || i.type}</TableCell>
                      <TableCell className="hidden lg:table-cell">{[i.brand, i.model].filter(Boolean).join(" ") || "—"}</TableCell>
                      <TableCell><Badge className={statusColors[i.status]}>{statusLabels[i.status]}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditInstrument(i)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          {loansLoading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : loans.length === 0 ? (
            <EmptyState icon={<HandCoins className="h-6 w-6" />} title="Nenhum empréstimo registrado" description="Registre empréstimos de instrumentos." action={<Button onClick={openCreateLoan}>Novo Empréstimo</Button>} />
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instrumento</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead className="hidden md:table-cell">Data</TableHead>
                    <TableHead className="hidden md:table-cell">Devolução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.instruments?.name || "—"}</TableCell>
                      <TableCell>{l.student_name}</TableCell>
                      <TableCell className="hidden md:table-cell">{format(new Date(l.loan_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="hidden md:table-cell">{l.expected_return ? format(new Date(l.expected_return), "dd/MM/yyyy") : "—"}</TableCell>
                      <TableCell>
                        {l.actual_return ? (
                          <Badge variant="secondary">Devolvido</Badge>
                        ) : (
                          <Badge className="bg-warning/10 text-warning">Emprestado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditLoan(l)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteLoanId(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Instrument Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Editar Instrumento" : "Novo Instrumento"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveInstrument.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2"><Label>Nome *</Label><Input required value={form.name} onChange={(e) => setField("name", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.instrument_type.map((t) => <SelectItem key={t} value={t}>{typeLabels[t] || t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.instrument_status.map((s) => <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marca</Label><Input value={form.brand} onChange={(e) => setField("brand", e.target.value)} /></div>
              <div className="space-y-2"><Label>Modelo</Label><Input value={form.model} onChange={(e) => setField("model", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Número de Série</Label><Input value={form.serial_number} onChange={(e) => setField("serial_number", e.target.value)} /></div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={saveInstrument.isPending}>{saveInstrument.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loan Dialog */}
      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingLoanId ? "Editar Empréstimo" : "Novo Empréstimo"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveLoan.mutate(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Instrumento *</Label>
              <Select value={loanForm.instrument_id} onValueChange={(v) => setLoanField("instrument_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nome do Aluno *</Label><Input required value={loanForm.student_name} onChange={(e) => setLoanField("student_name", e.target.value)} /></div>
            <div className="space-y-2"><Label>Contato do Aluno</Label><Input value={loanForm.student_contact} onChange={(e) => setLoanField("student_contact", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data do Empréstimo</Label><Input type="date" value={loanForm.loan_date} onChange={(e) => setLoanField("loan_date", e.target.value)} /></div>
              <div className="space-y-2"><Label>Devolução Prevista</Label><Input type="date" value={loanForm.expected_return} onChange={(e) => setLoanField("expected_return", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Data de Devolução Real</Label><Input type="date" value={loanForm.actual_return} onChange={(e) => setLoanField("actual_return", e.target.value)} /></div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={loanForm.notes} onChange={(e) => setLoanField("notes", e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={saveLoan.isPending}>{saveLoan.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete instrument */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && removeInstrument.mutate(deleteId)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete loan */}
      <AlertDialog open={!!deleteLoanId} onOpenChange={() => setDeleteLoanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteLoanId && removeLoan.mutate(deleteLoanId)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
