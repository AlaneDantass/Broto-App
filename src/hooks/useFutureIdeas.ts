import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { IdeiaFutura } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useFutureIdeas = () => {
  const { user } = useAuth();
  const [ideias, setIdeias] = useState<IdeiaFutura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchIdeias = async () => {
      try {
        if (!hasLoadedRef.current) setLoading(true);
        const { data, error: err } = await supabase
          .from("ideias_futuras")
          .select("*")
          .eq("usuario_id", user.id)
          .order("criado_em", { ascending: false });

        if (err) throw err;
        setIdeias(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar ideias"
        );
      } finally {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    };

    fetchIdeias();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`ideias_futuras:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ideias_futuras",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchIdeias();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchIdeias = async () => {
    if (!user) return;
    try {
      const { data, error: err } = await supabase
        .from("ideias_futuras")
        .select("*")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false });

      if (err) throw err;
      setIdeias(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar ideias"
      );
    }
  };

  const createIdeia = async (
    ideia: Omit<IdeiaFutura, "id" | "usuario_id" | "criado_em">
  ) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase.from("ideias_futuras").insert({
      ...ideia,
      usuario_id: user.id,
    });

    if (err) throw err;

    // Refetch imediatamente
    await fetchIdeias();
  };

  const updateIdeia = async (
    id: string,
    updates: Partial<Omit<IdeiaFutura, "id" | "usuario_id" | "criado_em">>
  ) => {
    const { error: err } = await supabase
      .from("ideias_futuras")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchIdeias();
  };

  const deleteIdeia = async (id: string) => {
    const { error: err } = await supabase
      .from("ideias_futuras")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após deletar
    await fetchIdeias();
  };

  return {
    ideias,
    loading,
    error,
    createIdeia,
    updateIdeia,
    deleteIdeia,
  };
};
