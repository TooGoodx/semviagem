/**
 * React Hook for using Claude Think Tool
 */

import { useState, useCallback, useRef } from 'react';
import { ClaudeThinkService } from '../services/claudeThinkService';
import type { ClaudeMessage, ThinkToolLog } from '../types/claude-think';

interface UseClaudeThinkOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
  maxRounds?: number;
}

interface UseClaudeThinkReturn {
  sendMessage: (message: string) => Promise<void>;
  response: string | null;
  thinkLogs: ThinkToolLog[];
  conversationHistory: ClaudeMessage[];
  isLoading: boolean;
  error: Error | null;
  clearConversation: () => void;
}

export function useClaudeThink(options: UseClaudeThinkOptions): UseClaudeThinkReturn {
  const [response, setResponse] = useState<string | null>(null);
  const [thinkLogs, setThinkLogs] = useState<ThinkToolLog[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ClaudeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const serviceRef = useRef<ClaudeThinkService | null>(null);

  // Initialize service
  if (!serviceRef.current) {
    serviceRef.current = new ClaudeThinkService(options.apiKey);
  }

  const sendMessage = useCallback(
    async (message: string) => {
      if (!serviceRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await serviceRef.current.chat(message, {
          conversationHistory,
          model: options.model,
          maxTokens: options.maxTokens,
          systemPrompt: options.systemPrompt,
          maxRounds: options.maxRounds,
        });

        setResponse(result.response);
        setThinkLogs(result.thinkLogs);
        setConversationHistory(result.fullConversation);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        console.error('Error sending message to Claude:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationHistory, options.model, options.maxTokens, options.systemPrompt, options.maxRounds]
  );

  const clearConversation = useCallback(() => {
    setResponse(null);
    setThinkLogs([]);
    setConversationHistory([]);
    setError(null);
    serviceRef.current?.clearThinkLogs();
  }, []);

  return {
    sendMessage,
    response,
    thinkLogs,
    conversationHistory,
    isLoading,
    error,
    clearConversation,
  };
}
