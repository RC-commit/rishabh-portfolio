import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'vitest';
import { PROJECTS, SKILLS } from '../src/data/resumeData';

interface VercelConfig {
  rewrites?: Array<{ source: string; destination: string }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
}

const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as VercelConfig;

test('SPA fallback excludes API, Vite modules, and static files', () => {
  const fallback = config.rewrites?.find((rewrite) => rewrite.destination === '/index.html');
  assert.ok(fallback, 'Expected an SPA fallback rewrite');

  const sourcePattern = new RegExp(`^${fallback.source}$`);
  assert.equal(sourcePattern.test('/case-studies/tool-grounded-ai'), true);
  assert.equal(sourcePattern.test('/not-a-real-route'), true);
  assert.equal(sourcePattern.test('/api/chat'), false);
  assert.equal(sourcePattern.test('/src/main.tsx'), false);
  assert.equal(sourcePattern.test('/@vite/client'), false);
  assert.equal(sourcePattern.test('/model.glb'), false);
});

test('avatar CSP permits its decoder and embedded textures without general eval', () => {
  const globalHeaders = config.headers?.find((entry) => entry.source === '/(.*)');
  const csp = globalHeaders?.headers.find((header) => header.key === 'Content-Security-Policy')?.value;
  assert.ok(csp, 'Expected a global Content-Security-Policy');
  assert.match(csp, /script-src[^;]*'wasm-unsafe-eval'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-eval'/);
  assert.match(csp, /connect-src[^;]*blob:/);
  assert.match(csp, /img-src[^;]*blob:/);
});

test('sitemap contains every public case study and no retired routes', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8');
  PROJECTS.forEach((project) => {
    assert.match(sitemap, new RegExp(`/case-studies/${project.slug}<`));
  });
  assert.doesNotMatch(sitemap, /\/articles(?:\/|<)/);
  assert.doesNotMatch(sitemap, /\/admin(?:\/|<)/);
});

test('featured globe icons are self-hosted with their license', () => {
  const iconPaths = SKILLS
    .filter((skill) => skill.featured && skill.iconPath)
    .map((skill) => skill.iconPath as string);

  assert.equal(iconPaths.length, 17);
  iconPaths.forEach((iconPath) => {
    const localPath = `public/icons/devicon/${iconPath}`;
    assert.equal(existsSync(localPath), true, `Missing local globe icon: ${localPath}`);
    assert.match(readFileSync(localPath, 'utf8'), /<svg\b/);
  });

  assert.equal(existsSync('public/icons/devicon/LICENSE'), true);
  const iconSources = [
    'src/components/neural/SkillGlobe.tsx',
    'src/pages/ChatPortfolio.tsx',
    'src/lib/skillIconUrl.ts',
  ].map((path) => readFileSync(path, 'utf8')).join('\n');
  assert.doesNotMatch(iconSources, /cdn\.jsdelivr\.net|devicon@latest/);
  assert.match(iconSources, /icons\/devicon\//);
});
