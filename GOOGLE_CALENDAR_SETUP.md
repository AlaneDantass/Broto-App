# Configuração da Integração com Google Agenda

Este guia cobre tudo que você precisa fazer **uma vez** para ativar a sincronização bidirecional. O código já está implementado — falta apenas configurar as credenciais externas.

---

## 1. Google Cloud Console — Criar credenciais OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e faça login.
2. Crie um projeto (ou selecione o existente).
3. No menu lateral: **APIs e Serviços → Biblioteca**. Pesquise e ative a **Google Calendar API**.
4. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**.
5. Tipo de aplicativo: **Aplicativo da Web**.
6. Em **URIs de redirecionamento autorizados**, adicione:
   ```
   https://jcxrcojncoibqacqdivw.supabase.co/functions/v1/google-oauth-callback
   ```
7. Clique em **Criar**. Guarde o **Client ID** e o **Client Secret**.

> [!IMPORTANT]
> Se seu app ainda está em modo de **teste** no Google Cloud, adicione sua conta Google em **Usuários de teste** (OAuth consent screen → Test users). Sem isso, a autorização será bloqueada.

---

## 2. Supabase — Adicionar os secrets das Edge Functions

No terminal, com a **Supabase CLI** instalada e logada:

```bash
cd c:\Users\alane\Documents\Broto\broto

supabase secrets set GOOGLE_CLIENT_ID="SEU_CLIENT_ID_AQUI"
supabase secrets set GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET_AQUI"
```

Verifique se os secrets foram salvos:
```bash
supabase secrets list
```

---

## 3. Migration complementar — coluna `email_google`

A Edge Function de callback salva o e-mail do usuário Google. Rode no SQL Editor do Supabase:

```sql
ALTER TABLE public.integracoes_google_agenda
  ADD COLUMN IF NOT EXISTS email_google TEXT;
```

---

## 4. Rodar a migration 004 (coluna `origem`)

No SQL Editor do Supabase, rode o conteúdo de `migrations/004_origem_evento.sql`:

```sql
ALTER TABLE public.eventos_calendario
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'manual'
  CHECK (origem IN ('manual', 'automatico_prazo_task'));

CREATE INDEX IF NOT EXISTS idx_eventos_origem
  ON eventos_calendario(usuario_id, origem);
```

---

## 5. Deploy das Edge Functions

```bash
cd c:\Users\alane\Documents\Broto\broto

# Deploy da função de callback OAuth
supabase functions deploy google-oauth-callback

# Deploy da função de sincronização
supabase functions deploy google-calendar-sync
```

> [!NOTE]
> Se ainda não tem a Supabase CLI instalada:
> ```bash
> npm install -g supabase
> supabase login
> supabase link --project-ref jcxrcojncoibqacqdivw
> ```

---

## 6. Testar o fluxo completo

1. Inicie o Broto: `npm run dev` (na pasta `broto`)
2. Vá em **Configurações → Integração com Google Agenda**
3. Clique em **Conectar Google Agenda**
4. O browser externo abre com a tela do Google — autorize o acesso
5. O Broto detecta o retorno via deep link `broto://oauth-success` e exibe o e-mail da conta conectada
6. Crie um evento manual no Calendário do Broto → confira no Google Agenda

---

## Arquitetura de segurança

```
App Tauri (cliente)
    ↓ Chama Edge Function com JWT do usuário
Edge Function (servidor Supabase)
    ↓ Busca tokens do banco com service role
    ↓ Chama API do Google com access_token
    ↓ Renova token automaticamente se expirado
    ↓ Retorna apenas o resultado (nunca os tokens)
App Tauri (cliente)
```

Os tokens `access_token` e `refresh_token` **nunca chegam ao app** — ficam apenas nas Edge Functions e no banco, acessíveis apenas com `service_role_key` (que só o servidor tem).

---

## Arquivos criados/modificados

| Arquivo | Descrição |
|---------|-----------|
| `migrations/004_origem_evento.sql` | Adiciona coluna `origem` em `eventos_calendario` |
| `supabase/functions/google-oauth-callback/index.ts` | Callback OAuth — troca code por tokens |
| `supabase/functions/google-calendar-sync/index.ts` | Sync bidirecional com Google Calendar API |
| `src/hooks/useGoogleAgenda.ts` | Hook React — estado da integração |
| `src/hooks/useEventosCalendario.ts` | Atualizado com sync automático |
| `src/components/EventoModal.tsx` | Garante campo `origem: 'manual'` |
| `src/routes/ConfiguracoesPage.tsx` | Seção "Integração" com botão conectar/desconectar |
| `src/types/database.ts` | Tipos atualizados |
