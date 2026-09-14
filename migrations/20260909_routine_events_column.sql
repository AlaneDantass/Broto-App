ALTER TABLE configuracoes_usuario ADD COLUMN IF NOT EXISTS eventos_rotina_semanal JSONB DEFAULT '[]'::jsonb;
