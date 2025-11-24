/**
 * Claude Think Tool Service
 * Implements the think tool for Claude to perform mid-response reasoning
 * Based on: https://www.anthropic.com/engineering/claude-think-tool
 */

import axios, { AxiosInstance } from 'axios';
import type {
  ThinkToolDefinition,
  ClaudeRequest,
  ClaudeResponse,
  ClaudeMessage,
  ThinkToolLog,
} from '../types/claude-think';

export class ClaudeThinkService {
  private apiKey: string;
  private client: AxiosInstance;
  private thinkLogs: ThinkToolLog[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
  }

  /**
   * Returns the think tool definition
   */
  getThinkToolDefinition(): ThinkToolDefinition {
    return {
      name: 'think',
      description:
        'Use this tool to pause and think carefully about the information you have received from tool outputs. ' +
        'This allows you to reason about complex scenarios, analyze policy requirements, or make sequential decisions. ' +
        'The thought will be logged but will not obtain new information or change any database.',
      input_schema: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Your reasoning process, analysis, or deliberation about the current situation.',
          },
        },
        required: ['thought'],
      },
    };
  }

  /**
   * Sends a message to Claude with the think tool enabled
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      systemPrompt?: string;
      enableThinkTool?: boolean;
    }
  ): Promise<ClaudeResponse> {
    const request: ClaudeRequest = {
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      messages,
    };

    if (options?.systemPrompt) {
      request.system = options.systemPrompt;
    }

    if (options?.enableThinkTool !== false) {
      request.tools = [this.getThinkToolDefinition()];
    }

    const response = await this.client.post<ClaudeResponse>('/messages', request);
    return response.data;
  }

  /**
   * Handles a complete conversation with automatic think tool handling
   */
  async chat(
    userMessage: string,
    options?: {
      conversationHistory?: ClaudeMessage[];
      model?: string;
      maxTokens?: number;
      systemPrompt?: string;
      maxRounds?: number;
    }
  ): Promise<{
    response: string;
    thinkLogs: ThinkToolLog[];
    fullConversation: ClaudeMessage[];
  }> {
    const messages: ClaudeMessage[] = options?.conversationHistory || [];
    messages.push({
      role: 'user',
      content: userMessage,
    });

    this.thinkLogs = [];
    let rounds = 0;
    const maxRounds = options?.maxRounds || 10;

    while (rounds < maxRounds) {
      const response = await this.sendMessage(messages, options);

      // Check if Claude used the think tool
      const hasToolUse = response.content.some((block) => block.type === 'tool_use');

      if (hasToolUse) {
        // Add assistant's response to conversation
        messages.push({
          role: 'assistant',
          content: response.content,
        });

        // Process all tool uses
        const toolResults = response.content
          .filter((block) => block.type === 'tool_use')
          .map((block) => {
            if (block.name === 'think' && block.input && block.id) {
              // Log the thought
              this.thinkLogs.push({
                timestamp: new Date(),
                thought: block.input.thought,
                toolUseId: block.id,
              });

              // Return tool result
              return {
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: 'Thought logged successfully. Continue with your response.',
              };
            }
            return null;
          })
          .filter((result) => result !== null);

        // Add tool results to conversation
        messages.push({
          role: 'user',
          content: toolResults,
        });

        rounds++;
      } else {
        // No tool use, extract final text response
        const textBlocks = response.content.filter((block) => block.type === 'text');
        const finalResponse = textBlocks.map((block) => block.text || '').join('\n');

        return {
          response: finalResponse,
          thinkLogs: this.thinkLogs,
          fullConversation: messages,
        };
      }
    }

    throw new Error(`Maximum rounds (${maxRounds}) exceeded. Claude may be stuck in a thinking loop.`);
  }

  /**
   * Gets the current think logs
   */
  getThinkLogs(): ThinkToolLog[] {
    return [...this.thinkLogs];
  }

  /**
   * Clears the think logs
   */
  clearThinkLogs(): void {
    this.thinkLogs = [];
  }
}

// Singleton instance (optional)
let claudeThinkServiceInstance: ClaudeThinkService | null = null;

export function initClaudeThinkService(apiKey: string): ClaudeThinkService {
  claudeThinkServiceInstance = new ClaudeThinkService(apiKey);
  return claudeThinkServiceInstance;
}

export function getClaudeThinkService(): ClaudeThinkService {
  if (!claudeThinkServiceInstance) {
    throw new Error('ClaudeThinkService not initialized. Call initClaudeThinkService first.');
  }
  return claudeThinkServiceInstance;
}
