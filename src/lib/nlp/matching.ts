const NEGATION_PATTERN = /\b(?:no|not|never|without|cannot|can't|cant|doesn't|doesnt|isn't|isnt|hasn't|hasnt|didn't|didnt)\b/i;

export function normalizeForMatch(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u2018\u2019]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function hasPhrase(text: string, phrase: string): boolean {
  const normalizedText = normalizeForMatch(text);
  const normalizedPhrase = normalizeForMatch(phrase);
  if (!normalizedPhrase) return false;

  const pattern = normalizedPhrase
    .split(' ')
    .map(escapeRegExp)
    .join('\\s+');
  return new RegExp(`(?:^|[^a-z0-9])${pattern}(?=$|[^a-z0-9])`, 'i').test(normalizedText);
}

export function hasAnyPhrase(text: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => hasPhrase(text, phrase));
}

export function hasNegation(text: string): boolean {
  return NEGATION_PATTERN.test(normalizeForMatch(text));
}

export function words(text: string): string[] {
  return normalizeForMatch(text).match(/[a-z0-9+#.]+/g) ?? [];
}
