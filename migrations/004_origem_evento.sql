-- Migration: Adicionar coluna origem em eventos_calendario
-- Distingue eventos criados manualmente (sincronizáveis com Google Agenda)
-- de prazos automáticos de task (que NUNCA são enviados ao Google).

ALTER TABLE public.eventos_calendario
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'manual'
  CHECK (origem IN ('manual', 'automatico_prazo_task'));

-- Índice para queries que filtram apenas eventos manuais
CREATE INDEX IF NOT EXISTS idx_eventos_origem
  ON eventos_calendario(usuario_id, origem);

-- Todos os eventos existentes são considerados manuais (retrocompatível)
-- (o DEFAULT 'manual' já cuida disso automaticamente)
