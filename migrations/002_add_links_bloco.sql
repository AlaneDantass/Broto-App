-- Links de um bloco (ex: links de referência, documentação, sites relacionados)
CREATE TABLE IF NOT EXISTS links_bloco (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_links_bloco_bloco_id ON links_bloco(bloco_id);
CREATE INDEX idx_links_bloco_usuario_id ON links_bloco(usuario_id);

ALTER TABLE links_bloco ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own links_bloco"
  ON links_bloco FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own links_bloco"
  ON links_bloco FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own links_bloco"
  ON links_bloco FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own links_bloco"
  ON links_bloco FOR DELETE
  USING (auth.uid() = usuario_id);

ALTER PUBLICATION supabase_realtime ADD TABLE links_bloco;
