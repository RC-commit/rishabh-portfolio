export type PortfolioUIAction =
  | { action: 'focus_section'; value: 'intro' | 'experience' | 'education' | 'projects' | 'stack' | 'testimonials' | 'contact' }
  | { action: 'highlight_project'; value: string }
  | { action: 'toggle_experience'; value: string };

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PortfolioAnswer {
  body: string;
  isMarkdown: true;
  uiAction?: PortfolioUIAction;
  groundedFactIds?: string[];
  confidence: 'high' | 'medium' | 'unknown';
}

const SECTION_VALUES = new Set([
  'intro',
  'experience',
  'education',
  'projects',
  'stack',
  'testimonials',
  'contact',
]);

export function isPortfolioUIAction(value: unknown): value is PortfolioUIAction {
  if (!value || typeof value !== 'object') return false;

  const action = (value as { action?: unknown }).action;
  const actionValue = (value as { value?: unknown }).value;
  if (typeof actionValue !== 'string' || actionValue.length === 0 || actionValue.length > 120) {
    return false;
  }

  if (action === 'focus_section') return SECTION_VALUES.has(actionValue);
  if (action === 'highlight_project') return true;
  return action === 'toggle_experience' && /^\d{1,2}$/.test(actionValue);
}
