-- Migração: Parte 1
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS inicio_automatico_pausa_ativo BOOLEAN DEFAULT FALSE, ADD COLUMN IF NOT EXISTS modo_preto_branco_ativo BOOLEAN DEFAULT FALSE;
ALTER TABLE blocos_do_dia ADD COLUMN IF NOT EXISTS concluido BOOLEAN DEFAULT FALSE;
