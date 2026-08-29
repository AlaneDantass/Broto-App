-- Adiciona a coluna ajuda_visualizada na tabela perfis_usuario
ALTER TABLE perfis_usuario 
ADD COLUMN IF NOT EXISTS ajuda_visualizada BOOLEAN DEFAULT FALSE;
