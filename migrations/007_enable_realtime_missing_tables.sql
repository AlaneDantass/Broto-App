-- Habilita o Supabase Realtime para as tabelas que não foram incluídas inicialmente
-- Isso resolve o problema de ter que atualizar a página para ver novos itens

ALTER PUBLICATION supabase_realtime ADD TABLE pensamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE ideias_futuras;
ALTER PUBLICATION supabase_realtime ADD TABLE configuracoes_usuario;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE blocos;
ALTER PUBLICATION supabase_realtime ADD TABLE perfis_usuario;
ALTER PUBLICATION supabase_realtime ADD TABLE integracoes_google_agenda;
