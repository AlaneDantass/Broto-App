import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { BlocoDoDia } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useBlocosDoDia = () => {
  const { user } = useAuth();
  const [blocosDoDia, setBlocosDoDia] = useState<BlocoDoDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Get today's date as YYYY-MM-DD
  const getToday = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const fetchBlocosDoDia = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const today = getToday();
      const { data, error: err } = await supabase
        .from("blocos_do_dia")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("data", today)
        .order("ordem");

      if (err) throw err;
      setBlocosDoDia(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar plano do dia");
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchBlocosDoDia();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`blocos_do_dia:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocos_do_dia",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchBlocosDoDia();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const addBlocoDoDia = async (blocoId: string, prioridade: BlocoDoDia["prioridade"] = null) => {
    if (!user) throw new Error("Usuário não autenticado");

    const today = getToday();
    // Calculate next order for this priority
    const samePriority = blocosDoDia.filter((b) => b.prioridade === prioridade);
    const nextOrder = samePriority.length > 0
      ? Math.max(...samePriority.map((b) => b.ordem || 0)) + 1
      : 0;

    const { error: err } = await supabase.from("blocos_do_dia").insert({
      usuario_id: user.id,
      bloco_id: blocoId,
      data: today,
      prioridade,
      ordem: nextOrder,
    });

    if (err) throw err;
    await fetchBlocosDoDia();
  };

  const removeBlocoDoDia = async (id: string) => {
    const { error: err } = await supabase
      .from("blocos_do_dia")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;
    await fetchBlocosDoDia();
  };

  const updateBlocoDoDia = async (
    id: string,
    updates: Partial<Pick<BlocoDoDia, "prioridade" | "ordem">>
  ) => {
    const { error: err } = await supabase
      .from("blocos_do_dia")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;
    await fetchBlocosDoDia();
  };

  const reorderBlocosDoDia = async (reorderedItems: { id: string; ordem: number }[]) => {
    if (!user) return;

    // Update all items in parallel
    const updates = reorderedItems.map((item) =>
      supabase
        .from("blocos_do_dia")
        .update({ ordem: item.ordem })
        .eq("id", item.id)
        .eq("usuario_id", user.id)
    );

    await Promise.all(updates);
    await fetchBlocosDoDia();
  };

  const addMultipleBlocosDoDia = async (
    selections: { blocoId: string; prioridade: BlocoDoDia["prioridade"] }[]
  ) => {
    if (!user) throw new Error("Usuário não autenticado");

    const today = getToday();
    
    // Group by priority and calculate orders
    const priorityCounters: Record<string, number> = {};
    const existingByPriority: Record<string, number> = {};
    
    // Count existing items per priority
    for (const b of blocosDoDia) {
      const key = b.prioridade || "null";
      existingByPriority[key] = Math.max(existingByPriority[key] || 0, (b.ordem || 0) + 1);
    }

    const inserts = selections.map((sel) => {
      const key = sel.prioridade || "null";
      const baseOrder = existingByPriority[key] || 0;
      const offset = priorityCounters[key] || 0;
      priorityCounters[key] = offset + 1;

      return {
        usuario_id: user.id,
        bloco_id: sel.blocoId,
        data: today,
        prioridade: sel.prioridade,
        ordem: baseOrder + offset,
      };
    });

    const { error: err } = await supabase.from("blocos_do_dia").insert(inserts);
    if (err) throw err;
    await fetchBlocosDoDia();
  };

  return {
    blocosDoDia,
    loading,
    error,
    addBlocoDoDia,
    addMultipleBlocosDoDia,
    removeBlocoDoDia,
    updateBlocoDoDia,
    reorderBlocosDoDia,
  };
};
