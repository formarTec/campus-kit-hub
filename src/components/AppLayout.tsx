import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2, Monitor, Key, Users, DollarSign, Wrench,
  Music, GraduationCap, Package, BarChart3, Bell,
  LayoutDashboard, ChevronLeft, ChevronRight, Menu,
  LogOut, FolderOpen, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Prédios / Sedes", href: "/predios", icon: Building2 },
  { name: "Computadores", href: "/computadores", icon: Monitor },
  { name: "Licenças", href: "/licencas", icon: Key },
  { name: "Grupos de Licença", href: "/grupos-licenca", icon: FolderOpen },
  { name: "Fornecedores", href: "/fornecedores", icon: Users },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Manutenções", href: "/manutencoes", icon: Wrench },
  { name: "Instrumentos", href: "/instrumentos", icon: Music },
  { name: "Alunos", href: "/alunos", icon: GraduationCap },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Notificações", href: "/notificacoes", icon: Bell },
];

function NavItem({ item, collapsed, isActive, onClick }: { item: typeof navigation[0]; collapsed: boolean; isActive: boolean; onClick?: () => void }) {
  const content = (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">{item.name}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function SidebarContent({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle?: () => void; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shadow-sm">
          TI
        </div>
        {!collapsed && (
          <div className="animate-slide-in min-w-0">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground truncate">TI Manager</h1>
            <p className="text-[11px] text-sidebar-muted">Gestão de Ativos</p>
          </div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "mx-auto" : "ml-auto"
            )}
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar p-3">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname === item.href}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-0.5">
        <NavItem
          item={{ name: "Meu Perfil", href: "/perfil", icon: UserCircle }}
          collapsed={collapsed}
          isActive={location.pathname === "/perfil"}
          onClick={onNavigate}
        />
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/60 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-3 top-3 z-40 h-10 w-10 bg-card shadow-md border border-border/60">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
