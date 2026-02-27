import {
  Building2, Monitor, Key, Users, DollarSign, Wrench,
  Music, Package, Bell, AlertTriangle, CheckCircle2,
  ArrowUpRight, GraduationCap, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const quickActions = [
  { label: "Novo Computador", icon: Monitor, href: "/computadores", color: "bg-primary/10 text-primary" },
  { label: "Nova Licença", icon: Key, href: "/licencas", color: "bg-accent/10 text-accent" },
  { label: "Novo Prédio", icon: Building2, href: "/predios", color: "bg-info/10 text-info" },
  { label: "Nova Manutenção", icon: Wrench, href: "/manutencoes", color: "bg-warning/10 text-warning" },
  { label: "Novo Instrumento", icon: Music, href: "/instrumentos", color: "bg-destructive/10 text-destructive" },
  { label: "Novo Aluno", icon: GraduationCap, href: "/alunos", color: "bg-success/10 text-success" },
  { label: "Financeiro", icon: DollarSign, href: "/financeiro", color: "bg-primary/10 text-primary" },
  { label: "Estoque", icon: Package, href: "/estoque", color: "bg-accent/10 text-accent" },
];

export default function Dashboard() {
  const { data: computerCount = 0 } = useQuery({
    queryKey: ["computers_count"],
    queryFn: async () => {
      const { count } = await supabase.from("computers").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: licenseCount = 0 } = useQuery({
    queryKey: ["licenses_count"],
    queryFn: async () => {
      const { count } = await supabase.from("licenses").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: instrumentCount = 0 } = useQuery({
    queryKey: ["instruments_count"],
    queryFn: async () => {
      const { count } = await supabase.from("instruments").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: studentCount = 0 } = useQuery({
    queryKey: ["students_count"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: pendingMaintenance = 0 } = useQuery({
    queryKey: ["pending_maintenance"],
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_records").select("next_maintenance");
      return (data || []).filter((m) => m.next_maintenance && new Date(m.next_maintenance).getTime() <= Date.now()).length;
    },
  });

  const stats = [
    { label: "Computadores", value: computerCount, icon: Monitor, href: "/computadores", color: "text-primary", bg: "bg-primary/10" },
    { label: "Licenças", value: licenseCount, icon: Key, href: "/licencas", color: "text-accent", bg: "bg-accent/10" },
    { label: "Instrumentos", value: instrumentCount, icon: Music, href: "/instrumentos", color: "text-warning", bg: "bg-warning/10" },
    { label: "Alunos", value: studentCount, icon: GraduationCap, href: "/alunos", color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Visão geral dos ativos e recursos da instituição</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href} className="stat-card group">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Alertas
          </h2>
          <div className="glass-card p-5 space-y-3">
            <div className={`flex items-start gap-3 rounded-lg p-3 ${pendingMaintenance > 0 ? "bg-warning/10" : "bg-success/10"}`}>
              {pendingMaintenance > 0 ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">Manutenções</p>
                <p className="text-xs text-muted-foreground">
                  {pendingMaintenance > 0 ? `${pendingMaintenance} manutenção(ões) pendente(s)` : "Todas em dia"}
                </p>
              </div>
            </div>
            <Link to="/notificacoes" className="flex items-start gap-3 rounded-lg bg-info/10 p-3 hover:bg-info/20 transition-colors">
              <Bell className="mt-0.5 h-4 w-4 text-info shrink-0" />
              <div>
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground">Ver todas as notificações</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Acesso Rápido</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href} className="module-card flex flex-col items-center gap-3 text-center">
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
