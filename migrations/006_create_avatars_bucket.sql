-- Criação do bucket 'avatars' caso não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de segurança para o bucket 'avatars'
-- 1. Permitir visualização pública de qualquer avatar
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Permitir que usuários autenticados façam upload de seus avatares
CREATE POLICY "Usuários podem fazer upload de avatares"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Permitir que usuários atualizem/deletem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem deletar seus avatares"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);
