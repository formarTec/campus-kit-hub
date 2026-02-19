import {
  Building2,
  Monitor,
  Key,
  Users,
  DollarSign,
  Wrench,
  Music,
  Package,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Computadores", value: "0", icon: Monitor, href: "/computadores", color: "text-primary" },
  { label: "Licenças", value: "0", icon: Key, href: "/licencas", color: "text-accent" },
  { label: "Instrumentos", value: "0", icon: Music, href: "/instrumentos", color: "text-warning" },
  { label: "Fornecedores", value: "0", icon: Users, href: "/fornecedores", color: "text-info" },
];

const quickActions = [
  { label: "Novo Computador", icon: Monitor, href: "/computadores", color: "bg-primary/10 text-primary" },
  { label: "Nova Licença", icon: Key, href: "/licencas", color: "bg-accent/10 text-accent" },
  { label: "Novo Prédio", icon: Building2, href: "/predios", color: "bg-info/10 text-info" },
  { label: "Nova Manutenção", icon: Wrench, href: "/manutencoes", color: "bg-warning/10 text-warning" },
  { label: "Novo Instrumento", icon: Music, href: "/instrumentos", color: "bg-destructive/10 text-destructive" },
  { label: "Novo Fornecedor", icon: Users, href: "/fornecedores", color: "bg-success/10 text-success" },
  { label: "Financeiro", icon: DollarSign, href: "/financeiro", color: "bg-primary/10 text-primary" },
  { label: "Estoque", icon: Package, href: "/estoque", color: "bg-accent/10 text-accent" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Visão geral dos ativos e recursos da instituição</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href} className="stat-card group">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Alertas</h2>
          <div className="glass-card rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning shrink-0" />
              <div>
                <p className="text-sm font-medium">Manutenções pendentes</p>
                <p className="text-xs text-muted-foreground">Nenhuma manutenção programada</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-success/10 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium">Sistema operacional</p>
                <p className="text-xs text-muted-foreground">Todos os serviços funcionando</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-info/10 p-3">
              <Bell className="mt-0.5 h-4 w-4 text-info shrink-0" />
              <div>
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-muted-foreground">Nenhuma notificação pendente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Acesso Rápido</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="module-card flex flex-col items-center gap-3 text-center"
              >
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
