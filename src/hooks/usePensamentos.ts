import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Pensamento } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const usePensamentos = () => {
  const { user } = useAuth();
  const [pensamentos, setPensamentos] = useState<Pensamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchPensamentos = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("pensamentos")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("triado", false)
        .order("criado_em", { ascending: false });

      if (err) throw err;
      setPensamentos(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar pensamentos"
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

    fetchPensamentos();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`pensamentos:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pensamentos",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchPensamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const createPensamento = async (
    pensamento: Omit<Pensamento, "id" | "usuario_id" | "criado_em">
  ) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase.from("pensamentos").insert({
      ...pensamento,
      usuario_id: user.id,
      triado: false,
    });

    if (err) throw err;

    // Refetch imediatamente
    await fetchPensamentos();
  };

  const triagePensamento = async (
    id: string,
    updates: {
      triado: boolean;
      destino_tipo?: string | null;
      destino_id?: string | null;
    }
  ) => {
    const { error: err } = await supabase
      .from("pensamentos")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchPensamentos();
  };

  const deletePensamento = async (id: string) => {
    const { error: err } = await supabase
      .from("pensamentos")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após deletar
    await fetchPensamentos();
  };

  return {
    pensamentos,
    loading,
    error,
    createPensamento,
    triagePensamento,
    deletePensamento,
  };
};
