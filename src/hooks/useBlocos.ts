import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Bloco } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useBlocos = () => {
  const { user } = useAuth();
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchBlocos = async () => {
    if (!user) return;
    try {
      // Só mostra o skeleton na primeira busca. Refetches em segundo plano
      // (realtime, refresh de token) não devem esconder a tela e derrubar
      // modais abertos.
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("blocos")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("ativo", true)
        .order("ordem");

      if (err) throw err;
      setBlocos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar blocos");
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchBlocos();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`blocos:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocos",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchBlocos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const createBloco = async (bloco: Omit<Bloco, "id" | "usuario_id" | "criado_em" | "atualizado_em">) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase.from("blocos").insert({
      ...bloco,
      usuario_id: user.id,
    });

    if (err) throw err;

    // Refetch imediatamente após criar
    await fetchBlocos();
  };

  const updateBloco = async (id: string, updates: Partial<Omit<Bloco, "id" | "usuario_id" | "criado_em" | "atualizado_em">>) => {
    const { error: err } = await supabase
      .from("blocos")
      .update(updates)
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchBlocos();
  };

  const deleteBloco = async (id: string) => {
    const { error: err } = await supabase
      .from("blocos")
      .update({ ativo: false })
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    // Refetch imediatamente após arquivar
    await fetchBlocos();
  };

  return {
    blocos,
    loading,
    error,
    createBloco,
    updateBloco,
    deleteBloco,
  };
};
