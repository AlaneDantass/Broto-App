import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ChecklistItem } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useChecklistItems = (taskId?: string) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchItems = async () => {
    if (!user || !taskId) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("task_id", taskId)
        .eq("usuario_id", user.id)
        .order("ordem", { ascending: true });

      if (err) throw err;
      setItems(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar checklist"
      );
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user || !taskId) {
      setLoading(false);
      return;
    }

    fetchItems();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`checklist:${taskId}:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, taskId]);

  const addItem = async (texto: string) => {
    if (!user || !taskId) throw new Error("Usuário ou tarefa não autenticados");

    // Get max ordem
    const maxOrdem = items.length > 0 ? Math.max(...items.map(i => i.ordem)) : 0;

    const { error: err } = await supabase.from("checklist_items").insert({
      usuario_id: user.id,
      task_id: taskId,
      texto,
      concluido: false,
      ordem: maxOrdem + 1,
    });

    if (err) throw err;

    // Refetch imediatamente
    const { data } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("task_id", taskId)
      .eq("usuario_id", user.id)
      .order("ordem", { ascending: true });

    setItems(data || []);
  };

  const toggleItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const { error: err } = await supabase
      .from("checklist_items")
      .update({ concluido: !item.concluido })
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após deletar
    await fetchItems();
  };

  const getProgress = () => {
    if (items.length === 0) return 0;
    const completed = items.filter(i => i.concluido).length;
    return Math.round((completed / items.length) * 100);
  };

  return {
    items,
    loading,
    error,
    addItem,
    toggleItem,
    deleteItem,
    getProgress,
  };
};
