import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ConfiguracaoUsuario } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useConfiguracoes = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ConfiguracaoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchConfig = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("configuracoes_usuario")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (err) {
        // Se não existe, criar com defaults
        if (err.code === "PGRST116") {
          const { data: newConfig, error: createErr } = await supabase
            .from("configuracoes_usuario")
            .insert({
              usuario_id: user.id,
              limiar_hiperfoco_percentual: 150,
              horario_fim_dia: "18:00",
              estimativa_ia_ativa: false,
              campo_energia_estimada_visivel: false,
              campo_contexto_visivel: false,
              campo_prioridade_numerica_visivel: false,
              modulo_diario_visual_ativo: false,
              modulo_rastreador_habitos_ativo: false,
              tema: 'claro',
              lembretes_transicao_ativo: false,
              poucas_cores_pouco_texto_ativo: false,
              reduzir_animacoes_ativo: false,
              som_recompensa_ativo: false,
            })
            .select()
            .single();
          if (createErr) throw createErr;
          setConfig(newConfig);
        } else {
          throw err;
        }
      } else {
        setConfig(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar configurações"
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

    fetchConfig();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`configuracoes_usuario:${user.id}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "configuracoes_usuario",
          filter: `usuario_id=eq.${user.id}`,
        },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const updateConfig = async (
    updates: Partial<Omit<ConfiguracaoUsuario, "usuario_id" | "atualizado_em">>
  ) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { error: err } = await supabase
      .from("configuracoes_usuario")
      .update({
        ...updates,
        atualizado_em: new Date().toISOString(),
      })
      .eq("usuario_id", user.id);

    if (err) throw err;

    // Refetch imediatamente após atualizar
    await fetchConfig();
  };

  return {
    config,
    loading,
    error,
    updateConfig,
  };
};
