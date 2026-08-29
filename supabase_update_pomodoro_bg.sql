-- Adicionar colunas para customização do fundo da tela de Pomodoro
ALTER TABLE public.configuracoes_usuario 
ADD COLUMN IF NOT EXISTS fundo_pomodoro_tipo text DEFAULT 'padrao' CHECK (fundo_pomodoro_tipo IN ('padrao', 'cor', 'imagem')),
ADD COLUMN IF NOT EXISTS fundo_pomodoro_cor text;
