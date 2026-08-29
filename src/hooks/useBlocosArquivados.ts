import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Bloco } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useBlocosArquivados = () => {
  const { user } = useAuth();
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchBlocosArquivados = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("blocos")
        .select("*")
        .eq("usuario_id", user.id)
        .eq("ativo", false)
        .order("atualizado_em", { ascending: false });

      if (err) throw err;
      setBlocos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar blocos arquivados");
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchBlocosArquivados();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`blocos-arquivados:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocos",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchBlocosArquivados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const restaurarBloco = async (id: string) => {
    const { error: err } = await supabase
      .from("blocos")
      .update({ ativo: true })
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    await fetchBlocosArquivados();
  };

  const deletarPermanentemente = async (id: string) => {
    const { error: err } = await supabase
      .from("blocos")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    await fetchBlocosArquivados();
  };

  return {
    blocos,
    loading,
    error,
    restaurarBloco,
    deletarPermanentemente,
  };
};
