import { CAREER, PROJECTS, SKILLS } from '../../data/resumeData';
import { buildFactIndex, type FactNode } from './factIndex';
import { hasPhrase, normalizeForMatch } from './matching';
import { synthesizeResponse, type SynthesizedResponse } from './synthesizer';
import { TFIDFIndex } from './tfidf';
import type { ConversationMessage } from './types';

const FOLLOW_UP_PATTERN = /^(?:and\b|also\b|what about\b|how about\b|what\b|why\b|when\b|where\b|which\b|did\b|does\b|was\b|were\b|can\b|could\b)|\b(?:it|there|that company|that project|that role|the same one|those)\b/i;

interface EntityAlias {
  canonical: string;
  aliases: string[];
}

const ENTITY_ALIASES: EntityAlias[] = [
  ...CAREER.map((role) => ({
    canonical: role.company,
    aliases: [role.company, role.company.split(/\s+/)[0]],
  })),
  ...PROJECTS.map((project) => ({
    canonical: project.title,
    aliases: [
      project.title,
      project.slug.replaceAll('-', ' '),
      ...project.slug.split('-').filter((part) => part.length > 3),
    ],
  })),
  ...SKILLS.map((skill) => ({
    canonical: skill.name,
    aliases: [skill.name],
  })),
];

function entityInText(text: string): string | null {
  const sorted = [...ENTITY_ALIASES].sort((a, b) => b.canonical.length - a.canonical.length);
  for (const entity of sorted) {
    if (entity.aliases.some((alias) => hasPhrase(text, alias))) return entity.canonical;
  }
  return null;
}

export class RCNanoEngine {
  private readonly index = new TFIDFIndex();
  private facts: FactNode[] = [];
  private isBuilt = false;
  private readonly cache = new Map<string, SynthesizedResponse>();
  private cacheKeys: string[] = [];

  private build(): void {
    if (this.isBuilt) return;
    this.facts = buildFactIndex();
    this.index.build(this.facts.map((fact) => ({ id: fact.id, text: fact.text })));
    this.isBuilt = true;
  }

  private contextEntity(history: readonly ConversationMessage[]): string | null {
    for (let index = history.length - 1; index >= 0; index -= 1) {
      const message = history[index];
      if (message.role !== 'user') continue;
      const entity = entityInText(message.content);
      if (entity) return entity;
    }
    for (let index = history.length - 1; index >= 0; index -= 1) {
      const entity = entityInText(history[index].content);
      if (entity) return entity;
    }
    return null;
  }

  private contextualize(question: string, history: readonly ConversationMessage[]): string {
    if (entityInText(question) || !FOLLOW_UP_PATTERN.test(normalizeForMatch(question))) return question;
    const entity = this.contextEntity(history);
    return entity ? `${question}\nConversation subject: ${entity}` : question;
  }

  query(question: string, history: readonly ConversationMessage[] = []): SynthesizedResponse {
    this.build();

    const trimmed = question.trim();
    if (!trimmed) {
      return {
        body: 'Ask me about Rishabh\'s experience, projects, skills, education, impact, or availability.',
        isMarkdown: true,
        confidence: 'unknown',
      };
    }

    const contextualQuestion = this.contextualize(trimmed, history);
    const cacheKey = normalizeForMatch(contextualQuestion);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const searchResults = this.index.search(contextualQuestion, 6);
    const matchedFacts = searchResults.flatMap((result) => {
      const fact = this.facts.find((candidate) => candidate.id === result.id);
      return fact ? [{ fact, score: result.score }] : [];
    });
    const response = synthesizeResponse(contextualQuestion, matchedFacts);

    this.cache.set(cacheKey, response);
    this.cacheKeys.push(cacheKey);
    if (this.cacheKeys.length > 20) {
      const oldest = this.cacheKeys.shift();
      if (oldest) this.cache.delete(oldest);
    }
    return response;
  }

  get factCount(): number {
    this.build();
    return this.facts.length;
  }
}

let engineInstance: RCNanoEngine | null = null;

function getEngine(): RCNanoEngine {
  engineInstance ??= new RCNanoEngine();
  return engineInstance;
}

export function queryEngine(question: string, history: readonly ConversationMessage[] = []): SynthesizedResponse {
  return getEngine().query(question, history);
}
