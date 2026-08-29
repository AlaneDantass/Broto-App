# 🏗️ Arquitetura do Broto

## Visão de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Broto Desktop App                        │
│                  (Tauri 2 + React 19)                        │
└────────────┬────────────────────────────────────────┬────────┘
             │                                        │
        ┌────▼─────┐                          ┌──────▼─────┐
        │  Browser  │                          │   Tauri    │
        │   (Dev)   │                          │  Runtime   │
        │  Port     │                          │  (Desktop) │
        │  5173     │                          │  Bundled   │
        └────┬─────┘                          └──────┬─────┘
             │                                        │
             └────────────────┬─────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │   Frontend App   │
                    │ React Router v6  │
                    │ TypeScript       │
                    │ Tailwind CSS     │
                    └─────────┬────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐ ┌────▼─────┐ ┌────▼────┐
         │  Context    │ │ Hooks    │ │Components
         │  Layer      │ │ (CRUD)   │ │
         │ AuthContext │ │useBlocos │ │Card
         │             │ │useTasks  │ │Modal
         │             │ │useDesvios│ │Sidebar
         │             │ │etc       │ │FocusMode
         └──────┬──────┘ └────┬─────┘ └────┬────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                    ┌─────────▼────────┐
                    │   Supabase SDK   │
                    │ (Client Library) │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼──────┐      ┌──────▼──────┐      ┌───────▼────┐
   │ PostgreSQL │      │   Auth      │      │  Realtime  │
   │ Database   │      │ (JWT Auth)  │      │ (Subscript)│
   │            │      │             │      │            │
   │ 9 Tables   │      │ Email/Pass  │      │ 5 Tables   │
   │ RLS Enabled│      │ Deep-link   │      │ Monitored  │
   │            │      │ OAuth       │      │            │
   └────────────┘      └─────────────┘      └────────────┘
```

## Fluxo de Autenticação

```
User
  │
  ├─ Opens App
  │
  ├─ No session? → AuthPage (Login/Signup)
  │                │
  │                ├─ Email + Password
  │                ├─ Supabase.auth.signUp/signIn
  │                └─ JWT token stored → localStorage
  │
  └─ Session valid? → DashboardLayout
                      │
                      ├─ Sidebar (Navigation)
                      ├─ Main content (Routes)
                      └─ FloatingCaptureButton (Global)
```

## Estrutura de Rotas

```
/
├─ /login                      → AuthPage
├─ /                           → DashboardLayout + DefaultPage
├─ /galeria                    → GaleriaPage (Blocos)
├─ /bloco/:blocoId             → BlocoDetailPage (Tasks)
├─ /calendario                 → CalendarioPage (Eventos)
├─ /ideias                     → IdeiasPage (Futuras)
├─ /desvios                    → DesviosPage (Deviation Board)
├─ /triagem                    → TriagemPage (Inbox)
└─ /configuracoes              → ConfiguracoesPage (Settings)
```

## Camadas de Dados

### 1️⃣ **Autenticação** (`AuthContext`)
```typescript
// Globalizado via Context
useAuth() → {
  user,        // Current logged user
  loading,     // Auth state loading
  signUp(),    // Create account
  signIn(),    // Login
  signOut()    // Logout
}
```

### 2️⃣ **CRUD Hooks** (Custom Hooks)
```typescript
// Cada tabela tem seu hook
useBlocos()
  └─ getAll(), create(), update(), delete()
  └─ Subscriptions built-in
  └─ Estado sincronizado automaticamente

useTasks()
  └─ getAll(), create(), updateStatus(), delete()
  └─ Realtime updates
  └─ Checklist integration

useDesvios()
  └─ Capture desvio during focus
  └─ Filter by tag/origin
  └─ Toggle concluído

useEventosCalendario()
  └─ Create events
  └─ Filter by month/day
  └─ Link to blocos

useIdeiasF uturas()
  └─ CRUD com tags

usePensamentos()
  └─ Create capture
  └─ Triage workflow
  └─ Delete/Archive

useConfiguracoes()
  └─ Read user preferences
  └─ Update (auto-save)
```

### 3️⃣ **Componentes Reutilizáveis**
```
components/
├─ Layout
│  ├─ Sidebar         → Navigation
│  ├─ DashboardLayout → Shell (Sidebar + Main + Floating)
│  └─ FloatingCaptureButton
│
├─ Common
│  ├─ Modal           → Reusable modal with backdrop
│  ├─ Card            → Content container
│  └─ SettingsSection → Settings group
│
├─ Block Gallery
│  ├─ BlocoCard       → Display
│  └─ BlocoModal      → Create/Edit
│
├─ Tasks
│  ├─ TaskCard        → Display
│  ├─ TaskModal       → Create/Edit
│  └─ FocusMode       → Timer fullscreen
│
├─ Deviations
│  ├─ DesvioCard      → Display
│  └─ CaptureDesvioModal
│
├─ Thoughts
│  └─ CaptureThoughtModal
│
├─ Ideas
│  ├─ IdeiaCard       → Display
│  └─ IdeiaModal      → Create/Edit
│
└─ Auth
   └─ AuthPage        → Login/Signup
```

## Schema de Dados (Supabase/PostgreSQL)

```sql
-- Core Tables
blocos                  -- Projects/Focal Areas
├─ id, usuario_id (PK)
├─ nome, descricao
├─ categoria, icone
└─ meta_atual, meta_total

tasks                   -- Actionable items
├─ id, usuario_id, bloco_id (FK)
├─ titulo, descricao
├─ status (pendente/em_andamento/concluida)
├─ tempo_estimado, tempo_gasto
└─ is_programming (Git fields)

checklist_items         -- Subtasks
├─ id, usuario_id, task_id (FK)
├─ texto, concluido, ordem

desvios                 -- Captured distractions
├─ id, usuario_id, origem_task_id (FK)
├─ texto, tag, concluido

anotacoes               -- Block notes
├─ id, usuario_id, bloco_id (FK)
├─ titulo, conteudo

eventos_calendario      -- Calendar events
├─ id, usuario_id, bloco_id (FK nullable)
├─ titulo, data, hora, tipo, cor

ideias_futuras          -- No-deadline ideas
├─ id, usuario_id
├─ titulo, descricao, imagem_url, tag

pensamentos             -- Inbox
├─ id, usuario_id
├─ titulo, detalhes, categoria
├─ triado, destino_tipo, destino_id

configuracoes_usuario   -- User prefs (PK = usuario_id)
├─ usuario_id (PK)
├─ limiar_hiperfoco_percentual
├─ horario_fim_dia
├─ campo_*_visivel (booleans)
└─ modulo_*_ativo (booleans)

-- Policies (RLS)
→ All tables: auth.uid() = usuario_id
→ User isolated to own data
```

## Realtime Subscriptions

```typescript
// 5 tables actively monitored:
pensamentos         ← Inbox changes
tasks               ← Task status/updates
desvios             ← New deviations
eventos_calendario  ← New events
ideias_futuras      ← New ideas

// Flow:
1. User action (create/update/delete)
2. Supabase writes to DB
3. RLS policy checks: is this user allowed?
4. Realtime event broadcasts
5. Client subscription fires
6. Hook refetches data
7. React re-renders with latest state
```

## Design System

### Color Palette (Botanical Serenity)
```
Primary:        #536347 (Deep Sage)
Secondary:      #535d7d (Dusty Blue)
Tertiary:       #6d5c7d (Mauve)
Error:          #B3261E

Surface:        #fffbfe
Surface High:   #f6eff4
Surface Variant:#ddd6e0

On-surface:     #1a1a1a
On-surface-var: #49454e
```

### Typography
```
Headlines:      Playfair Display (serif)
Body:           DM Sans (sans-serif)
Sizes:          headline-lg (32px) → label-sm (12px)
```

### Spacing Scale
```
Base unit: 8px
Scale: 2, 3, 4, 6, 8 units
Padding: 4-8px (compact), 16-24px (generous)
Gap: 8-16px (components)
```

### Rounded Corners
```
Buttons:    8px
Cards:      12px
Inputs:     8px
Consistent: No sharp corners
```

## Performance Optimizations

```
Build Time:      2-3s (Vite)
Bundle Size:     511kb (uncompressed)
                 141kb (gzipped)
Modules:         105+
Lazy Loading:    React Router routes
Code Splitting:  Vite auto-chunk
Realtime:        Selective subscriptions (not all tables)
Auth:            Token stored + refreshed
```

## Security

```
✅ Auth:         Supabase JWT (secure tokens)
✅ Database:     RLS policies (row-level)
✅ API:          Only via Supabase SDK
✅ Secrets:      .env.local (not committed)
✅ CORS:         Handled by Supabase
✅ Deep-link:    broto:// scheme (desktop only)
```

## Development Workflow

```
npm run dev
  └─ Vite server (5173)
     └─ React HMR
     └─ Tailwind JIT
     └─ TS type-check

npm run build
  └─ TypeScript compile
  └─ Vite optimize
  └─ Dist folder (production)

npm run tauri dev
  └─ Vite dev server (background)
  └─ Tauri dev window
  └─ Rust compilation
  └─ Live reload on file change

npm run tauri build
  └─ TypeScript compile
  └─ Vite production build
  └─ Tauri release build
  └─ MSI/DMG/Deb bundles
```

## Extensibility Points

```
🔌 Add new page:
   1. Create src/routes/NewPage.tsx
   2. Import in App.tsx
   3. Add route <Route path="/new" />
   4. Add to NAV_ITEMS in Sidebar.tsx

🔌 Add new hook:
   1. Create src/hooks/useNewTable.ts
   2. Implement CRUD + subscription
   3. Export from hooks index
   4. Use in components via useNewTable()

🔌 Add new component:
   1. Create src/components/NewComponent.tsx
   2. Export in components/index.ts
   3. Use in pages/routes

🔌 Add Supabase table:
   1. Create via SQL or Supabase UI
   2. Enable RLS with usuario_id filter
   3. Enable Realtime if needed
   4. Create TypeScript type in types/database.ts
   5. Create hook with CRUD
```

---

**This architecture prioritizes:**
- 🎯 Clarity over cleverness
- 🔒 Security (RLS everywhere)
- ⚡ Performance (selective sync)
- 🧠 Cognitive load (simple patterns)
- 📱 Scalability (modular components)

