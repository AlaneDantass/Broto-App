-- Migration: Integração com Google Agenda + preferências de acessibilidade

-- Integração com Google Agenda (uma por usuário)
CREATE TABLE IF NOT EXISTS integracoes_google_agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  calendario_google_id TEXT,
  conectado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX idx_integracoes_google_agenda_usuario_id ON integracoes_google_agenda(usuario_id);

ALTER TABLE integracoes_google_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integracoes_google_agenda"
  ON integracoes_google_agenda FOR SELECT
  USING ((select auth.uid()) = usuario_id);

CREATE POLICY "Users can insert their own integracoes_google_agenda"
  ON integracoes_google_agenda FOR INSERT
  WITH CHECK ((select auth.uid()) = usuario_id);

CREATE POLICY "Users can update their own integracoes_google_agenda"
  ON integracoes_google_agenda FOR UPDATE
  USING ((select auth.uid()) = usuario_id);

CREATE POLICY "Users can delete their own integracoes_google_agenda"
  ON integracoes_google_agenda FOR DELETE
  USING ((select auth.uid()) = usuario_id);

-- eventos_calendario: rastrear vínculo e sincronização com o Google
ALTER TABLE public.eventos_calendario ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE public.eventos_calendario ADD COLUMN IF NOT EXISTS sincronizado_em TIMESTAMP WITH TIME ZONE;

-- configuracoes_usuario: tema e preferências de acessibilidade
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT 'claro';
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS lembretes_transicao_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS poucas_cores_pouco_texto_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS reduzir_animacoes_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS som_recompensa_ativo BOOLEAN DEFAULT false;

ALTER TABLE public.configuracoes_usuario ADD CONSTRAINT configuracoes_tema_check
CHECK (tema IN ('claro', 'escuro', 'alto_contraste', 'noturno_ultra_suave'));
