-- Create blocos_do_dia table for daily block planning
CREATE TABLE IF NOT EXISTS blocos_do_dia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bloco_id UUID NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  prioridade TEXT CHECK (prioridade IN ('urgente', 'bloqueadora', 'importante')) DEFAULT NULL,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (usuario_id, bloco_id, data)
);

-- Enable RLS
ALTER TABLE blocos_do_dia ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own blocos_do_dia"
  ON blocos_do_dia FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own blocos_do_dia"
  ON blocos_do_dia FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own blocos_do_dia"
  ON blocos_do_dia FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own blocos_do_dia"
  ON blocos_do_dia FOR DELETE
  USING (auth.uid() = usuario_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE blocos_do_dia;
