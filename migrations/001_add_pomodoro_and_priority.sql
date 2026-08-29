-- Migration: Add priority, pomodoro, and notes fields to tasks
-- Also add Pomodoro configuration fields to configuracoes_usuario

-- Step 1: Add new columns to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS prioridade TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS ordem INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS pomodoros_estimados INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS pomodoros_concluidos INTEGER DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notas TEXT;

-- Step 2: Add constraint to prioridade
ALTER TABLE public.tasks ADD CONSTRAINT tasks_prioridade_check
CHECK (prioridade IN ('urgente', 'bloqueadora', 'importante') OR prioridade IS NULL);

-- Step 3: Add Pomodoro configuration columns to configuracoes_usuario
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS duracao_pomodoro_minutos INTEGER DEFAULT 25;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS duracao_pausa_curta_minutos INTEGER DEFAULT 5;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS duracao_pausa_longa_minutos INTEGER DEFAULT 15;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS pomodoros_ate_pausa_longa INTEGER DEFAULT 4;
ALTER TABLE public.configuracoes_usuario ADD COLUMN IF NOT EXISTS modo_continuo_ativo BOOLEAN DEFAULT false;

-- Step 4: Add constraints for Pomodoro durations
ALTER TABLE public.configuracoes_usuario ADD CONSTRAINT configuracoes_pomodoro_duration_check
CHECK (duracao_pomodoro_minutos > 0 AND duracao_pausa_curta_minutos > 0 AND duracao_pausa_longa_minutos > 0 AND pomodoros_ate_pausa_longa > 0);
