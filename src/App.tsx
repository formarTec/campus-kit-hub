import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/AuthGuard";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Predios from "@/pages/Predios";
import Computadores from "@/pages/Computadores";
import Licencas from "@/pages/Licencas";
import GruposLicenca from "@/pages/GruposLicenca";
import Fornecedores from "@/pages/Fornecedores";
import Financeiro from "@/pages/Financeiro";
import Manutencoes from "@/pages/Manutencoes";
import Instrumentos from "@/pages/Instrumentos";
import Alunos from "@/pages/Alunos";
import Aulas from "@/pages/Aulas";
import Chamada from "@/pages/Chamada";
import ChamadaLancar from "@/pages/ChamadaLancar";
import Estoque from "@/pages/Estoque";
import Relatorios from "@/pages/Relatorios";
import Notificacoes from "@/pages/Notificacoes";
import Perfil from "@/pages/Perfil";
import NotFound from "@/pages/NotFound";
import { NotificationBanner } from "@/components/NotificationBanner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>
        <NotificationBanner />
        {children}
      </AppLayout>
    </AuthGuard>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/predios" element={<ProtectedRoute><Predios /></ProtectedRoute>} />
          <Route path="/computadores" element={<ProtectedRoute><Computadores /></ProtectedRoute>} />
          <Route path="/licencas" element={<ProtectedRoute><Licencas /></ProtectedRoute>} />
          <Route path="/grupos-licenca" element={<ProtectedRoute><GruposLicenca /></ProtectedRoute>} />
          <Route path="/fornecedores" element={<ProtectedRoute><Fornecedores /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
          <Route path="/manutencoes" element={<ProtectedRoute><Manutencoes /></ProtectedRoute>} />
          <Route path="/instrumentos" element={<ProtectedRoute><Instrumentos /></ProtectedRoute>} />
          <Route path="/alunos" element={<ProtectedRoute><Alunos /></ProtectedRoute>} />
          <Route path="/aulas" element={<ProtectedRoute><Aulas /></ProtectedRoute>} />
          <Route path="/chamada" element={<ProtectedRoute><Chamada /></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
