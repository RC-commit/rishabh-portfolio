import { useCallback } from 'react';
import { getGroundedPortfolioResponse } from './portfolioResponder';
import { redactPrivateContactData } from './nlp/privacy';
import { isPortfolioUIAction, type ConversationMessage, type PortfolioUIAction } from './nlp/types';

const CLIENT_TIMEOUT_MS = 22_000;
const MAX_HISTORY_TURNS = 6;
const MAX_USER_CHARS = 1_500;
const MAX_ASSISTANT_CHARS = 3_000;
const MAX_TOTAL_INPUT_CHARS = 10_000;

export type ChatMessage = ConversationMessage;

interface CloudAIResult {
  body: string;
  isMarkdown: true;
  uiAction?: PortfolioUIAction;
  source: 'groq' | 'local';
  groundedFactIds: string[];
}

interface HistoryTurn {
  user: string;
  assistant?: string;
}

interface UseCloudAIReturn {
  isReady: boolean;
  generateResponse: (messages: ChatMessage[]) => Promise<CloudAIResult>;
}

function conversationRequest(messages: readonly ChatMessage[]) {
  const cleaned = messages
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && message.content.trim())
    .map((message) => ({ ...message, content: redactPrivateContactData(message.content.trim()) }));
  let currentIndex = -1;
  for (let index = cleaned.length - 1; index >= 0; index -= 1) {
    if (cleaned[index].role === 'user') {
      currentIndex = index;
      break;
    }
  }
  if (currentIndex < 0) return null;

  const current = cleaned[currentIndex].content.slice(0, 2_000);
  const priorMessages = cleaned.slice(0, currentIndex);
  const turns: HistoryTurn[] = [];
  let pendingTurn: HistoryTurn | null = null;

  for (const message of priorMessages) {
    if (message.role === 'user') {
      if (pendingTurn) turns.push(pendingTurn);
      pendingTurn = { user: message.content.slice(0, MAX_USER_CHARS) };
    } else if (pendingTurn && !pendingTurn.assistant) {
      pendingTurn.assistant = message.content.slice(0, MAX_ASSISTANT_CHARS);
      turns.push(pendingTurn);
      pendingTurn = null;
    }
  }
  if (pendingTurn) turns.push(pendingTurn);

  const history: HistoryTurn[] = [];
  let remainingChars = Math.max(0, MAX_TOTAL_INPUT_CHARS - current.length);
  for (let index = turns.length - 1; index >= 0 && history.length < MAX_HISTORY_TURNS; index -= 1) {
    const turn = turns[index];
    const turnChars = turn.user.length + (turn.assistant?.length ?? 0);
    if (turnChars > remainingChars) break;
    history.unshift(turn);
    remainingChars -= turnChars;
  }

  return {
    message: current,
    history,
    localHistory: priorMessages.slice(-MAX_HISTORY_TURNS * 2),
  };
}

function localFallback(message: string, history: readonly ConversationMessage[]): CloudAIResult {
  const response = getGroundedPortfolioResponse(message, history);
  return {
    body: response.body,
    isMarkdown: true,
    uiAction: response.uiAction,
    source: 'local',
    groundedFactIds: response.groundedFactIds ?? [],
  };
}

function parseCloudResult(value: unknown): CloudAIResult | null {
  if (!value || typeof value !== 'object') return null;
  const result = value as {
    answer?: unknown;
    source?: unknown;
    uiAction?: unknown;
    groundedFactIds?: unknown;
  };
  if (typeof result.answer !== 'string' || !result.answer.trim() || result.source !== 'groq') return null;

  const uiAction = isPortfolioUIAction(result.uiAction) ? result.uiAction : undefined;
  const groundedFactIds = Array.isArray(result.groundedFactIds)
    ? result.groundedFactIds.filter((id): id is string => typeof id === 'string').slice(0, 12)
    : [];
  if (groundedFactIds.length === 0) return null;
  return {
    body: redactPrivateContactData(result.answer),
    isMarkdown: true,
    uiAction,
    source: 'groq',
    groundedFactIds,
  };
}

export function useCloudAI(): UseCloudAIReturn {
  const generateResponse = useCallback(async (messages: ChatMessage[]): Promise<CloudAIResult> => {
    const request = conversationRequest(messages);
    if (!request) {
      return localFallback('', []);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: request.message, history: request.history }),
        signal: controller.signal,
      });
      if (!response.ok) return localFallback(request.message, request.localHistory);

      const parsed: unknown = await response.json();
      return parseCloudResult(parsed) ?? localFallback(request.message, request.localHistory);
    } catch {
      return localFallback(request.message, request.localHistory);
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  return { isReady: true, generateResponse };
}
