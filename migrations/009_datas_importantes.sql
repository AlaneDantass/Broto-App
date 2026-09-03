CREATE TABLE IF NOT EXISTS datas_importantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE datas_importantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own datas_importantes" ON datas_importantes FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can insert own datas_importantes" ON datas_importantes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own datas_importantes" ON datas_importantes FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own datas_importantes" ON datas_importantes FOR DELETE USING (auth.uid() = usuario_id);

ALTER PUBLICATION supabase_realtime ADD TABLE datas_importantes;
