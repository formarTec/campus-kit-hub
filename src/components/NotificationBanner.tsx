import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationPermission, useMaintenanceAlerts } from "@/hooks/useNotifications";

export function NotificationBanner() {
  const { requestPermission, permission } = useNotificationPermission();
  const { alertCount } = useMaintenanceAlerts();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("notif-banner-dismissed");
    if (permission === "default" && !wasDismissed) {
      setShowBanner(true);
    }
  }, [permission]);

  if (!showBanner || dismissed || permission !== "default") return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm animate-fade-in">
      <Bell className="h-4 w-4 text-info shrink-0" />
      <p className="flex-1 text-foreground">
        Ative as notificações para receber alertas de manutenções próximas do vencimento.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={async () => {
          await requestPermission();
          setDismissed(true);
          sessionStorage.setItem("notif-banner-dismissed", "1");
        }}
      >
        Ativar
      </Button>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem("notif-banner-dismissed", "1");
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
