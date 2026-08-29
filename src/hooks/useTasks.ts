import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Task } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import { useConfiguracoes } from "./useConfiguracoes";
import { playRewardSound } from "../utils/rewardSound";

export const useTasks = (blocoId?: string) => {
  const { user } = useAuth();
  const { config } = useConfiguracoes();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      let query = supabase
        .from("tasks")
        .select("*")
        .eq("usuario_id", user.id);

      if (blocoId) {
        query = query.eq("bloco_id", blocoId);
      }

      const { data, error: err } = await query.order("criado_em", {
        ascending: false,
      });

      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar tasks"
      );
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchTasks();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const channelName = blocoId
      ? `tasks:${blocoId}:${channelId}`
      : `tasks:${user.id}:${channelId}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, blocoId]);

  const createTask = async (task: Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase.from("tasks").insert({
      ...task,
      usuario_id: user.id,
    });

    if (err) throw err;

    // Refetch imediatamente após criar
    await fetchTasks();
  };

  const updateTask = async (
    id: string,
    updates: Partial<Omit<Task, "id" | "usuario_id" | "criado_em" | "atualizado_em">>
  ) => {
    const { error: err } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const { error: err } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após deletar
    await fetchTasks();
  };

  const toggleTask = async (id: string, status: Task["status"]) => {
    const newStatus = status === "concluida" ? "pendente" : "concluida";

    await updateTask(id, {
      status: newStatus,
      concluido_em:
        newStatus === "concluida" ? new Date().toISOString() : null,
    } as any);

    // Toca som de recompensa ao concluir (se ativado nas configurações)
    if (newStatus === "concluida" && config?.som_recompensa_ativo) {
      playRewardSound();
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
};
