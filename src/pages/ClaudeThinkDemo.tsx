/**
 * Claude Think Tool Demo Page
 * Demonstrates the use of Claude's think tool for mid-response reasoning
 */

import { useState } from 'react';
import { useClaudeThink } from '../hooks/useClaudeThink';
import type { ThinkToolLog } from '../types/claude-think';

export default function ClaudeThinkDemo() {
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const {
    sendMessage,
    response,
    thinkLogs,
    conversationHistory,
    isLoading,
    error,
    clearConversation,
  } = useClaudeThink({
    apiKey,
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    systemPrompt: `You are a helpful AI assistant with access to a "think" tool.
Use the think tool to pause and reason carefully when:
- Analyzing complex information from multiple sources
- Making decisions that require policy compliance
- Processing sequential tasks where errors are costly
- Evaluating trade-offs between different options

When you use the think tool, explain your reasoning process thoroughly.`,
    maxRounds: 10,
  });

  const handleConfigure = () => {
    if (apiKey.trim()) {
      setIsConfigured(true);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatThinkLog = (log: ThinkToolLog, index: number) => {
    return (
      <div key={log.toolUseId} className="border border-blue-300 bg-blue-50 p-4 rounded-lg mb-3">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="font-semibold text-blue-900">Pensamento {index + 1}</span>
          <span className="text-xs text-blue-600 ml-auto">
            {log.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-blue-800 whitespace-pre-wrap">{log.thought}</p>
      </div>
    );
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Claude Think Tool Demo
            </h1>
            <p className="text-gray-600 mb-6">
              Esta demonstração implementa o "Think Tool" do Claude, que permite ao modelo
              pausar durante a geração de resposta para raciocinar sobre informações complexas.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">O que é o Think Tool?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Permite raciocínio estruturado durante a resposta</li>
                <li>• Ideal para análise de políticas complexas</li>
                <li>• Útil para decisões sequenciais onde erros são custosos</li>
                <li>• Melhora performance em tarefas com múltiplas ferramentas</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave da API do Anthropic
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sua chave API não será armazenada e é usada apenas nesta sessão
                </p>
              </div>

              <button
                onClick={handleConfigure}
                disabled={!apiKey.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Começar Demo
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p className="mb-2">Baseado em:</p>
              <a
                href="https://www.anthropic.com/engineering/claude-think-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://www.anthropic.com/engineering/claude-think-tool
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Claude Think Tool Demo
                </h1>
                <p className="text-purple-100 text-sm">
                  Observe o raciocínio do Claude em tempo real
                </p>
              </div>
              <button
                onClick={() => {
                  clearConversation();
                  setIsConfigured(false);
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-6">
            {/* Left Panel - Chat Interface */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                {conversationHistory.length === 0 && (
                  <div className="text-center text-gray-500 mt-20">
                    <p className="text-lg mb-2">Pronto para começar!</p>
                    <p className="text-sm">Faça uma pergunta complexa para ver o Claude pensar</p>
                  </div>
                )}

                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {typeof msg.content === 'string' ? (
                      <div
                        className={`inline-block max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    ) : null}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Claude está pensando...</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                  Erro: {error.message}
                </div>
              )}

              {response && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Resposta Final:</h3>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{response}</p>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem... (Enter para enviar)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  className="bg-blue-600 text-white px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar
                </button>
              </div>

              <button
                onClick={clearConversation}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                Limpar Conversa
              </button>
            </div>

            {/* Right Panel - Think Logs */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Processo de Pensamento
                </h2>
                <p className="text-sm text-gray-700">
                  Aqui você verá os pensamentos internos do Claude enquanto ele raciocina
                  sobre sua pergunta.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
                {thinkLogs.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p>Nenhum pensamento registrado ainda</p>
                    <p className="text-xs mt-1">
                      Os pensamentos aparecerão aqui quando o Claude usar o think tool
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {thinkLogs.map((log, idx) => formatThinkLog(log, idx))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Sugestões de Perguntas:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() =>
                setMessage(
                  'Analise os prós e contras de implementar microserviços vs arquitetura monolítica para uma startup de e-commerce.'
                )
              }
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              Arquitetura de software complexa
            </button>
            <button
              onClick={() =>
                setMessage(
                  'Preciso decidir entre usar React, Vue ou Angular para um novo projeto. Considere: equipe de 5 devs, app B2B complexo, prazo de 6 meses.'
                )
              }
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              Decisão técnica com múltiplas variáveis
            </button>
            <button
              onClick={() =>
                setMessage(
                  'Como implementar autenticação segura com JWT, considerando refresh tokens, CSRF protection e XSS prevention?'
                )
              }
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              Análise de segurança
            </button>
            <button
              onClick={() =>
                setMessage(
                  'Explique passo a passo como otimizar o desempenho de um banco de dados PostgreSQL com milhões de registros.'
                )
              }
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              Otimização de performance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
