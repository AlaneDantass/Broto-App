import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { LinkBloco } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useLinksBloco = (blocoId?: string) => {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkBloco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchLinks = async () => {
    if (!user || !blocoId) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const { data, error: err } = await supabase
        .from("links_bloco")
        .select("*")
        .eq("bloco_id", blocoId)
        .eq("usuario_id", user.id)
        .order("ordem", { ascending: true })
        .order("criado_em", { ascending: true });

      if (err) throw err;
      setLinks(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar links"
      );
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (!user || !blocoId) {
      setLoading(false);
      return;
    }

    fetchLinks();

    // Subscribe to realtime updates
    const channelId = Math.random().toString(36).substring(7);
    const subscription = supabase
      .channel(`links_bloco:${blocoId}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "links_bloco",
          filter: `bloco_id=eq.${blocoId}`,
        },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, blocoId]);

  const addLink = async (titulo: string, url: string) => {
    if (!user || !blocoId) throw new Error("Usuário ou bloco não autenticados");

    const maxOrdem = links.length > 0 ? Math.max(...links.map((l) => l.ordem)) : 0;

    const { error: err } = await supabase.from("links_bloco").insert({
      usuario_id: user.id,
      bloco_id: blocoId,
      titulo,
      url,
      ordem: maxOrdem + 1,
    });

    if (err) throw err;

    await fetchLinks();
  };

  const deleteLink = async (id: string) => {
    const { error: err } = await supabase
      .from("links_bloco")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user?.id);

    if (err) throw err;

    await fetchLinks();
  };

  return {
    links,
    loading,
    error,
    addLink,
    deleteLink,
  };
};
