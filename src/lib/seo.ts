interface MetadataOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  structuredData?: StructuredData | StructuredData[];
}

interface ArticleStructuredDataOptions {
  headline: string;
  description: string;
  canonicalPath: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
  image?: string;
}

type StructuredData = Record<string, unknown>;

const SITE_ORIGIN = 'https://rishabhchaturvedi.dev';

const SITE_NAME = 'Rishabh Chaturvedi Portfolio';
const DEFAULT_IMAGE_PATH = '/og-card.png';
const DEFAULT_IMAGE_ALT = 'Rishabh Chaturvedi portfolio preview showing engineering impact metrics';
const PERSON_ID = `${SITE_ORIGIN}/#person`;
const JSON_LD_ID = 'seo-structured-data';

const PERSON_STRUCTURED_DATA: StructuredData = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Rishabh Chaturvedi',
  url: `${SITE_ORIGIN}/`,
  image: `${SITE_ORIGIN}${DEFAULT_IMAGE_PATH}`,
  jobTitle: 'Senior Software Engineer',
  description: 'Senior Software Engineer operating at lead scope across scalable backend systems, cloud platforms, search performance, and tool-grounded applied AI systems.',
  knowsAbout: ['Ruby on Rails', 'Django', 'React', 'Azure', 'ElasticSearch', 'PostgreSQL', 'Kafka', 'Cloud Migration'],
  sameAs: [
    'https://linkedin.com/in/rishabhjchaturvedi',
    'https://github.com/RC-commit',
  ],
};

function pathFromPathOrUrl(pathOrUrl: string) {
  try {
    const parsed = new URL(pathOrUrl, `${SITE_ORIGIN}/`);
    return parsed.pathname;
  } catch {
    return '/';
  }
}

export function getCanonicalUrl(pathOrUrl = '/') {
  const url = new URL(pathFromPathOrUrl(pathOrUrl), `${SITE_ORIGIN}/`);
  url.hash = '';
  return url.toString();
}

function absoluteAssetUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, `${SITE_ORIGIN}/`).toString();
  } catch {
    return `${SITE_ORIGIN}${DEFAULT_IMAGE_PATH}`;
  }
}

function imageMimeType(pathOrUrl: string) {
  const path = pathFromPathOrUrl(pathOrUrl).toLowerCase();
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
}

function removeMeta(selector: string) {
  document.head.querySelectorAll(selector).forEach((node) => node.remove());
}

function upsertCanonical(url: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement('link');
    node.rel = 'canonical';
    document.head.appendChild(node);
  }
  node.href = url;
}

function setArticleMeta(property: string, content?: string) {
  const selector = `meta[property="${property}"]`;
  if (!content) {
    removeMeta(selector);
    return;
  }
  upsertMeta(selector, { property, content });
}

function setStructuredData(nodes: StructuredData | StructuredData[] = []) {
  const additionalNodes = Array.isArray(nodes) ? nodes : [nodes];
  let script = document.head.querySelector<HTMLScriptElement>(`#${JSON_LD_ID}`);

  if (!script) {
    script = document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [PERSON_STRUCTURED_DATA, ...additionalNodes],
  });
}

export function createArticleStructuredData({
  headline,
  description,
  canonicalPath,
  datePublished,
  dateModified,
  keywords = [],
  image = DEFAULT_IMAGE_PATH,
}: ArticleStructuredDataOptions): StructuredData {
  const article: StructuredData = {
    '@type': 'Article',
    headline,
    description,
    mainEntityOfPage: getCanonicalUrl(canonicalPath),
    image: absoluteAssetUrl(image),
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };

  if (datePublished) article.datePublished = datePublished;
  if (dateModified) article.dateModified = dateModified;
  if (keywords.length > 0) article.keywords = keywords.join(', ');

  return article;
}

export function setPageMetadata({
  title,
  description,
  canonicalPath = '/',
  image = DEFAULT_IMAGE_PATH,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
  tags = [],
  structuredData = [],
}: MetadataOptions) {
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const imageUrl = absoluteAssetUrl(image);
  const robots = noIndex ? 'noindex, nofollow, noarchive' : 'index, follow';

  document.title = title;
  upsertCanonical(canonicalUrl);
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_US' });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
  upsertMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: imageUrl });
  upsertMeta('meta[property="og:image:type"]', { property: 'og:image:type', content: imageMimeType(image) });
  upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
  upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
  upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
  upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });

  setArticleMeta('article:published_time', type === 'article' ? publishedTime : undefined);
  setArticleMeta('article:modified_time', type === 'article' ? modifiedTime : undefined);
  setArticleMeta('article:author', type === 'article' ? 'https://linkedin.com/in/rishabhjchaturvedi' : undefined);
  removeMeta('meta[property="article:tag"]');
  if (type === 'article') {
    tags.forEach((tag) => {
      const node = document.createElement('meta');
      node.setAttribute('property', 'article:tag');
      node.setAttribute('content', tag);
      document.head.appendChild(node);
    });
  }

  setStructuredData(structuredData);
}
