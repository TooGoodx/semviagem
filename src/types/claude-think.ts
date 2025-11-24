/**
 * Types for Claude Think Tool implementation
 * Based on: https://www.anthropic.com/engineering/claude-think-tool
 */

export interface ThinkToolDefinition {
  name: 'think';
  description: string;
  input_schema: {
    type: 'object';
    properties: {
      thought: {
        type: 'string';
        description: string;
      };
    };
    required: ['thought'];
  };
}

export interface ThinkToolInput {
  thought: string;
}

export interface ThinkToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'tool_use' | 'tool_result';
    text?: string;
    id?: string;
    name?: string;
    input?: ThinkToolInput;
    tool_use_id?: string;
    content?: string;
  }>;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  tools?: ThinkToolDefinition[];
  messages: ClaudeMessage[];
  system?: string;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: ThinkToolInput;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens';
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ThinkToolLog {
  timestamp: Date;
  thought: string;
  toolUseId: string;
}
