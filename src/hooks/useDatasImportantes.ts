import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DataImportante } from "../types/database";
import { useAuth } from "../contexts/AuthContext";

export const useDatasImportantes = (blocoId?: string) => {
  const { user } = useAuth();
  const [datas, setDatas] = useState<DataImportante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchDatas = async () => {
    if (!user) return;
    try {
      if (!hasLoadedRef.current) setLoading(true);
      let query = supabase
        .from("datas_importantes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("data", { ascending: true });

      if (blocoId) {
        query = query.eq("bloco_id", blocoId);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setDatas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar datas importantes");
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
    fetchDatas();

    const channelId = Math.random().toString(36).substring(7);
    const channelName = blocoId ? `datas_importantes:${blocoId}:${channelId}` : `datas_importantes:${user.id}:${channelId}`;
    
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "datas_importantes", filter: `usuario_id=eq.${user.id}` },
        () => { fetchDatas(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [user, blocoId]);

  const addData = async (novaData: Omit<DataImportante, "id" | "usuario_id" | "criado_em" | "lida">) => {
    if (!user) throw new Error("Usuário não autenticado");
    const { error: err } = await supabase.from("datas_importantes").insert({
      ...novaData,
      usuario_id: user.id,
      lida: false,
    });
    if (err) throw err;
    await fetchDatas();
  };

  const deleteData = async (id: string) => {
    const { error: err } = await supabase.from("datas_importantes").delete().eq("id", id).eq("usuario_id", user?.id);
    if (err) throw err;
    await fetchDatas();
  };

  const markAsRead = async (id: string) => {
    const { error: err } = await supabase.from("datas_importantes").update({ lida: true }).eq("id", id).eq("usuario_id", user?.id);
    if (err) throw err;
    await fetchDatas();
  };

  return { datas, loading, error, addData, deleteData, markAsRead };
};
