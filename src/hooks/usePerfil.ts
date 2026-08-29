import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { PerfilUsuario } from "../types/database";

export function usePerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPerfil(null);
      setLoading(false);
      return;
    }

    const fetchPerfil = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("perfis_usuario")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            // Profile not found, let's create it
            const { data: newData, error: insertError } = await supabase
              .from("perfis_usuario")
              .insert([{ id: user.id }])
              .select()
              .single();

            if (insertError) throw insertError;
            setPerfil(newData as PerfilUsuario);
          } else {
            throw fetchError;
          }
        } else {
          setPerfil(data as PerfilUsuario);
        }
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err);
        setError(err.message || "Erro desconhecido ao buscar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [user]);

  const updatePerfil = async (updates: Partial<PerfilUsuario>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("perfis_usuario")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      setPerfil(data as PerfilUsuario);
      return data;
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      throw err;
    }
  };

  const updateAvatar = async (file: File) => {
    if (!user) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updatePerfil({ avatar_url: data.publicUrl });
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  return {
    perfil,
    loading,
    error,
    updatePerfil,
    updateAvatar
  };
}
