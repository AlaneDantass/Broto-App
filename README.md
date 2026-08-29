# Broto — Sanctuary for Your Mind

Aplicativo desktop de organização de tarefas e projetos para pessoas neurodivergentes (TEA/TDAH).

## Stack

- **Frontend**: Tauri 2 + React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Desktop**: Tauri CLI (empacotamento)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar dev server Vite
npm run dev

# Iniciar app Tauri em dev
npm run dev:tauri

# Build para produção
npm run build:tauri
```

## Configuração Supabase

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://jcxrcojncoibqacqdivw.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Estrutura de Pastas

```
src/
  main.tsx          # Entrada React
  App.tsx           # Componente raiz
  index.css         # Estilos globais (Tailwind)
  contexts/         # Contextos (Auth, etc)
  lib/              # Utilidades (supabase.ts, estimativa.ts, etc)
  types/            # Tipos TypeScript
  routes/           # Páginas/áreas (galeria, tasks, etc)
  components/       # Componentes reutilizáveis
  hooks/            # Custom hooks
src-tauri/          # Código Rust do Tauri
  tauri.conf.json   # Config do aplicativo
  src/main.rs       # Entrypoint Rust
```

## Design System

Todos os tokens de design (cores, tipografia, espaçamento) estão definidos em `DESING.md` e configurados no `tailwind.config.js`.

**Paleta Botanical Serenity**:
- Fundo: `#fcfae2` (surface)
- Primária: `#536347` (Muted Moss)
- Secundária: `#535d7d` (Periwinkle Sky)
- Tipografia: Playfair Display (títulos) + DM Sans (corpo)

## Próximas Fases

1. **Fase 1** — Banco de dados + Autenticação
2. **Fase 2** — Shell de navegação (sidebar + rotas)
3. **Fase 3** — Blocos (Block Gallery)
4. **Fase 4** — Tasks e Modo Foco
5. **Fase 5** — Deviation Board
6. **Fase 6** — Calendário
7. **Fase 7** — Future Ideas
8. **Fase 8** — Captura de Pensamento + Triagem
9. **Fase 9** — Configurações
10. **Fase 10** — Polish e empacotamento
