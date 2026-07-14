import { queryEngine } from './nlp/engine';
import { redactPrivateContactData } from './nlp/privacy';
import type { ConversationMessage, PortfolioAnswer } from './nlp/types';

export function getGroundedPortfolioResponse(
  question: string,
  history: readonly ConversationMessage[] = [],
): PortfolioAnswer {
  const response = queryEngine(question, history);
  return {
    ...response,
    body: redactPrivateContactData(response.body),
  };
}
