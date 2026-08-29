# 🧪 Broto — Plano de Teste Completo

**Status**: Dev server ✅ rodando em http://localhost:5175  
**Data**: 2026-08-25  
**Objetivo**: Validar 100% das funcionalidades do MVP

---

## 📋 Roteiro de Teste

### ✅ MÓDULO 1: AUTENTICAÇÃO (5-10 min)

#### 1.1 Signup (Criar Conta)
- [ ] Abra http://localhost:5175
- [ ] Página de Login aparece com campo de email/senha
- [ ] Clique em "Criar Conta" ou "Don't have an account?"
- [ ] Digite: `teste@broto.local` + senha `123456Test!`
- [ ] Clique "Sign Up"
- [ ] **Esperado**: Redirecionado para dashboard, sidebar visível

#### 1.2 Verificar Autenticação
- [ ] Refresh page (F5)
- [ ] **Esperado**: Mantém sessão (não redireciona para login)
- [ ] Console (F12 → Application → localStorage) contém `supabase.auth.token`?

#### 1.3 Logout
- [ ] Clique em "Logout" no rodapé da sidebar
- [ ] **Esperado**: Redireciona para /login, sessão limpa

#### 1.4 Login
- [ ] Faça login com credenciais do teste
- [ ] **Esperado**: Dashboard aparece, mesmo usuário restaurado

---

### ✅ MÓDULO 2: BLOCK GALLERY (10-15 min)

#### 2.1 Navegar para Block Gallery
- [ ] Na sidebar, clique em "🎨 Block Gallery"
- [ ] **Esperado**: Página carrega com título "Block Gallery" e botão "+ Novo Bloco"

#### 2.2 Criar Primeiro Bloco
- [ ] Clique "+ Novo Bloco"
- [ ] Modal abre com campos: Emoji, Nome, Descrição, Categoria
- [ ] Preencha:
  - Emoji: 💻
  - Nome: "Programação"
  - Descrição: "Projetos de código"
  - Categoria: "Career"
- [ ] Clique "Criar"
- [ ] **Esperado**: Modal fecha, card aparece na galeria

#### 2.3 Verificar Card do Bloco
- [ ] Card mostra: emoji, nome, categoria badge, barra progresso (0%)
- [ ] Hover no card muda cor de fundo
- [ ] **Esperado**: Progressão visual clara

#### 2.4 Criar Segundo Bloco
- [ ] Clique "+ Novo Bloco"
- [ ] Preencha:
  - Emoji: 📚
  - Nome: "Aprendizado"
  - Descrição: "Novos cursos e skills"
  - Categoria: "Learning"
- [ ] Clique "Criar"
- [ ] **Esperado**: 2 blocos visíveis na galeria

#### 2.5 Abrir Detalhe de Bloco
- [ ] Clique no card "Programação"
- [ ] **Esperado**: Navega para /bloco/{id} com:
  - Nome do bloco em título
  - Abas: "Em Andamento" | "Pendentes" | "Concluídas"
  - Botão "+ Nova Tarefa"

#### 2.6 Editar Bloco
- [ ] Na página de detalhe, clique no ícone de editar (✏️)
- [ ] Modal abre com dados preenchidos
- [ ] Mude descrição para "Projetos sério"
- [ ] Clique "Atualizar"
- [ ] **Esperado**: Descrição atualiza na página

#### 2.7 Voltar à Galeria
- [ ] Clique em "Block Gallery" na sidebar
- [ ] **Esperado**: 2 blocos ainda visíveis (dados persistem)

---

### ✅ MÓDULO 3: TAREFAS (15-20 min)

#### 3.1 Criar Tarefa Simples
- [ ] Em "Block Gallery", clique em "Programação"
- [ ] Clique "+ Nova Tarefa"
- [ ] Modal abre com campo de título
- [ ] Digite: "Corrigir bug #123"
- [ ] Clique "Criar"
- [ ] **Esperado**: Tarefa aparece na aba "Pendentes"

#### 3.2 Criar Tarefa Completa
- [ ] Clique "+ Nova Tarefa"
- [ ] Preencha:
  - Título: "Implementar login"
  - Descrição: "Auth com Supabase"
  - Energia: "Alta"
  - Contexto: "Precisa da tarde inteira"
  - Prioridade: "5"
  - Tempo estimado: "120 minutos"
- [ ] Clique "Criar"
- [ ] **Esperado**: Tarefa aparece com todos os dados visíveis

#### 3.3 Marcar Tarefa como "Em Andamento"
- [ ] Clique na tarefa "Corrigir bug #123"
- [ ] Modal abre
- [ ] Mude status para "Em Andamento"
- [ ] Clique "Salvar"
- [ ] **Esperado**: Tarefa move para aba "Em Andamento"

#### 3.4 Adicionar Checklist
- [ ] Clique na tarefa "Implementar login"
- [ ] No modal, clique "+ Adicionar item"
- [ ] Digite: "Criar form de login"
- [ ] Clique "Salvar"
- [ ] **Esperado**: Item aparece na lista

#### 3.5 Completar Item de Checklist
- [ ] Clique no checkbox do item
- [ ] **Esperado**: Item fica com strikethrough, progress atualiza

#### 3.6 Completar Tarefa
- [ ] Clique na tarefa "Em Andamento"
- [ ] Mude status para "Concluída"
- [ ] Clique "Salvar"
- [ ] **Esperado**: Tarefa move para aba "Concluídas", com data de conclusão

#### 3.7 Deletar Tarefa
- [ ] Em "Concluídas", clique na tarefa concluída
- [ ] Clique "Deletar"
- [ ] Confirme no prompt
- [ ] **Esperado**: Tarefa desaparece

---

### ✅ MÓDULO 4: MODO FOCO (15-20 min)

#### 4.1 Ativar Modo Foco
- [ ] Na aba "Em Andamento", clique na tarefa "Corrigir bug #123"
- [ ] Clique no botão ⏱️ "Modo Foco"
- [ ] **Esperado**: Fullscreen timer abre, mostra:
  - Nome da tarefa
  - Timer: 00:00 (começando)
  - Botões: Pausar | Concluir | Desvio 💭
  - Scratchpad (textarea)

#### 4.2 Timer Funciona
- [ ] Timer deve começar a contar: 00:01, 00:02...
- [ ] **Esperado**: Segundos incrementam em tempo real

#### 4.3 Escrever no Scratchpad
- [ ] Clique na textarea "Notas..."
- [ ] Digite: "Preciso verificar logs no servidor"
- [ ] **Esperado**: Texto persiste no componente

#### 4.4 Capturar Desvio
- [ ] Clique no botão 💭 "Capturar Desvio"
- [ ] Modal abre
- [ ] Digite: "Comprar café"
- [ ] Selecione "Nota"
- [ ] Clique "Capturar"
- [ ] **Esperado**: Modal fecha, volta ao foco mode, timer continua

#### 4.5 Pausar e Retomar Timer
- [ ] Clique "Pausar"
- [ ] **Esperado**: Timer para de contar, botão muda para "Retomar"
- [ ] Clique "Retomar"
- [ ] **Esperado**: Timer continua incrementando

#### 4.6 Concluir Foco
- [ ] Deixe rodar alguns segundos
- [ ] Clique "Concluir"
- [ ] **Esperado**: 
  - Fullscreen fecha
  - Volta para página de tarefas
  - Tarefa agora mostra tempo gasto (ex: "1 min")

#### 4.7 Verificar Tempo Gasto
- [ ] Clique na tarefa que finalizou
- [ ] Modal mostra "Tempo gasto: 1 minuto"
- [ ] **Esperado**: Cronômetro funcionou

---

### ✅ MÓDULO 5: DEVIATION BOARD (10-15 min)

#### 5.1 Acessar Deviation Board
- [ ] Na sidebar, clique "🌊 Deviation Board"
- [ ] **Esperado**: Página carrega com título "Deviation Board"

#### 5.2 Verificar Desvio Capturado
- [ ] Na lista, veja "Comprar café" que capturou no foco mode
- [ ] Card mostra: texto, origem (qual tarefa), botões ✓ | 🗑
- [ ] **Esperado**: Desvio organizado por tarefa de origem

#### 5.3 Filtrar por Tag
- [ ] Alguns desvios têm tag "UNRELATED"
- [ ] Clique no filtro de tag "UNRELATED"
- [ ] **Esperado**: Lista filtra apenas desvios com essa tag

#### 5.4 Marcar como Resolvido
- [ ] Clique ✓ em um desvio
- [ ] **Esperado**: Desvio sai da lista (triado = true)

#### 5.5 Deletar Desvio
- [ ] Clique 🗑 em um desvio
- [ ] Confirme
- [ ] **Esperado**: Desvio removido

#### 5.6 Stats
- [ ] Verifique card de stats no final
- [ ] Mostra: X Pendentes | Y Resolvidos | Z Tags
- [ ] **Esperado**: Números refletem a lista

---

### ✅ MÓDULO 6: CALENDÁRIO (10-15 min)

#### 6.1 Acessar Calendário
- [ ] Na sidebar, clique "📅 General Calendar"
- [ ] **Esperado**: Vista mensal aparece
  - Grid 7x6 (7 dias x até 6 semanas)
  - Cabeçalho com "Agosto 2026"
  - Botões: Anterior | Hoje | Próximo

#### 6.2 Navegar Meses
- [ ] Clique "Próximo"
- [ ] **Esperado**: Mês muda para Setembro
- [ ] Clique "Anterior" 2x
- [ ] **Esperado**: Volta para Agosto

#### 6.3 Hoje Destacado
- [ ] Clique "Hoje"
- [ ] **Esperado**: 
  - Navega para mês atual
  - Dia 25 tem fundo especial (bg-primary-container)

#### 6.4 Criar Evento
- [ ] Clique em um dia (ex: dia 28)
- [ ] **Esperado**: Algo acontece (modal ou navegação)
- [ ] Se abrir modal de evento:
  - Digite: "Apresentação de projeto"
  - Tipo: "Work Blocks"
  - Clique "Criar"

#### 6.5 Evento Aparece no Calendar
- [ ] Volte à vista de calendário
- [ ] No dia 28, veja o evento em card colorido
- [ ] **Esperado**: Cor corresponde ao tipo (azul para Work)

#### 6.6 Legenda
- [ ] No final da página, veja "Tipos de Evento"
- [ ] 3 cores: 
  - 🔵 Work Blocks
  - 🟣 Personal Sanctuary
  - 🟦 Future Ideas
- [ ] **Esperado**: Cores batem com eventos

---

### ✅ MÓDULO 7: IDEIAS FUTURAS (10 min)

#### 7.1 Acessar Ideias
- [ ] Na sidebar, clique "💡 Future Ideas"
- [ ] **Esperado**: Página carrega com "+ Nova Ideia"

#### 7.2 Criar Ideia
- [ ] Clique "+ Nova Ideia"
- [ ] Modal abre
- [ ] Preencha:
  - Título: "Aprender Rust"
  - Descrição: "Reescrever CLI tools"
  - Tag: "Someday"
  - Imagem: (deixar vazio)
- [ ] Clique "Criar"
- [ ] **Esperado**: Card aparece na galeria

#### 7.3 Card Visual
- [ ] Card mostra:
  - Título "Aprender Rust"
  - Descrição (primeiras 3 linhas)
  - Tag em badge: "Someday"
  - Botões: Editar | Remover

#### 7.4 Editar Ideia
- [ ] Clique "Editar"
- [ ] Modal abre com dados preenchidos
- [ ] Mude tag para "Inspiração"
- [ ] Clique "Atualizar"
- [ ] **Esperado**: Tag atualiza no card

#### 7.5 Remover Ideia
- [ ] Clique "Remover"
- [ ] Confirme
- [ ] **Esperado**: Card desaparece da galeria

---

### ✅ MÓDULO 8: CAPTURA DE PENSAMENTOS (10-15 min)

#### 8.1 Captura Global
- [ ] De qualquer página, clique no botão 💭 flutuante (canto inferior direito)
- [ ] **Esperado**: Modal abre com campos:
  - O que está em mente?
  - Detalhes (opcional)
  - 3 radio buttons: Ideia | Tarefa | Nota

#### 8.2 Capturar Pensamento
- [ ] Digite: "Ligar para a mãe"
- [ ] Selecione "Tarefa"
- [ ] Clique "Capturar"
- [ ] **Esperado**: Modal fecha, volta à página anterior

#### 8.3 Acessar Caixa de Entrada
- [ ] Na sidebar, clique "📥 Inbox"
- [ ] **Esperado**: Página "Caixa de Entrada" carrega
- [ ] Veja "Ligar para a mãe" na lista

#### 8.4 Expandir Pensamento
- [ ] Clique no ▼ do pensamento
- [ ] **Esperado**: Expande mostrando categoria (Tarefa) e detalhes

#### 8.5 Marcar como Resolvido
- [ ] Clique "✓ Resolvido"
- [ ] **Esperado**: Pensamento sai da lista (triado = true)

#### 8.6 Descartar
- [ ] Capture outro pensamento: "Estudar JavaScript"
- [ ] Clique "🗑 Descartar"
- [ ] Confirme
- [ ] **Esperado**: Pensamento removido

#### 8.7 Stats
- [ ] Verifique contador no final
- [ ] Mostra quantidade de pensamentos pendentes
- [ ] **Esperado**: Número diminui conforme resolve

---

### ✅ MÓDULO 9: CONFIGURAÇÕES (10-15 min)

#### 9.1 Acessar Configurações
- [ ] Na sidebar, clique "⚙️ Settings"
- [ ] **Esperado**: Página "Configurações" carrega com 4 seções

#### 9.2 Foco & Ritmo
- [ ] Seção "⏱️ Foco & Ritmo" visível
- [ ] Slider: "Limiar de Hiperfoco"
  - Valor atual: 150%
  - Range: 100-300%
- [ ] Input: "Hora de fim do dia"
  - Valor: 18:00

#### 9.3 Ajustar Limiar
- [ ] Mova slider para 200%
- [ ] **Esperado**: Valor atualiza em tempo real

#### 9.4 Ajustar Hora Fim
- [ ] Clique no input de hora
- [ ] Mude para 19:30
- [ ] Clique fora
- [ ] **Esperado**: Hora salva (auto-save)

#### 9.5 Assistência Inteligente
- [ ] Seção "🤖 Assistência Inteligente" visível
- [ ] Checkbox: "Ativar sugestões de IA"
- [ ] Clique checkbox
- [ ] **Esperado**: Estado muda (checked/unchecked)

#### 9.6 Campos de Tarefa
- [ ] Seção "📋 Campos de Tarefa Avançados"
- [ ] 3 checkboxes:
  - ⚡ Energia Estimada
  - 🎯 Contexto
  - 🔢 Prioridade Numérica
- [ ] Ative "Energia Estimada"
- [ ] **Esperado**: Checkbox marcado

#### 9.7 Verificar Campos em Nova Tarefa
- [ ] Volte a "Programação" bloco
- [ ] Clique "+ Nova Tarefa"
- [ ] **Esperado**: Campo "Energia" aparece no modal

#### 9.8 Módulos Opcionais
- [ ] Seção "🧩 Módulos Opcionais" visível
- [ ] 2 checkboxes (desabilitados, futuros):
  - 📖 Diário Visual
  - 🔄 Rastreador de Hábitos
- [ ] **Esperado**: Desabilitados com mensagem "Fase 11"

---

### ✅ MÓDULO 10: REALTIME SYNC (10-15 min)

#### 10.1 Preparar 2 Abas
- [ ] Abra http://localhost:5175 em 2 abas diferentes
- [ ] Faça login em ambas com mesmo user
- [ ] Nomeie mentally: Aba A (esquerda) | Aba B (direita)

#### 10.2 Criar Tarefa em Aba A
- [ ] Em Aba A: "Programação" → "+ Nova Tarefa"
- [ ] Digite: "Sync test task"
- [ ] Clique "Criar"
- [ ] **Esperado**: Tarefa aparece em Aba A

#### 10.3 Verificar em Aba B
- [ ] Mude para Aba B
- [ ] Vá para "Programação"
- [ ] **Esperado**: "Sync test task" aparece AUTOMATICAMENTE (realtime)
- [ ] Se não apareceu: Refresh (F5), deve estar lá

#### 10.4 Atualizar em Aba A
- [ ] Em Aba A: Clique em "Sync test task"
- [ ] Mude status para "Em Andamento"
- [ ] Clique "Salvar"

#### 10.5 Verificar Mudança em Aba B
- [ ] Mude para Aba B
- [ ] **Esperado**: Tarefa mudou de aba "Pendentes" → "Em Andamento" AUTOMÁTICO

#### 10.6 Criar Pensamento em Aba B
- [ ] Em Aba B: Clique 💭 flutuante
- [ ] Digite: "Realtime works!"
- [ ] Clique "Capturar"

#### 10.7 Verificar em Aba A
- [ ] Em Aba A: Vá para "📥 Inbox"
- [ ] **Esperado**: "Realtime works!" aparece AUTOMÁTICO

#### 10.8 Conclusão
- [ ] ✅ Se tudo acima funcionou = Realtime Sync funciona!

---

### ✅ MÓDULO 11: NAVEGAÇÃO & ACESSIBILIDADE (10 min)

#### 11.1 Sidebar Navigation
- [ ] Todos os links funcionam:
  - [ ] 🎨 Block Gallery
  - [ ] 📅 General Calendar
  - [ ] 💡 Future Ideas
  - [ ] 🌊 Deviation Board
  - [ ] 📥 Inbox
  - [ ] ⚙️ Settings
- [ ] **Esperado**: Cada rota navega corretamente

#### 11.2 Active State
- [ ] Página atual em sidebar tem fundo destacado
- [ ] **Esperado**: Usuário sabe onde está

#### 11.3 Responsividade
- [ ] Abra dev tools (F12)
- [ ] Redimensione para mobile (320px width)
- [ ] **Esperado**: 
  - Layout não quebra
  - Texto legível
  - Botões clicáveis

#### 11.4 Acessibilidade
- [ ] Todos os inputs têm labels
- [ ] Botões têm texto claro
- [ ] Descrições explicam propósito
- [ ] **Esperado**: Interface intuitiva (COGA compliant)

---

## 📊 Resumo de Teste

Crie uma tabela com resultado:

| Módulo | Testes | Passou | Notas |
|--------|--------|--------|-------|
| Autenticação | 4 | ✅/❌ | |
| Block Gallery | 7 | ✅/❌ | |
| Tarefas | 7 | ✅/❌ | |
| Modo Foco | 7 | ✅/❌ | |
| Deviation Board | 6 | ✅/❌ | |
| Calendário | 6 | ✅/❌ | |
| Ideias Futuras | 5 | ✅/❌ | |
| Pensamentos | 7 | ✅/❌ | |
| Configurações | 8 | ✅/❌ | |
| Realtime Sync | 8 | ✅/❌ | |
| Navegação | 4 | ✅/❌ | |
| **TOTAL** | **59** | **X/59** | |

---

## 🐛 Se Algo Quebrar

### Debug Steps:
1. Abra Console (F12 → Console)
2. Procure por red errors
3. Anote mensagem de erro
4. Verifique `.env.local` tem URLs corretas
5. Verifique Supabase tables existem
6. Tente refresh (F5)

### Common Issues:
- **"Failed to fetch"** → Supabase offline ou credenciais erradas
- **"Cannot read property"** → Falta dados no banco
- **"RLS policy error"** → Usuário não autenticado ou sem permissão
- **"Module not found"** → Rebuild: `npm run build`

---

## ✨ Parabéns!

Se todos os testes passaram: **🎉 Broto está 100% funcional!**

Próximo passo: Deploy ou continuar para Fase 11+ features.

