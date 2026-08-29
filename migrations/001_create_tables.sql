-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blocos (focal areas/projects)
CREATE TABLE IF NOT EXISTS blocos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT, -- Learning, Career, Personal, Leisure, etc
  icone TEXT,
  imagem_capa_url TEXT,
  meta_label TEXT,
  meta_atual INTEGER DEFAULT 0,
  meta_total INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, nome)
);

CREATE INDEX idx_blocos_usuario_id ON blocos(usuario_id);
CREATE INDEX idx_blocos_ativo ON blocos(usuario_id, ativo);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  is_programming BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  energia_estimada INTEGER,
  contexto TEXT,
  prioridade_numerica INTEGER,
  tempo_estimado_minutos INTEGER,
  tempo_gasto_minutos INTEGER DEFAULT 0,
  iniciado_em TIMESTAMP WITH TIME ZONE,
  concluido_em TIMESTAMP WITH TIME ZONE,
  foco_atual BOOLEAN DEFAULT false,
  prazo_data DATE,
  prazo_hora TIME,
  prazo_local TEXT,
  branch_git TEXT,
  commit_git TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_usuario_id ON tasks(usuario_id);
CREATE INDEX idx_tasks_bloco_id ON tasks(bloco_id);
CREATE INDEX idx_tasks_status ON tasks(usuario_id, status);
CREATE INDEX idx_tasks_foco_atual ON tasks(usuario_id, foco_atual);

-- Checklist Items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluido BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checklist_task_id ON checklist_items(task_id);

-- Desvios (Deviation Board)
CREATE TABLE IF NOT EXISTS desvios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  origem_texto TEXT,
  origem_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  tag TEXT, -- UNRELATED, etc
  concluido BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_desvios_usuario_id ON desvios(usuario_id);
CREATE INDEX idx_desvios_origem_task_id ON desvios(origem_task_id);

-- Anotações (Block Notes)
CREATE TABLE IF NOT EXISTS anotacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_anotacoes_bloco_id ON anotacoes(bloco_id);

-- Eventos Calendário
CREATE TABLE IF NOT EXISTS eventos_calendario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID REFERENCES blocos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME,
  tipo TEXT CHECK (tipo IN ('Work Blocks', 'Personal Sanctuary', 'Future Ideas')),
  cor TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eventos_usuario_id ON eventos_calendario(usuario_id);
CREATE INDEX idx_eventos_data ON eventos_calendario(usuario_id, data);

-- Ideias Futuras (Future Ideas)
CREATE TABLE IF NOT EXISTS ideias_futuras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  tag TEXT, -- Someday, etc
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ideias_usuario_id ON ideias_futuras(usuario_id);

-- Pensamentos (Inbox / Captura de Pensamento)
CREATE TABLE IF NOT EXISTS pensamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  detalhes TEXT,
  categoria TEXT CHECK (categoria IN ('ideia', 'tarefa', 'nota')),
  triado BOOLEAN DEFAULT false,
  destino_tipo TEXT, -- 'bloco', 'task', 'anotacao', 'ideia'
  destino_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pensamentos_usuario_id ON pensamentos(usuario_id);
CREATE INDEX idx_pensamentos_triado ON pensamentos(usuario_id, triado);

-- Configurações do Usuário
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
  usuario_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  limiar_hiperfoco_percentual INTEGER DEFAULT 150,
  horario_fim_dia TIME DEFAULT '18:00',
  estimativa_ia_ativa BOOLEAN DEFAULT false,
  campo_energia_estimada_visivel BOOLEAN DEFAULT false,
  campo_contexto_visivel BOOLEAN DEFAULT false,
  campo_prioridade_numerica_visivel BOOLEAN DEFAULT false,
  modulo_diario_visual_ativo BOOLEAN DEFAULT false,
  modulo_rastreador_habitos_ativo BOOLEAN DEFAULT false,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE blocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE desvios ENABLE ROW LEVEL SECURITY;
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideias_futuras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pensamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocos
CREATE POLICY "Users can view their own blocos"
  ON blocos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own blocos"
  ON blocos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own blocos"
  ON blocos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own blocos"
  ON blocos FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for checklist_items
CREATE POLICY "Users can view their own checklist items"
  ON checklist_items FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own checklist items"
  ON checklist_items FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own checklist items"
  ON checklist_items FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own checklist items"
  ON checklist_items FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for desvios
CREATE POLICY "Users can view their own desvios"
  ON desvios FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own desvios"
  ON desvios FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own desvios"
  ON desvios FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own desvios"
  ON desvios FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for anotacoes
CREATE POLICY "Users can view their own anotacoes"
  ON anotacoes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own anotacoes"
  ON anotacoes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own anotacoes"
  ON anotacoes FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own anotacoes"
  ON anotacoes FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for eventos_calendario
CREATE POLICY "Users can view their own eventos_calendario"
  ON eventos_calendario FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own eventos_calendario"
  ON eventos_calendario FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own eventos_calendario"
  ON eventos_calendario FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own eventos_calendario"
  ON eventos_calendario FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for ideias_futuras
CREATE POLICY "Users can view their own ideias_futuras"
  ON ideias_futuras FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own ideias_futuras"
  ON ideias_futuras FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own ideias_futuras"
  ON ideias_futuras FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own ideias_futuras"
  ON ideias_futuras FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for pensamentos
CREATE POLICY "Users can view their own pensamentos"
  ON pensamentos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own pensamentos"
  ON pensamentos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own pensamentos"
  ON pensamentos FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own pensamentos"
  ON pensamentos FOR DELETE
  USING (auth.uid() = usuario_id);

-- RLS Policies for configuracoes_usuario
CREATE POLICY "Users can view their own configuracoes"
  ON configuracoes_usuario FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own configuracoes"
  ON configuracoes_usuario FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own configuracoes"
  ON configuracoes_usuario FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Enable Realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE desvios;
ALTER PUBLICATION supabase_realtime ADD TABLE anotacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE eventos_calendario;

-- Trigger: Create default configuracoes_usuario on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.configuracoes_usuario (usuario_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
