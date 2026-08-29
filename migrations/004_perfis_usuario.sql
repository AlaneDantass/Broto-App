-- Criação da tabela perfis_usuario
CREATE TABLE IF NOT EXISTS perfis_usuario (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primeiro_nome TEXT,
  sobrenome TEXT,
  avatar_url TEXT,
  neurodivergente BOOLEAN DEFAULT FALSE,
  neurodivergencias TEXT[] DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver seu próprio perfil" ON perfis_usuario
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON perfis_usuario
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON perfis_usuario
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION atualiza_timestamp_perfil()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_atualiza_timestamp_perfil ON perfis_usuario;
CREATE TRIGGER tr_atualiza_timestamp_perfil
BEFORE UPDATE ON perfis_usuario
FOR EACH ROW
EXECUTE FUNCTION atualiza_timestamp_perfil();

-- Trigger para criar perfil automaticamente quando usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis_usuario (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se trigger já existe antes de criar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
