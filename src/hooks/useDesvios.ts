import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Desvio } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useDesvios = () => {
  const { user } = useAuth();
  const [desvios, setDesvios] = useState<Desvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchDesvios = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("desvios")
        .select("*")
        .eq("usuario_id", user.id)
        .order("criado_em", { ascending: false });

      if (err) throw err;
      setDesvios(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar desvios"
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

    fetchDesvios();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`desvios:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "desvios",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchDesvios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const createDesvio = async (desvio: Omit<Desvio, "id" | "usuario_id" | "criado_em">) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase.from("desvios").insert({
      ...desvio,
      usuario_id: user.id,
    });

    if (err) throw err;

    // Refetch imediatamente
    await fetchDesvios();
  };

  const updateDesvio = async (
    id: string,
    updates: Partial<Omit<Desvio, "id" | "usuario_id" | "criado_em">>
  ) => {
    const { error: err } = await supabase
      .from("desvios")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchDesvios();
  };

  const deleteDesvio = async (id: string) => {
    const { error: err } = await supabase
      .from("desvios")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após deletar
    await fetchDesvios();
  };

  const toggleDesvio = async (id: string) => {
    const desvio = desvios.find((d) => d.id === id);
    if (!desvio) return;

    await updateDesvio(id, {
      concluido: !desvio.concluido,
    });
  };

  return {
    desvios,
    loading,
    error,
    createDesvio,
    updateDesvio,
    deleteDesvio,
    toggleDesvio,
  };
};
