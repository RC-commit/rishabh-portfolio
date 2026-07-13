import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { KEY_METRICS, SKILLS } from '../../src/data/resumeData';
import { TESTIMONIALS } from '../../src/data/testimonials';

const USERS_IMPACTED = KEY_METRICS.find((metric) => metric.label === 'Users Impacted')?.value ?? '10M+';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function expectNoSeriousAccessibilityViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const serious = results.violations.filter((violation) => (
    violation.impact === 'serious' || violation.impact === 'critical'
  ));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join('\n')).toEqual([]);
}

async function openProjects(page: import('@playwright/test').Page) {
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

  const projectsNavigation = page.getByRole('button', { name: /Projects 6/ });
  if (!await projectsNavigation.isVisible()) {
    const menuButton = page.getByRole('button', { name: 'Open portfolio navigation' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
  }
  await expect(projectsNavigation).toBeVisible();
  await projectsNavigation.click();
  await expect(page.locator('a[href="/case-studies/tool-grounded-ai"]')).toBeVisible();
}

test('loads the live avatar directly after its skeleton', async ({ page }) => {
  await page.route('**/model.glb', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto('/');

  const avatarStage = page.locator('.cp-hero-avatar-stage-react');
  await expect(avatarStage).toHaveAttribute('data-avatar-state', 'loading', { timeout: 15_000 });
  await expect(page.locator('.cp-avatar-skeleton--model')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.cp-hero-avatar-poster')).toHaveCount(0);
  await expect(avatarStage).toHaveAttribute('data-avatar-state', 'ready', { timeout: 45_000 });
  await expect(page.locator('.cp-avatar-skeleton--model')).toHaveCount(0);
});

test('keeps the home interface compact, grounded, and accessible', async ({ page }) => {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Unavailable in browser test' }),
  }));
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();
  await expect(page.getByText(USERS_IMPACTED, { exact: true })).toBeVisible();
  const composer = page.locator('.cp-input-box');
  await expect(composer).toBeVisible();
  expect((await composer.boundingBox())?.height ?? 999).toBeLessThanOrEqual(56);

  const input = page.getByRole('textbox', { name: 'Chat message input' });
  await input.fill('What search performance result is documented?');
  await page.getByRole('button', { name: 'Send message' }).click({ force: true });
  await expect(page.getByText(/900ms.*150ms|150ms.*900ms/i).last()).toBeVisible({ timeout: 20_000 });

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test('returns distinct and direct quick-action answers', async ({ page }) => {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Use deterministic fallback in browser test' }),
  }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

  const clickQuickAction = async (name: string) => {
    const action = page.getByRole('button', { name, exact: true });
    if (!await action.isVisible()) {
      await page.getByRole('button', { name: 'Open portfolio navigation' }).click();
    }
    await expect(action).toBeVisible();
    await action.click();
  };

  await clickQuickAction('Biggest win');
  const biggestWin = page.getByText(/strongest documented.*61%/is).last();
  await expect(biggestWin).toBeVisible({ timeout: 20_000 });
  await expect(biggestWin).toContainText(/massive recurring cost savings/i);
  await expect(biggestWin).toContainText(/upgrading and modernizing/i);

  await clickQuickAction('Current work');
  const currentWork = page.getByText(/current work has two connected tracks/is).last();
  await expect(currentWork).toBeVisible({ timeout: 20_000 });

  await clickQuickAction('Available for hire?');
  const availability = page.getByText(/^Yes\. Rishabh is open/is).last();
  await expect(availability).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#anchor-contact')).toBeAttached();

  expect(await biggestWin.textContent()).not.toEqual(await currentWork.textContent());
});

test('shows E2E Ownership on the current Blackstraw role', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

  const experienceNavigation = page.getByRole('button', { name: /Experience 3 roles/ });
  if (!await experienceNavigation.isVisible()) {
    await page.getByRole('button', { name: 'Open portfolio navigation' }).click();
  }
  await experienceNavigation.click();

  const blackstrawRole = page.getByRole('button', {
    name: /Senior Software Engineer at Blackstraw Technologies Pvt Ltd/,
  });
  await expect(blackstrawRole).toBeVisible();
  await blackstrawRole.click({ force: true });

  const blackstrawCard = page.locator('.cp-card-exp').first();
  await expect(blackstrawCard.locator('.cp-em-val', { hasText: 'E2E' })).toBeVisible();
  await expect(blackstrawCard.locator('.cp-em-label', { hasText: 'Ownership' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('shows attributable LinkedIn recommendations without anonymous placeholders', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

  const reviewsNavigation = page.getByRole('button', { name: new RegExp(`Reviews ${TESTIMONIALS.length}`) });
  if (!await reviewsNavigation.isVisible()) {
    await page.getByRole('button', { name: 'Open portfolio navigation' }).click();
  }
  await reviewsNavigation.click();

  const reviewTabs = page.getByRole('tab');
  await expect(reviewTabs).toHaveCount(TESTIMONIALS.length);
  await expect(page.locator('.cp-review-stage')).toHaveCount(1);
  const bhagyashriTab = page.getByRole('tab', { name: 'Bhagyashri Shinde, Client' });
  await expect(bhagyashriTab).toHaveAttribute('aria-selected', 'true');
  await expect(bhagyashriTab).toHaveAttribute('data-magnetic-initials', 'true');
  await expect(bhagyashriTab).toHaveAttribute('data-cursor-snap', 'off');
  if (testInfo.project.name === 'desktop') {
    const cursorRing = page.locator('.v-cursor-ring');
    await expect(cursorRing).toHaveCount(1);
    await bhagyashriTab.hover({ position: { x: 52, y: 18 } });
    await expect(cursorRing).toHaveCSS('opacity', '0');
  }
  await expect(page.getByRole('tabpanel')).toContainText('requirements which smoothens the process flow');
  await expect(page.getByRole('button', { name: 'Previous recommendation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next recommendation' })).toBeVisible();

  const pauseAutoPlay = page.getByRole('button', { name: 'Pause automatic recommendations' });
  await expect(pauseAutoPlay).toBeVisible();
  await pauseAutoPlay.click();
  await expect(page.locator('.cp-review-showcase')).toHaveAttribute('data-review-autoplay', 'off');
  const resumeAutoPlay = page.getByRole('button', { name: 'Resume automatic recommendations' });
  await resumeAutoPlay.click();
  await expect(pauseAutoPlay).toHaveAttribute('data-autoplay-enabled', 'true');

  const sanchayanTab = page.getByRole('tab', { name: 'Sanchayan Paul, Manager' });
  await sanchayanTab.click();
  await expect(sanchayanTab).toHaveAttribute('aria-selected', 'true');
  const readFull = page.getByRole('button', { name: 'Read full recommendation' });
  if (testInfo.project.name === 'mobile') {
    await expect(readFull).toBeVisible();
    await readFull.click();
    await expect(page.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  } else {
    await expect(readFull).toBeHidden();
  }

  const jpTab = page.getByRole('tab', { name: 'JP Shrivastav, Mentor' });
  await jpTab.click();
  await expect(jpTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText(/excellent engineer.*programming and debugging skills/is);
  await expect(page.getByRole('link', { name: 'JP Shrivastav', exact: true })).toBeVisible();
  await expect(page.getByText(/Anonymized excerpts/i)).toHaveCount(0);

  const sourceLink = page.locator('.cp-review-source-link');
  await expect(sourceLink).toHaveAttribute('href', 'https://www.linkedin.com/in/jaiprakashshrivastav/');

  await jpTab.focus();
  await jpTab.press('ArrowRight');
  const amitTab = page.getByRole('tab', { name: 'Amit Patil, Teammate' });
  await expect(amitTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText(/punctual.*flexible/i);

  if (testInfo.project.name === 'mobile') {
    await page.waitForTimeout(500);
    const centerDelta = await page.locator('.cp-review-tabs').evaluate((rail) => {
      const activeTab = rail.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!activeTab) return Number.POSITIVE_INFINITY;
      const railRect = rail.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      return Math.abs(
        (railRect.left + railRect.width / 2) - (tabRect.left + tabRect.width / 2),
      );
    });
    expect(centerDelta).toBeLessThan(4);
  }

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test('appends company-specific cards and keeps the full timeline separate', async ({ page }) => {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Use deterministic fallback in browser test' }),
  }));
  await page.goto('/');

  const input = page.getByRole('textbox', { name: 'Chat message input' });
  await input.fill('What did Rishabh do at Blackstraw?');
  await page.getByRole('button', { name: 'Send message' }).click({ force: true });

  await expect(page.getByText(/currently works as.*Senior Software Engineer/i).last()).toBeVisible();
  await expect(page.locator('.cp-card-exp')).toHaveCount(1);
  await expect(page.locator('.cp-card-exp .cp-exp-co')).toHaveText('Blackstraw Technologies Pvt Ltd');
  await expect(page.locator('.cp-exp-header')).toHaveAttribute('aria-expanded', 'true');

  await input.fill('What did Rishabh do at PurpleMonks?');
  await page.getByRole('button', { name: 'Send message' }).click({ force: true });
  await expect(page.getByText(/worked as.*Full Stack Developer/i).last()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.cp-card-exp')).toHaveCount(2);
  await expect(page.locator('.cp-card-exp .cp-exp-co')).toHaveText([
    'Blackstraw Technologies Pvt Ltd',
    'PurpleMonks Technology Pvt Ltd',
  ]);

  const experienceNavigation = page.getByRole('button', { name: /Experience 3 roles/ });
  if (await experienceNavigation.count() === 0) {
    await page.getByRole('button', { name: 'Open portfolio navigation' }).click({ force: true });
  }
  await experienceNavigation.click({ force: true });
  const fullExperienceMessage = page.locator('.cp-mrow').filter({ has: page.locator('#anchor-experience') }).last();
  await expect(fullExperienceMessage.locator('.cp-card-exp')).toHaveCount(3);
  await expect(page.locator('.cp-card-exp')).toHaveCount(5);

  await page.evaluate(() => {
    const state = window as typeof window & { __portfolioActions?: unknown[] };
    state.__portfolioActions = [];
    window.addEventListener('ai-ui-action', (event) => {
      state.__portfolioActions?.push((event as CustomEvent).detail);
    }, { once: true });
  });
  await input.fill('Who is Rishabh?');
  await page.getByRole('button', { name: 'Send message' }).click({ force: true });
  await expect(page.getByText(/Rishabh is a|Rishabh Chaturvedi's official/i).last()).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    (window as typeof window & { __portfolioActions?: unknown[] }).__portfolioActions?.at(-1)
  ))).toEqual({ action: 'focus_section', value: 'intro' });
  await expect.poll(() => page.locator('.cp-feed').evaluate((feed) => feed.scrollTop)).toBeLessThanOrEqual(1);
});

test('renders case studies and retires the article and admin routes', async ({ page }) => {
  await page.goto('/');
  await openProjects(page);

  const caseStudyLink = page.locator('a[href="/case-studies/tool-grounded-ai"]');
  await Promise.all([
    page.waitForURL(/\/case-studies\/tool-grounded-ai$/),
    caseStudyLink.click(),
  ]);
  await expect(page.getByRole('heading', { name: /Tool-Grounded AI Portfolio Assistant/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Challenge' })).toBeVisible();
  await expect(page.locator('.case-container')).toHaveCSS('position', 'relative');
  await expect(page.locator('.case-container')).toHaveCSS('z-index', '1');
  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto('/case-studies/elasticsearch-optimization');
  await expect(page.getByRole('heading', { name: /ElasticSearch & API Performance Optimization/ })).toBeVisible();

  await page.goto('/articles');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible({ timeout: 20_000 });

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible({ timeout: 20_000 });

  await page.goto('/not-a-real-route');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-route-status="404"]')).toBeVisible();
});

test('preserves chat and project state across case-study navigation', async ({ page }) => {
  await page.route('**/api/chat', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Use deterministic fallback in browser test' }),
  }));
  await page.goto('/');

  const avatarStage = page.locator('.cp-hero-avatar-stage-react');
  await expect(avatarStage).toHaveAttribute('data-avatar-state', 'ready', { timeout: 45_000 });
  const avatarElement = await avatarStage.elementHandle();
  expect(avatarElement).not.toBeNull();

  const input = page.getByRole('textbox', { name: 'Chat message input' });
  await input.fill('What search performance result is documented?');
  await page.getByRole('button', { name: 'Send message' }).click({ force: true });
  const retainedAnswer = page.getByText(/900ms.*150ms|150ms.*900ms/i).last();
  await expect(retainedAnswer).toBeVisible({ timeout: 20_000 });

  await openProjects(page);
  const caseStudyLink = page.locator('a[href="/case-studies/tool-grounded-ai"]');
  await caseStudyLink.click();
  await expect(page).toHaveURL(/\/case-studies\/tool-grounded-ai$/);
  await expect(page.getByRole('heading', { name: /Tool-Grounded AI Portfolio Assistant/ })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(retainedAnswer).toBeVisible();
  await expect(caseStudyLink).toBeVisible();
  expect(await page.evaluate((element) => (
    element?.isConnected && element === document.querySelector('.cp-hero-avatar-stage-react')
  ), avatarElement)).toBe(true);

  await caseStudyLink.click();
  await expect(page).toHaveURL(/\/case-studies\/tool-grounded-ai$/);
  await page.getByRole('link', { name: 'Portfolio' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(retainedAnswer).toBeVisible();
  await expect(caseStudyLink).toBeVisible();
});

test('shows the complete indexed tech stack alongside the featured globe', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

  const stackNavigation = page.getByRole('button', { name: new RegExp(`Tech Stack ${SKILLS.length}`) });
  if (!await stackNavigation.isVisible()) {
    await page.getByRole('button', { name: 'Open portfolio navigation' }).click();
  }
  await expect(stackNavigation).toBeVisible();
  await stackNavigation.click();

  const globe = page.getByRole('img', { name: /Interactive globe highlighting \d+ core technologies/ });
  await expect(globe).toBeVisible();
  await expect(globe).toHaveAttribute('data-icon-source', 'local');
  await expect(globe).toHaveAttribute('data-max-dpr', '1.75');
  await expect(globe).toHaveAttribute('data-render-state', 'active', { timeout: 10_000 });

  const globeIcons = page.locator('.cp-globe-icon');
  await expect(globeIcons).toHaveCount(17, { timeout: 10_000 });
  const iconSources = await globeIcons.evaluateAll((icons) => (
    icons.map((icon) => (icon as HTMLImageElement).src)
  ));
  expect(iconSources).toHaveLength(17);
  expect(iconSources.every((source) => source.includes('/icons/devicon/'))).toBe(true);
  expect(iconSources.some((source) => source.includes('cdn.jsdelivr.net'))).toBe(false);

  const canvasPixelRatio = await page.locator('.cp-skill-globe-container canvas').evaluate((canvas) => (
    (canvas as HTMLCanvasElement).width / canvas.getBoundingClientRect().width
  ));
  expect(canvasPixelRatio).toBeLessThanOrEqual(1.76);

  if (testInfo.project.name === 'desktop') {
    await globe.hover();
    await expect(globe).toHaveAttribute('data-rotation-state', 'paused');

    const canvasBox = await page.locator('.cp-skill-globe-container canvas').boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 18, canvasBox.y + 18);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 52, canvasBox.y + 26, { steps: 4 });
      await expect(globe).toHaveAttribute('data-drag-state', 'dragging');
      await page.mouse.up();
      await expect(globe).toHaveAttribute('data-drag-state', 'idle');
    }

    await page.mouse.move(2, 2);
    await expect(globe).toHaveAttribute('data-rotation-state', 'running');
  } else {
    const labelOpacities = await page.locator('.cp-globe-skill-name').evaluateAll((labels) => (
      labels.map((label) => Number.parseFloat(getComputedStyle(label).opacity))
    ));
    const nodeOpacities = await page.locator('.cp-globe-skill-node').evaluateAll((nodes) => (
      nodes.map((node) => Number.parseFloat(getComputedStyle(node).opacity))
    ));
    expect(labelOpacities.some((opacity) => opacity < 0.5)).toBe(true);
    expect(nodeOpacities.every((opacity) => opacity >= 0.99)).toBe(true);
  }

  const stackScrollCue = page.getByRole('button', { name: 'View complete skill list' });
  await expect(stackScrollCue).toBeVisible();
  await expect(stackScrollCue).toHaveAttribute('aria-controls', 'complete-stack-title');
  await stackScrollCue.click({ force: true });
  await expect.poll(() => page.locator('#complete-stack-title').evaluate((heading) => (
    heading.getBoundingClientRect().top
  ))).toBeLessThan(350);

  await expect(page.getByRole('heading', { name: 'Complete stack' })).toBeVisible();
  await expect(page.getByText(`${SKILLS.length} skills across 6 capability areas`, { exact: true })).toBeVisible();
  await expect(page.locator('.cp-stack-pillar')).toHaveCount(0);
  await expect(page.locator('.cp-stack-group')).toHaveCount(6);
  await expect(page.locator('.cp-stack-skill')).toHaveCount(SKILLS.length);
  const directoryIconSources = await page.locator('.cp-stack-skill img').evaluateAll((icons) => (
    icons.map((icon) => (icon as HTMLImageElement).src)
  ));
  expect(directoryIconSources).toHaveLength(17);
  expect(directoryIconSources.every((source) => source.includes('/icons/devicon/'))).toBe(true);
  await expect(page.getByText('LLM Application Architecture', { exact: true })).toBeVisible();
  await expect(page.getByText('Multi-Agent Systems', { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.locator('.cp-feed').evaluate((feed) => {
    feed.scrollTop = feed.scrollHeight;
  });
  await expect(globe).toHaveAttribute('data-render-state', 'paused');
});

test('starts fresh on About after a full page refresh', async ({ page }) => {
  await page.goto('/#projects');
  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#anchor-intro')).toBeAttached();
  await expect(page.locator('#anchor-projects')).toHaveCount(0);
  await expect(page.locator('.cp-sb-nav-item.active .cp-sb-nav-label')).toHaveText('About');

  await openProjects(page);
  await expect(page).toHaveURL(/\/#projects$/);

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#anchor-projects')).toHaveCount(0);
  await expect(page.locator('.cp-sb-nav-item.active .cp-sb-nav-label')).toHaveText('About');
});
