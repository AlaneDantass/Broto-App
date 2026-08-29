-- Migration 005: Suporte Sensorial
-- Adiciona colunas de acessibilidade sensorial na tabela de configurações do usuário

ALTER TABLE public.configuracoes_usuario
  ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT 'claro'
    CHECK (tema IN ('claro', 'escuro', 'alto_contraste', 'noturno_ultra_suave')),
  ADD COLUMN IF NOT EXISTS lembretes_transicao_ativo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS poucas_cores_pouco_texto_ativo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reduzir_animacoes_ativo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS som_recompensa_ativo BOOLEAN NOT NULL DEFAULT false;

-- Atualizar registros existentes com os defaults corretos
UPDATE public.configuracoes_usuario
SET
  tema = COALESCE(tema, 'claro'),
  lembretes_transicao_ativo = COALESCE(lembretes_transicao_ativo, false),
  poucas_cores_pouco_texto_ativo = COALESCE(poucas_cores_pouco_texto_ativo, false),
  reduzir_animacoes_ativo = COALESCE(reduzir_animacoes_ativo, false),
  som_recompensa_ativo = COALESCE(som_recompensa_ativo, false)
WHERE tema IS NULL
   OR lembretes_transicao_ativo IS NULL
   OR poucas_cores_pouco_texto_ativo IS NULL
   OR reduzir_animacoes_ativo IS NULL
   OR som_recompensa_ativo IS NULL;
