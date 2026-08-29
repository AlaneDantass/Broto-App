# 🌿 Broto — Sistema de Organização Neurodivergente-Friendly

**Broto** é um aplicativo desktop de gerenciamento de tarefas projetado especificamente para pessoas neurodivergentes (TDAH/TEA), com foco em **propósito óbvio**, **baixa carga cognitiva** e **ritmo humano**.

## ✨ O Que Você Consegue Fazer

### 🎨 **Block Gallery** — Organize sua vida em blocos
Crie "blocos" de foco (projetos, áreas da vida, temas). Cada bloco tem:
- Ícone emoji customizável
- Descrição simples
- Barra de progresso visual
- Tarefas agrupadas

### ✅ **Tarefas com Modo Foco**
- Criar tarefas simples (só título) ou completas
- **Modo Foco**: Timer com scratchpad integrado
- **Hiperfoco**: Alerta quando você ultrapassa o estimado em 50%+
- Checklist dentro de tarefas
- Campos avançados opcionais (energia, contexto, prioridade)

### 🌊 **Deviation Board**
Quando você está em foco e um pensamento diferente aparece:
- Botão 💭 captura o pensamento rápido
- Registra qual tarefa você estava fazendo
- Organize depois no seu ritmo
- Etiquetar como "resolvido" ou descartar

### 📅 **Calendário + Eventos**
- Vista mensal dos seus eventos
- Eventos coloridos por tipo (Work/Personal/Ideas)
- Criar eventos vinculados a blocos
- Sem prazos obrigatórios

### 💡 **Ideias Futuras**
Espaço sem pressão para capturar inspirações:
- Cards com imagens opcionais
- Tags (ex: "Someday", "Inspiração")
- Nenhuma data limite

### 📥 **Caixa de Entrada**
Captura rápida de pensamentos globais:
- Botão 💭 em qualquer tela
- 3 categorias: Ideia / Tarefa / Nota
- Revisar e organizar depois
- Marcar como resolvido ou descartar

### ⚙️ **Configurações Personalizadas**
- **Limiar de Hiperfoco** — Quanto tempo a mais você pode ficar focado
- **Hora de Fim do Dia** — Quando o app para de contar tempo
- **Campos de Tarefa** — Mostrar apenas o que você precisa
- **Assistência IA** — Ativar sugestões (futuro)

---

## 🚀 Como Começar

### 1. **Primeiro Acesso**
```bash
cd broto
npm run dev
# Abre http://localhost:5173
```

### 2. **Criar uma Conta**
- Email + senha simples
- Supabase cuida da segurança
- Seus dados são seus (RLS policy)

### 3. **Criar seu Primeiro Bloco**
- Clique em "Block Gallery" na sidebar
- Clique em "+ Novo Bloco"
- Escolha um emoji, nome, descrição
- Pronto! Agora você pode adicionar tarefas

### 4. **Entrar em Modo Foco**
- Clique numa tarefa em "Em Andamento"
- Clique no botão de timer (⏱️)
- Timer aparece em fullscreen
- Durante o foco: botão 💭 captura desvios
- Quando terminar: Pausar ou Concluir

### 5. **Revisar Pensamentos Capturados**
- Clique em "📥 Inbox" na sidebar
- Veja tudo que capturou
- Marque como "Resolvido" quando organizar

---

## 🎯 Princípios de Design

Este app foi construído com **COGA (Cognitive Walkthrough)**:

✅ **Frases curtas** — Entenda de primeira  
✅ **Propósito óbvio** — Cada página tem title + descrição  
✅ **Espaço generoso** — Respire, não é apertado  
✅ **Ícones visuais** — Emojis ajudam na navegação  
✅ **Sem bloqueadores** — Nenhum "sim/não" obrigatório  
✅ **Feedback claro** — Veja quando algo está salvando  
✅ **Fluxo linear** — Modal → Ação → Fecha (simples)  

---

## 💾 Armazenamento & Sincronização

- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Email/Senha segura
- **Realtime**: Mudanças sincronizam entre abas automaticamente
- **RLS**: Seus dados isolados por usuário
- **Offline**: Não funciona sem internet (MVP), mas está nos planos

---

## 🛠️ Stack Técnico

```
Desktop:     Tauri 2
Frontend:    React 19 + TypeScript
Styling:     Tailwind CSS v3 + Custom Design Tokens
Routing:     React Router v6
Backend:     Supabase (Postgres + Auth + Realtime)
Build:       Vite
Database:    PostgreSQL com RLS policies
```

---

## 📁 Estrutura de Pastas

```
broto/
├── src/
│   ├── App.tsx                 # Router principal
│   ├── main.tsx                # Entry point
│   ├── index.css               # Estilos globais
│   ├── components/             # 20+ componentes reutilizáveis
│   ├── routes/                 # 8+ páginas
│   ├── hooks/                  # 10+ custom hooks (CRUD)
│   ├── contexts/               # AuthContext
│   ├── lib/
│   │   ├── supabase.ts         # Client Supabase
│   │   └── estimativa.ts       # Lógica de PERT (futuro)
│   └── types/
│       └── database.ts         # TypeScript types
├── src-tauri/
│   ├── tauri.conf.json         # Config desktop
│   ├── Cargo.toml              # Deps Rust
│   └── src/main.rs             # Entry Tauri
├── tailwind.config.js          # Design tokens
├── migrations/
│   └── 001_create_tables.sql   # Schema completo
└── PHASE_10_CHECKLIST.md       # Checklist final
```

---

## 🧪 Teste Realtime Sync

Abra em 2 abas:

**Aba 1:**
```javascript
// Console (F12 → Console)
// Crie uma tarefa
localStorage.getItem('supabase.auth.token')
```

**Aba 2:**
- Atualize página
- Veja a tarefa aparecer instantaneamente
- Modifique na Aba 1
- Mudança reflete em tempo real na Aba 2

---

## 📊 O Que Está Implementado (100%)

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Autenticação | ✅ | Login/Signup seguro via Supabase |
| Block Gallery | ✅ | CRUD blocos com progresso visual |
| Tasks | ✅ | CRUD com status, checklist, foco |
| Modo Foco | ✅ | Timer fullscreen + scratchpad |
| Hiperfoco | ✅ | Alerta quando ultrapassa estimado |
| Deviation Board | ✅ | Captura desvios + revisão |
| Calendário | ✅ | Vista mensal + eventos |
| Ideias Futuras | ✅ | Galeria sem prazos |
| Captura Pensamentos | ✅ | Modal rápido + Inbox |
| Configurações | ✅ | Ritmo, campos, módulos |
| Realtime Sync | ✅ | PostgreSQL subscriptions |
| Design System | ✅ | COGA + tokens customizados |
| Tauri Desktop | ✅ | Empacotamento desktop pronto |

---

## 🔜 Roadmap (Fase 11+)

- 📖 **Diário Visual** — Timeline de dias, resumos
- 🔄 **Rastreador de Hábitos** — Check-in diário
- 🤖 **Sugestões IA** — Claude API para estimativas
- 🔋 **Offline-First** — SQLite local com sync
- 🌙 **Dark Mode** — Toggle light/dark
- 🔔 **Notificações** — Desktop alerts de tarefas
- 📊 **Relatórios** — Análise de produtividade

---

## ❓ FAQ

**P: Meus dados são privados?**  
R: Sim! RLS policies garantem que você só vê seus dados. Nem nós (devs) conseguimos ver sem sua senha.

**P: Funciona offline?**  
R: Não, precisa de internet agora. Mas plano adicionar SQLite local + sync.

**P: Como faço backup?**  
R: Supabase faz backups automáticos. Você pode fazer export via UI deles.

**P: Posso usar no celular?**  
R: Web version sim (localhost no navegador). App nativo mobile é futuro.

**P: É gratuito?**  
R: O Supabase tem tier gratuito (500MB storage, 2M API calls/mês). Suficiente para uso pessoal.

---

## 🌿 Sobre Broto

**Broto** significa "brotando" — a ideia é você fazer suas ideias brotarem sem pressão.

Feito para:
- Pessoas com TDAH/TEA que precisam de interfaces claras
- Qualquer um que quer organizar sem estresse
- Quem valoriza **simplicidade** sobre **features**

---

## 📧 Feedback & Suporte

Se precisar de ajuda:
1. Verifique `PHASE_10_CHECKLIST.md`
2. Leia as seções de configuração acima
3. Teste no browser primeiro (`npm run dev`)
4. Depois teste no Tauri (`npm run tauri dev`)

---

**Feliz organização! 🌿**

Broto v0.1.0 — Sanctuary for your mind
