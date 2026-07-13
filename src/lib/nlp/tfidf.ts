// ============================================================
// RC-Nano-NLP: TF-IDF Engine — Vector space model for search
// Implements Term Frequency–Inverse Document Frequency with
// cosine similarity for fast, accurate fact retrieval.
// ============================================================

import { tokenize, bigrams } from './tokenizer';

/**
 * Represents a single searchable fact with its pre-computed token data.
 */
interface IndexedDocument {
  id: string;
  tokens: string[];
  termFreqs: Map<string, number>;
  magnitude: number; // Pre-computed vector magnitude for cosine sim
}

/**
 * TF-IDF search index.
 * Builds an inverted index over a corpus of documents and supports
 * fast cosine-similarity-based retrieval.
 */
export class TFIDFIndex {
  private documents: IndexedDocument[] = [];
  private idf: Map<string, number> = new Map();
  private vocabulary: Set<string> = new Set();

  /**
   * Build the index from a list of text documents.
   * Each document is identified by its id.
   */
  build(docs: Array<{ id: string; text: string }>) {
    this.documents = [];
    this.idf.clear();
    this.vocabulary.clear();

    // Step 1: Tokenize all documents and compute term frequencies
    this.documents = docs.map(({ id, text }) => {
      const rawTokens = tokenize(text);
      const bigramTokens = bigrams(rawTokens);
      const allTokens = [...rawTokens, ...bigramTokens];

      const termFreqs = new Map<string, number>();
      for (const token of allTokens) {
        termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
        this.vocabulary.add(token);
      }

      return { id, tokens: allTokens, termFreqs, magnitude: 0 };
    });

    // Step 2: Compute IDF for every term in the vocabulary
    const N = this.documents.length;
    for (const term of this.vocabulary) {
      const docFreq = this.documents.filter(d => d.termFreqs.has(term)).length;
      // Smoothed IDF: log(N / (1 + df)) to avoid division by zero
      this.idf.set(term, Math.log(N / (1 + docFreq)) + 1);
    }

    // Step 3: Pre-compute document magnitudes for cosine similarity
    for (const doc of this.documents) {
      let sumSq = 0;
      for (const [term, tf] of doc.termFreqs) {
        const idfVal = this.idf.get(term) || 0;
        const tfidf = tf * idfVal;
        sumSq += tfidf * tfidf;
      }
      doc.magnitude = Math.sqrt(sumSq);
    }
  }

  /**
   * Search the index with a query string.
   * Returns the top-K document IDs sorted by cosine similarity.
   */
  search(query: string, topK = 5): Array<{ id: string; score: number }> {
    const queryTokens = tokenize(query);
    const queryBigrams = bigrams(queryTokens);
    const allQueryTokens = [...queryTokens, ...queryBigrams];

    // Build query term frequency map
    const queryTF = new Map<string, number>();
    for (const token of allQueryTokens) {
      queryTF.set(token, (queryTF.get(token) || 0) + 1);
    }

    // Compute query magnitude
    let queryMagSq = 0;
    for (const [term, tf] of queryTF) {
      const idfVal = this.idf.get(term) || 0;
      const tfidf = tf * idfVal;
      queryMagSq += tfidf * tfidf;
    }
    const queryMag = Math.sqrt(queryMagSq);

    if (queryMag === 0) return [];

    // Compute cosine similarity against each document
    const results: Array<{ id: string; score: number }> = [];

    for (const doc of this.documents) {
      if (doc.magnitude === 0) continue;

      let dotProduct = 0;
      for (const [term, queryTf] of queryTF) {
        const docTf = doc.termFreqs.get(term);
        if (docTf === undefined) continue;
        const idfVal = this.idf.get(term) || 0;
        dotProduct += (queryTf * idfVal) * (docTf * idfVal);
      }

      if (dotProduct === 0) continue;

      const score = dotProduct / (queryMag * doc.magnitude);
      results.push({ id: doc.id, score });
    }

    // Sort by score descending and return top-K
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Get the number of indexed documents.
   */
  get size(): number {
    return this.documents.length;
  }
}
