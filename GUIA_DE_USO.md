# 📱 Financeiro AI — Guia de Uso Completo

Bem-vindo ao **Financeiro AI**, seu assistente pessoal de finanças com inteligência artificial integrada. Este guia explica todas as funcionalidades do sistema.

---

## 🚀 Como Iniciar

```bash
# Clone o repositório e instale as dependências
npm install

# Configure a chave de API do Gemini no arquivo .env
echo "VITE_GEMINI_API_KEY=sua_chave_aqui" > .env

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

---

---

## 📊 Dashboard

O painel principal exibe uma visão geral das suas finanças.

### Cards de Resumo (4 cartões)
| Card | O que mostra |
|------|-------------|
| **Saldo Total** | Soma de todas as contas cadastradas |
| **Receitas** | Total de entradas no mês atual |
| **Despesas** | Total de saídas no mês atual |
| **Balanço do Mês** | Receitas − Despesas + % economizado |

- Cada card mostra a variação percentual em relação ao mês anterior (↑ ↓)

### Gráficos
- **Receitas vs Despesas (6 meses)** — gráfico de área mostrando tendências
- **Por Categoria** — gráfico de pizza com os maiores gastos do mês

### Transações Recentes
- Lista as 5 transações mais recentes
- Clique em **"Ver todas"** para ir à página de transações

---

## 💸 Transações

### Como Adicionar uma Transação
1. Clique no botão **"+"** (canto superior direito ou menu)
2. Selecione o tipo: **Receita**, **Despesa** ou **Transferência**
3. Preencha o valor e a moeda
4. Digite a **descrição** — ao sair do campo, a IA sugerirá uma categoria automaticamente ✨
5. Selecione a categoria e a conta
6. Informe a data
7. Opcionalmente, marque **"Transação recorrente"** e escolha a frequência
8. Clique em **"Adicionar"**

### Filtros e Busca
- **Busca por texto**: filtra por descrição da transação
- **Filtro por tipo**: Receita, Despesa, Transferência
- **Filtro por categoria**: selecione qualquer categoria cadastrada
- **Filtro por conta**: filtre por conta bancária específica
- **Período**: selecione mês/ano para visualizar

### Editar e Excluir
- Clique no ícone de **lápis** para editar uma transação
- Clique no ícone de **lixeira** para excluir (com confirmação)

---

## 🏦 Contas

Gerencie suas contas bancárias, carteiras e investimentos.

### Tipos de Conta
- 🏦 **Banco** — conta corrente ou poupança
- 💵 **Dinheiro** — carteira física
- 💳 **Crédito** — cartão de crédito
- 📈 **Investimento** — CDB, ações, fundos

### Como Adicionar uma Conta
1. Acesse **Contas** no menu
2. Clique em **"Nova Conta"**
3. Informe nome, tipo, saldo inicial e moeda
4. O saldo é atualizado automaticamente a cada transação

---

## 🏷️ Categorias

Organize suas transações por categoria (Alimentação, Transporte, etc.).

### Categorias Padrão
O sistema já vem com categorias pré-definidas para **receitas** e **despesas**. Você pode personalizá-las ou criar novas.

### Como Criar uma Categoria
1. Acesse **Categorias** no menu
2. Clique em **"Nova Categoria"**
3. Informe nome, tipo (receita/despesa), ícone (emoji) e cor
4. Clique em **"Salvar"**

> ⚠️ Categorias padrão não podem ser excluídas.

---

## 🔁 Recorrências

Configure cobranças e receitas que se repetem automaticamente.

### Frequências disponíveis
- Diária, Semanal, Mensal, Anual

### Como Configurar
1. Ao criar uma transação, marque **"Transação recorrente"**
2. Selecione a frequência
3. Ou acesse **Recorrência** no menu para gerenciar regras existentes

> 📅 O sistema verifica automaticamente as regras ao abrir o app e gera as transações pendentes.

---

## 🤖 Assistente de IA (Gemini)

O assistente financeiro com IA é a peça central do Financeiro AI.

### Como Abrir
Clique no botão **✨ (Sparkles)** flutuante no canto inferior direito da tela.

### O que você pode perguntar
- *"Qual é meu saldo total?"*
- *"Onde mais gastei este mês?"*
- *"Quanto economizei em relação ao mês passado?"*
- *"Me dê dicas para economizar mais"*
- *"Analise meus gastos este mês"*
- *"Quanto gastei com alimentação?"*

### Sugestões Rápidas
Ao abrir o assistente, clique em um dos chips de sugestão para começar rapidamente.

### Limpar Conversa
Clique no ícone de **lixeira** no cabeçalho do chat para apagar o histórico.

### Contexto Financeiro Automático
O assistente tem acesso aos seus dados financeiros em tempo real:
- Saldo de todas as contas
- Receitas e despesas do mês
- Maiores despesas por categoria

---

## ⚙️ Configurações

### Aparência
Escolha entre os temas: **Claro**, **Escuro** ou **Automático** (segue o sistema operacional).

### Regional
- **Moeda padrão**: define a moeda usada nas transações e exibição
- **Idioma**: Português (BR) ou English (US)

### API Key do Gemini
Verifique o status da sua chave de IA e siga o guia de configuração.

### Limpar Dados
Reseta **todos** os dados do aplicativo (ação irreversível).

---

## 🔒 Privacidade e Dados

- **Todos os dados ficam no seu navegador** (localStorage) — nenhum servidor externo é necessário
- Os dados **não são enviados para nenhum servidor**, exceto as perguntas feitas ao Assistente de IA (que são enviadas à API do Google Gemini)
- Para exportar seus dados, use as ferramentas do navegador (DevTools → Application → localStorage)

---

## ❓ Perguntas Frequentes

**O app funciona offline?**
Sim! Todas as funções exceto o Assistente de IA funcionam sem internet.

**Meus dados são salvos automaticamente?**
Sim, a cada ação os dados são salvos no localStorage do navegador.

**Posso usar em dispositivos móveis?**
Sim! O layout é responsivo e funciona bem em smartphones.

**Como exportar meus dados?**
Atualmente não há exportação integrada. Acesse DevTools → Application → localStorage para backup manual.

**O assistente de IA precisa de dados para funcionar?**
Não, mas quanto mais transações você registrar, mais contexto o assistente terá para responder.

---

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|------------|-----|
| React 19 | Interface do usuário |
| TypeScript | Tipagem estática |
| Vite 7 | Build e dev server |
| Tailwind CSS 4 | Estilos |
| Recharts | Gráficos |
| Framer Motion | Animações |
| Google Gemini AI | Assistente de IA |
| Lucide Icons | Ícones |

---

*Financeiro AI — Versão 0.0.0*
