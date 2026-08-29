# 🧪 Teste Atual do Sistema — Checklist Executivo

**Data**: 2026-08-25  
**Servidor**: http://localhost:5175 (iniciando)  
**Escopo**: Validar implementações recentes

---

## ✅ TESTE 1: Sidebar Dock Minimalista

### 1.1 Sidebar Recolhida
- [ ] Abra app em browser
- [ ] Veja sidebar no canto esquerdo (80px de largura)
- [ ] Mostra só ícones (sem rótulos)
- [ ] Cor fundo: Olive Green `#6B705C`
- [ ] Ícones: Layout, Calendar, Lightbulb, AlertCircle, Settings, LogOut

### 1.2 Toggle Expandir
- [ ] Clique no ➜ (ChevronRight) no topo da sidebar
- [ ] Sidebar expande suavemente para 224px (transição 300ms)
- [ ] Rótulos aparecem com fade-in ao lado dos ícones
- [ ] "Block Gallery", "General Calendar", "Future Ideas", etc. aparecem
- [ ] Ícone toggle rotaciona 180° (chevron aponta para esquerda)

### 1.3 Item Ativo
- [ ] Página atual (ex: /galeria) tem item destacado como pílula
- [ ] Pílula: fundo `#FFE8D6` (Peach Cream), texto `#6B705C` (Olive)
- [ ] Itens inativos: ícones/texto em `#FFE8D6` opacity-60

### 1.4 Navegação Mantém Estado Expandido
- [ ] Sidebar está expandida (224px)
- [ ] Clique em "General Calendar"
- [ ] Página muda para calendário
- [ ] **Sidebar permanece expandida** (não encolhe automaticamente)
- [ ] Novo item "General Calendar" agora destaca como pílula

### 1.5 Toggle Recolher Manual
- [ ] Sidebar está expandida
- [ ] Clique novamente no ➜
- [ ] Sidebar encolhe suavemente para 80px
- [ ] Rótulos desaparecem com fade-out
- [ ] Só ícones ficam visíveis

### 1.6 Logout
- [ ] Expanda sidebar
- [ ] Veja botão "Logout" com ícone LogOut
- [ ] Clique em Logout
- [ ] Redireciona para /login
- [ ] Sessão limpa

---

## ✅ TESTE 2: Ícones Lucide (Minimalistas)

### 2.1 Botão Flutuante
- [ ] Canto inferior direito tem botão circular (primary color)
- [ ] Mostra ícone `MessageCircle` (linha fina, minimalista)
- [ ] **Não é emoji** 💭, é ícone geométrico

### 2.2 Modal de Captura Rápida
- [ ] Clique no botão flutuante
- [ ] Modal abre com título "O que está em mente?"
- [ ] 3 buttons para categoria:
  - [ ] `Lightbulb` + "Ideia" (ícone minimalista)
  - [ ] `CheckCircle` + "Tarefa" (ícone minimalista)
  - [ ] `FileText` + "Nota" (ícone minimalista)
- [ ] **Nenhum emoji**, só ícones

### 2.3 Ícones Consistentes
- [ ] Todos os ícones têm traço fino (1.5-2px)
- [ ] Geométricos e minimalistas
- [ ] Mesma altura e alinhamento
- [ ] Cor: herda do texto (branca em dark, preta em light)

---

## ✅ TESTE 3: Checklist Funcional (Recente)

### 3.1 Criar Tarefa com Checklist
- [ ] Vá para Block Gallery
- [ ] Clique em um bloco (ex: "Programação")
- [ ] Clique "+ Nova Tarefa"
- [ ] Crie tarefa: "Implementar login"
- [ ] Clique "Salvar"
- [ ] Tarefa aparece em "Pendentes"

### 3.2 Expandir Checklist
- [ ] Clique no botão "▼ Ver checklist" na tarefa
- [ ] Panel expande mostrando:
  - [ ] Progress bar vazio (0%)
  - [ ] Botão "+ Adicionar item"

### 3.3 Adicionar Items
- [ ] Clique "+ Adicionar item"
- [ ] Form aparece: input + botões ✓ e ✕
- [ ] Digite: "Criar form de login"
- [ ] Clique ✓
- [ ] Item aparece na lista com checkbox
- [ ] Progress atualiza (1 item = 1/1 = 100%? ou 0/1?)

### 3.4 Marcar Concluído
- [ ] Clique checkbox do item
- [ ] Item fica com strikethrough
- [ ] Texto fica desaturado (on-surface-variant)
- [ ] Progress bar atualiza

### 3.5 Deletar Item
- [ ] Hover no item do checklist
- [ ] Botão 🗑️ aparece
- [ ] Clique para deletar
- [ ] Item desaparece
- [ ] Progress recalcula

---

## ✅ TESTE 4: Paleta de Cores (Broto)

### 4.1 Sidebar Colors
- [ ] Fundo: Olive Green `#6B705C` (escuro, sólido)
- [ ] Pílula ativa: Peach Cream `#FFE8D6` (claro)
- [ ] Ícone/texto ativo: Olive Green `#6B705C`
- [ ] Ícone/texto inativo: Peach Cream opacity-60 (discreto)

### 4.2 Outras Cores
- [ ] Primária (botões): Azul (primary)
- [ ] Secundária: Dusty Blue
- [ ] Terciária: Mauve
- [ ] Backgrounds: Light variants (surface)

---

## ✅ TESTE 5: Transições & Animações

### 5.1 Sidebar Expansão
- [ ] Clique toggle
- [ ] Sidebar faz transição suave (não abrupta)
- [ ] Duração ~300ms
- [ ] Rótulos surgem junto (não antes/depois)

### 5.2 Chevron Rotation
- [ ] Ícone toggle rotaciona 180°
- [ ] Sincronizado com expansão (300ms)
- [ ] Suave, não abrupto

### 5.3 Hover States
- [ ] Hover em item nav: cor/fundo muda
- [ ] Transição suave (não abrupta)
- [ ] Cursor muda para pointer

---

## ✅ TESTE 6: Responsividade

### 6.1 Desktop (1920x1080)
- [ ] Sidebar posicionada corretamente
- [ ] Conteúdo não fica sob sidebar
- [ ] Espaço adequado para leitura

### 6.2 Tela Média (1280x720)
- [ ] Sidebar ainda funciona
- [ ] Conteúdo não fica comprimido

### 6.3 Mobile (375x667)
- [ ] Sidebar pode ficar behind ou mudar comportamento (opcional teste)

---

## ✅ TESTE 7: Realtime Sync

### 7.1 Duas Abas (Mesma Sessão)
- [ ] Abra http://localhost:5175 em Aba A
- [ ] Abra http://localhost:5175 em Aba B (mesmo usuário)
- [ ] Em Aba A: Crie uma tarefa
- [ ] Em Aba B: Navegue para o bloco
- [ ] **Tarefa aparece automaticamente** (realtime)

### 7.2 Atualizar Tarefa
- [ ] Em Aba A: Mude status de tarefa para "Em Andamento"
- [ ] Em Aba B: Status muda automaticamente (sem refresh)

---

## 📊 Resultado Final

| Teste | Status | Notas |
|-------|--------|-------|
| Sidebar Dock | ⬜ | Verificar |
| Ícones Lucide | ⬜ | Verificar |
| Checklist | ⬜ | Verificar |
| Cores | ⬜ | Verificar |
| Transições | ⬜ | Verificar |
| Responsividade | ⬜ | Verificar |
| Realtime | ⬜ | Verificar |

---

## 🚀 Próximos Passos Após Teste

Se tudo passar:
- ✅ Sistema pronto para uso
- ✅ Documentar issues encontradas
- ✅ Corrigir bugs críticos
- ✅ Deploy ou testes avançados

Se falhar:
- 🔧 Corrigir issues
- 🧪 Repetir testes
- 📝 Documentar solução

