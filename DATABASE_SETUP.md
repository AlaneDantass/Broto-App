# Database Setup — Broto Fase 1

## Como Provisionar o Banco de Dados

Você tem duas opções:

### Opção 1: Via Dashboard Supabase (Recomendado - Mais Rápido)

1. Acesse [https://app.supabase.com](https://app.supabase.com) e abra seu projeto `jcxrcojncoibqacqdivw`

2. Vá para **SQL Editor** (lado esquerdo)

3. Clique em **New Query**

4. Copie e cole TODO o conteúdo do arquivo `migrations/001_create_tables.sql` nesta sessão

5. Clique em **Run** (ou `Ctrl+Enter`)

6. Se tudo correr bem, você verá as mensagens de sucesso para cada tabela

7. Verifique em **Database > Tables** que as 9 tabelas foram criadas:
   - blocos
   - tasks
   - checklist_items
   - desvios
   - anotacoes
   - eventos_calendario
   - ideias_futuras
   - pensamentos
   - configuracoes_usuario

### Opção 2: Via Supabase CLI

Se tiver o Supabase CLI instalado:

```bash
supabase db push migrations/001_create_tables.sql
```

## Verificar RLS Policies

Após executar o SQL, verifique em **Database > Authentication > Policies** que as políticas foram criadas para cada tabela. Você deve ver ~36 policies (4 por tabela para SELECT, INSERT, UPDATE, DELETE).

## Habilitar Realtime

Por padrão, Realtime deve estar habilitado nas 4 tabelas:
- tasks
- desvios
- anotacoes
- eventos_calendario

Verifique em **Database > Replication** se essas tabelas estão marcadas como "Replicated".

## Testar a Autenticação

1. Inicie o dev server:
   ```bash
   npm run dev
   ```

2. Abra `http://localhost:5173` no navegador

3. Você verá a página de autenticação (Login/Signup)

4. Clique em "Sign up here" e crie uma conta

5. Após o signup, você será redirecionado para o Dashboard (Fase 2)

## Trigger de Configurações Automáticas

Quando um novo usuário se registra, o trigger `on_auth_user_created` cria automaticamente uma linha em `configuracoes_usuario` com valores padrão:
- limiar_hiperfoco_percentual: 150 (padrão)
- horario_fim_dia: 18:00
- Módulos desativados por padrão

Você pode verificar isso consultando:
```sql
SELECT * FROM configuracoes_usuario;
```

## Próximas Etapas (Fase 2)

Após o banco estar pronto:
1. Shell de navegação (sidebar + rotas refinadas)
2. Componentes de dashboard
3. CRUD de blocos
