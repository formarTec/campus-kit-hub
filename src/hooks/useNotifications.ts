import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

export function useNotificationPermission() {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const result = await Notification.requestPermission();
    return result;
  }, []);

  return { requestPermission, permission: typeof Notification !== "undefined" ? Notification.permission : "unsupported" };
}

function sendLocalNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: "maintenance-alert",
  });
}

export function useMaintenanceAlerts() {
  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance_alerts_bg"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*, computers(name)")
        .not("next_maintenance", "is", null)
        .order("next_maintenance");
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 30, // every 30 min
  });

  useEffect(() => {
    if (!maintenance.length) return;
    const today = new Date();
    const urgent = maintenance.filter((m: any) => {
      const diff = differenceInDays(new Date(m.next_maintenance), today);
      return diff <= 3 && diff >= -7;
    });

    if (urgent.length > 0) {
      const overdue = urgent.filter((m: any) => differenceInDays(new Date(m.next_maintenance), today) < 0);
      const upcoming = urgent.filter((m: any) => differenceInDays(new Date(m.next_maintenance), today) >= 0);
      
      let body = "";
      if (overdue.length > 0) body += `${overdue.length} manutenção(ões) atrasada(s). `;
      if (upcoming.length > 0) body += `${upcoming.length} manutenção(ões) nos próximos 3 dias.`;
      
      sendLocalNotification("🔧 TI Manager - Manutenções", body.trim());
    }
  }, [maintenance]);

  return { alertCount: maintenance.filter((m: any) => differenceInDays(new Date(m.next_maintenance), new Date()) <= 7).length };
}
