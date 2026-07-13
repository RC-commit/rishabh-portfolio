// ============================================================
// RC-Nano-NLP: Tokenizer — Text preprocessing for search
// Ultra-lightweight, zero-dependency text processing
// ============================================================

// Common English stop words to filter out during search
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
  'this', 'that', 'these', 'those', 'am', 'it', 'its', 'he', 'she',
  'they', 'them', 'his', 'her', 'my', 'your', 'our', 'their', 'what',
  'which', 'who', 'whom', 'me', 'him', 'us', 'i', 'you', 'we',
  'tell', 'know', 'get', 'got', 'also', 'like', 'much', 'many',
  'any', 'please', 'really', 'well', 'want', 'make', 'made',
]);

// Lightweight suffix stemmer (Porter-like, simplified)
// Reduces words to approximate root forms for better matching
const SUFFIX_RULES: [RegExp, string][] = [
  [/ational$/, 'ate'],
  [/tional$/, 'tion'],
  [/encies$/, 'ence'],
  [/ances$/, 'ance'],
  [/izers?$/, 'ize'],
  [/ingly$/, 'ing'],
  [/ously$/, 'ous'],
  [/ively$/, 'ive'],
  [/ments?$/, 'ment'],
  [/nesses$/, 'ness'],
  [/ities$/, 'ity'],
  [/ings$/, 'ing'],
  [/tion$/, 'te'],
  [/sion$/, 'se'],
  [/ness$/, ''],
  [/ment$/, ''],
  [/able$/, ''],
  [/ible$/, ''],
  [/ally$/, 'al'],
  [/ful$/, ''],
  [/ous$/, ''],
  [/ive$/, ''],
  [/ize$/, ''],
  [/ise$/, ''],
  [/ing$/, ''],
  [/ies$/, 'y'],
  [/ied$/, 'y'],
  [/ers?$/, ''],
  [/ed$/, ''],
  [/ly$/, ''],
  [/es$/, ''],
  [/s$/, ''],
];

// Synonym thesaurus to expand terms semantically during indexing & search
const SYNONYM_MAP: Record<string, string[]> = {
  'work': ['career', 'experience', 'job', 'position', 'role', 'employment', 'company'],
  'job': ['career', 'experience', 'work', 'position', 'role', 'employment', 'company'],
  'career': ['work', 'experience', 'job', 'position', 'role', 'employment', 'company'],
  'experience': ['work', 'career', 'job', 'position', 'role', 'employment', 'company'],
  'role': ['work', 'career', 'job', 'position', 'experience', 'employment', 'company'],
  'database': ['postgresql', 'postgres', 'redis', 'sql', 'nosql', 'db'],
  'postgres': ['postgresql', 'database', 'sql', 'db'],
  'postgresql': ['postgres', 'database', 'sql', 'db'],
  'redis': ['database', 'cache', 'nosql', 'db'],
  'cloud': ['azure', 'heroku', 'aws', 'gcp', 'infrastructure', 'devops'],
  'infra': ['azure', 'heroku', 'aws', 'gcp', 'infrastructure', 'devops'],
  'infrastructure': ['azure', 'heroku', 'aws', 'gcp', 'infra', 'devops'],
  'search': ['elasticsearch', 'query', 'indexing', 'bm25'],
  'elasticsearch': ['search', 'query', 'indexing'],
  'event': ['kafka', 'rabbitmq', 'queue', 'message', 'broker'],
  'message': ['kafka', 'rabbitmq', 'queue', 'event', 'broker'],
  'broker': ['kafka', 'rabbitmq', 'queue', 'event', 'message'],
  'queue': ['kafka', 'rabbitmq', 'event', 'message', 'broker'],
  'realtime': ['websockets', 'kafka', 'rabbitmq', 'socket'],
  'websockets': ['realtime', 'socket'],
  'language': ['ruby', 'python', 'javascript', 'typescript', 'golang', 'c'],
  'framework': ['rails', 'django', 'react', 'next.js', 'fastapi'],
  'rails': ['ruby', 'framework'],
  'django': ['python', 'framework'],
  'react': ['javascript', 'typescript', 'framework', 'frontend'],
};

/**
 * Simple suffix-stripping stemmer.
 * Applies the first matching rule to reduce a word to its approximate root.
 */
function stem(word: string): string {
  if (word.length <= 3) return word;

  for (const [pattern, replacement] of SUFFIX_RULES) {
    if (pattern.test(word)) {
      const result = word.replace(pattern, replacement);
      // Only accept if the result is at least 2 characters
      if (result.length >= 2) return result;
    }
  }

  return word;
}

/**
 * Expand a list of tokens with their semantic synonyms.
 */
function expandTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      synonyms.forEach(s => expanded.add(s));
    }
  }
  return Array.from(expanded);
}

/**
 * Tokenize text into cleaned, stemmed, and expanded tokens suitable for TF-IDF.
 *
 * Pipeline:
 *   1. Lowercase
 *   2. Replace non-alphanumeric chars with spaces
 *   3. Split on whitespace
 *   4. Remove stop words
 *   5. Remove very short tokens (< 2 chars)
 *   6. Stem each token
 *   7. Expand with synonyms
 */
export function tokenize(text: string): string[] {
  const baseTokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
    .map(stem);
  return expandTokens(baseTokens);
}

/**
 * Extract unique bigrams from tokens for improved phrase matching.
 * e.g. ["elastic", "search"] → ["elastic_search"]
 */
export function bigrams(tokens: string[]): string[] {
  const results: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    results.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return results;
}
