import type { AppState } from '@/types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const MODEL = (import.meta.env.VITE_OPENROUTER_MODEL as string) || 'google/gemini-2.0-flash-001';

// ===== Types =====

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | OpenRouterMultimodalContent[] | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
}

interface OpenRouterMultimodalContent {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}

interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

function extractTextContent(content: string | OpenRouterMultimodalContent[] | null): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join(' ');
}

export interface AIToolAction {
    tool: string;
    args: Record<string, unknown>;
    toolCallId: string;
}

export interface AIChatResult {
    text: string | null;
    toolActions: AIToolAction[];
    requiresFollowUp: boolean;
    _messages: OpenRouterMessage[];
}

// ===== Tools Schema =====

const TOOLS = [
    {
        type: 'function' as const,
        function: {
            name: 'add_transaction',
            description: 'Adiciona uma nova transação financeira (receita ou despesa) no sistema do usuário. Use esta ferramenta quando o usuário pedir para lançar, registrar, adicionar ou anotar um gasto, despesa, receita ou pagamento.',
            parameters: {
                type: 'object',
                properties: {
                    description: {
                        type: 'string',
                        description: 'Descrição curta da transação (ex: "Supermercado Pão de Açúcar", "Aluguel março", "Salário")',
                    },
                    amount: {
                        type: 'number',
                        description: 'Valor da transação em reais (ex: 150.50). Sempre positivo.',
                    },
                    type: {
                        type: 'string',
                        enum: ['income', 'expense'],
                        description: 'Tipo da transação: "expense" para despesas/gastos, "income" para receitas/entradas.',
                    },
                    category_name: {
                        type: 'string',
                        description: 'Nome da categoria para classificar (ex: "Alimentação", "Transporte", "Salário"). Deve corresponder a uma categoria existente no sistema.',
                    },
                    account_name: {
                        type: 'string',
                        description: 'Nome da conta de onde sai ou entra o dinheiro (ex: "Carteira", "Conta Corrente", "Nubank"). Deve corresponder a uma conta existente.',
                    },
                    date: {
                        type: 'string',
                        description: 'Data da transação no formato ISO (YYYY-MM-DD). Use a data atual se o usuário não especificar.',
                    },
                    notes: {
                        type: 'string',
                        description: 'Observações adicionais opcionais.',
                    },
                },
                required: ['description', 'amount', 'type', 'category_name', 'account_name', 'date'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'add_multiple_transactions',
            description: 'Adiciona múltiplas transações de uma vez. Use quando o usuário listar vários gastos ou receitas na mesma mensagem.',
            parameters: {
                type: 'object',
                properties: {
                    transactions: {
                        type: 'array',
                        description: 'Lista de transações para adicionar.',
                        items: {
                            type: 'object',
                            properties: {
                                description: { type: 'string', description: 'Descrição da transação' },
                                amount: { type: 'number', description: 'Valor em reais (sempre positivo)' },
                                type: { type: 'string', enum: ['income', 'expense'], description: 'Tipo: expense ou income' },
                                category_name: { type: 'string', description: 'Nome da categoria' },
                                account_name: { type: 'string', description: 'Nome da conta' },
                                date: { type: 'string', description: 'Data ISO YYYY-MM-DD' },
                                notes: { type: 'string', description: 'Observações opcionais' },
                            },
                            required: ['description', 'amount', 'type', 'category_name', 'account_name', 'date'],
                        },
                    },
                },
                required: ['transactions'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'create_account',
            description: 'Cria uma nova conta bancária ou carteira no sistema.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Nome da conta (ex: "Nubank", "Banco do Brasil", "Dinheiro em Espécie")' },
                    type: {
                        type: 'string',
                        enum: ['bank', 'cash', 'credit', 'investment'],
                        description: 'Tipo da conta: bank (banco), cash (dinheiro), credit (crédito), investment (investimento)'
                    },
                    balance: { type: 'number', description: 'Saldo inicial da conta' },
                    currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], default: 'BRL' },
                    color: { type: 'string', description: 'Cor em HSL ou HEX para a conta (opcional)' },
                },
                required: ['name', 'type', 'balance'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'update_account_balance',
            description: 'Atualiza manualmente o saldo de uma conta existente. Use quando o usuário disser que o saldo atual mudou ou está incorreto.',
            parameters: {
                type: 'object',
                properties: {
                    account_name: { type: 'string', description: 'Nome da conta para atualizar' },
                    new_balance: { type: 'number', description: 'Novo saldo total da conta' },
                },
                required: ['account_name', 'new_balance'],
            },
        },
    },
];

// ===== Core API Call =====

async function callOpenRouter(
    messages: OpenRouterMessage[],
    options?: { tools?: typeof TOOLS }
): Promise<{ message: OpenRouterMessage }> {
    if (!API_KEY || API_KEY === 'your_openrouter_key_here') {
        throw new Error('API_KEY_MISSING');
    }

    const body: Record<string, unknown> = {
        model: MODEL,
        messages,
    };

    if (options?.tools && options.tools.length > 0) {
        body.tools = options.tools;
        body.tool_choice = 'auto';
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Financeiro AI',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenRouter API Error');
    }

    const data = await response.json();
    return { message: data.choices[0].message };
}

// ===== Context Builder =====

function buildFinancialContext(state: AppState): string {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const monthTransactions = state.transactions.filter(
        (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const totalBalance = state.accounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyIncome = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const topExpenses = [...monthTransactions]
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map((t) => {
            const cat = state.categories.find((c) => c.id === t.categoryId);
            return `  - ${t.description} (${cat?.name || 'Sem categoria'}): R$ ${t.amount.toFixed(2)}`;
        });

    const accounts = state.accounts.map(
        (a) => `  - ${a.name} (id: ${a.id}): R$ ${a.balance.toFixed(2)}`
    );

    const categories = state.categories.map(
        (c) => `  - ${c.name} (id: ${c.id}, tipo: ${c.type})`
    );

    const allTransactions = state.transactions
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20)
        .map((t) => {
            const cat = state.categories.find((c) => c.id === t.categoryId);
            const acc = state.accounts.find((a) => a.id === t.accountId);
            return `  - [${t.date.slice(0, 10)}] ${t.type === 'income' ? '➕' : '➖'} ${t.description}: R$ ${t.amount.toFixed(2)} (${cat?.name || '?'}, ${acc?.name || '?'})`;
        });

    return `
=== CONTEXTO FINANCEIRO DO USUÁRIO ===
Data atual: ${now.toISOString().slice(0, 10)} (${now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })})
Saldo total: R$ ${totalBalance.toFixed(2)}

Contas disponíveis:
${accounts.join('\n') || '  (nenhuma conta)'}

Categorias disponíveis:
${categories.join('\n') || '  (nenhuma categoria)'}

Resumo do mês (${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}):
  - Receitas: R$ ${monthlyIncome.toFixed(2)}
  - Despesas: R$ ${monthlyExpenses.toFixed(2)}
  - Balanço: R$ ${(monthlyIncome - monthlyExpenses).toFixed(2)}

Maiores despesas do mês:
${topExpenses.join('\n') || '  (nenhuma)'}

Últimas transações (até 20):
${allTransactions.join('\n') || '  (nenhuma transação)'}

Total de transações: ${state.transactions.length}
======================================
`.trim();
}

// ===== System Instructions =====

const SYSTEM_INSTRUCTION = `Você é o Assistente Financeiro do aplicativo "Financeiro AI".
Sua função é ajudar o usuário a gerenciar suas finanças: lançar transações, analisar gastos, dar dicas de economia e responder perguntas sobre dinheiro.

## Suas Capacidades:
1. **Lançar transações**: Quando o usuário pedir para registrar/lançar/anotar um gasto ou receita, use a ferramenta add_transaction.
2. **Lançar múltiplas transações**: Quando o usuário listar vários gastos/receitas, use add_multiple_transactions.
3. **Analisar imagens**: Você pode receber fotos de recibos, comprovantes, notas fiscais ou faturas. Analise os dados da imagem (valor, descrição, data) e sugira o lançamento da transação.
4. **Gerenciar Contas**: Você pode criar novas contas usando create_account e atualizar o saldo de contas existentes usando update_account_balance.
5. **Analisar finanças**: Use os dados do contexto financeiro para fornecer análises detalhadas.
6. **Classificar e organizar**: Classifique automaticamente as transações nas categorias corretas.

## Regras Importantes:
- Responda SEMPRE em português brasileiro
- Ao receber uma imagem, descreva brevemente o que identificou (ex: "Vi que você gastou R$ 45,90 no Starbucks") e peça confirmação antes de lançar, OU use as ferramentas diretamente se o usuário pedir explicitamente para "lançar esta foto".
- Ao lançar transações, use as categorias e contas que EXISTEM no contexto.
- Ao atualizar o saldo de uma conta, confirme o novo valor para o usuário.
- Se o usuário não especificar a conta em uma transação, use a primeira conta disponível.
- Se o usuário não especificar a data, use a data atual do contexto.
- Use formatação Markdown.
- Seja direto, amigável e profissional.`;

// ===== Exported Service =====

export const aiService = {
    isAvailable(): boolean {
        return !!API_KEY && API_KEY !== 'your_openrouter_key_here';
    },

    async classifyTransaction(
        description: string,
        categories: string[]
    ): Promise<{ categoryName: string; confidence: number } | null> {
        if (!description || description.length < 3) return null;

        try {
            const categoryList = categories.join('\n- ');
            const prompt = `Classifique a seguinte descrição de transação financeira em UMA das categorias abaixo.

Categorias disponíveis:
- ${categoryList}

Descrição: "${description}"

Responda APENAS com o nome exato de uma das categorias listadas. Sem explicações.`;

            const { message } = await callOpenRouter([
                { role: 'system', content: 'Você é um classificador de transações financeiras.' },
                { role: 'user', content: prompt }
            ]);

            const trimmedText = extractTextContent(message.content).trim();

            const matched = categories.find(
                (c) => c.toLowerCase() === trimmedText.toLowerCase()
            );

            if (matched) {
                return { categoryName: matched, confidence: 0.9 };
            }

            const partial = categories.find((c) =>
                trimmedText.toLowerCase().includes(c.toLowerCase())
            );
            if (partial) {
                return { categoryName: partial, confidence: 0.7 };
            }

            return null;
        } catch (error) {
            console.error('AI Classification error:', error);
            return null;
        }
    },

    async chatWithAssistant(
        message: string,
        state: AppState,
        history: OpenRouterMessage[],
        imageBase64?: string
    ): Promise<AIChatResult> {
        try {
            const financialContext = buildFinancialContext(state);

            let userContent: string | OpenRouterMultimodalContent[] = `${financialContext}\n\nMensagem do usuário: ${message}`;

            if (imageBase64) {
                userContent = [
                    { type: 'text', text: userContent as string },
                    {
                        type: 'image_url',
                        image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
                    }
                ];
            }

            const messages: OpenRouterMessage[] = [
                { role: 'system', content: SYSTEM_INSTRUCTION },
                ...history.slice(-10).map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    // If we want to include images in history, we'd need to map ChatMessage.image to multimodal content
                })),
                { role: 'user', content: userContent }
            ];

            const { message: responseMsg } = await callOpenRouter(messages, { tools: TOOLS });

            // Check if the AI wants to call tools
            if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
                const toolActions: AIToolAction[] = responseMsg.tool_calls.map(tc => ({
                    tool: tc.function.name,
                    args: JSON.parse(tc.function.arguments),
                    toolCallId: tc.id,
                }));

                return {
                    text: extractTextContent(responseMsg.content),
                    toolActions,
                    requiresFollowUp: true,
                    _messages: [...messages, responseMsg],
                };
            }

            return {
                text: extractTextContent(responseMsg.content) || 'Desculpe, não consegui gerar uma resposta.',
                toolActions: [],
                requiresFollowUp: false,
                _messages: [],
            };
        } catch (error) {
            console.error('AI Chat error:', error);
            if (error instanceof Error && error.message === 'API_KEY_MISSING') {
                return {
                    text: 'Chave da API do OpenRouter não encontrada. Configure VITE_OPENROUTER_API_KEY no arquivo .env.',
                    toolActions: [],
                    requiresFollowUp: false,
                    _messages: [],
                };
            }
            return {
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                toolActions: [],
                requiresFollowUp: false,
                _messages: [],
            };
        }
    },

    async sendToolResults(
        previousMessages: OpenRouterMessage[],
        toolResults: { toolCallId: string; result: string }[]
    ): Promise<AIChatResult> {
        try {
            const toolResultMessages: OpenRouterMessage[] = toolResults.map(tr => ({
                role: 'tool' as const,
                content: tr.result,
                tool_call_id: tr.toolCallId,
            }));

            const messages = [...previousMessages, ...toolResultMessages];

            const { message: responseMsg } = await callOpenRouter(messages, { tools: TOOLS });

            // Check for more tool calls (chained)
            if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
                const toolActions: AIToolAction[] = responseMsg.tool_calls.map(tc => ({
                    tool: tc.function.name,
                    args: JSON.parse(tc.function.arguments),
                    toolCallId: tc.id,
                }));

                return {
                    text: extractTextContent(responseMsg.content),
                    toolActions,
                    requiresFollowUp: true,
                    _messages: [...messages, responseMsg],
                };
            }

            return {
                text: extractTextContent(responseMsg.content) || 'Transação registrada com sucesso!',
                toolActions: [],
                requiresFollowUp: false,
                _messages: [],
            };
        } catch (error) {
            console.error('AI Tool followup error:', error);
            return {
                text: 'Transações processadas, mas houve um erro ao gerar a resposta final.',
                toolActions: [],
                requiresFollowUp: false,
                _messages: [],
            };
        }
    },
};
