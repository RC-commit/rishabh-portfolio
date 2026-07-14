import { expect, test } from '@playwright/test';

const MOBILE_WIDTHS = [320, 375, 412] as const;

const SECTIONS = [
  { key: 'intro', label: 'About' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'projects', label: 'Projects' },
  { key: 'stack', label: 'Tech Stack' },
  { key: 'testimonials', label: 'Reviews' },
  { key: 'contact', label: 'Contact' },
] as const;

for (const width of MOBILE_WIDTHS) {
  test(`keeps every portfolio section responsive at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Covered once by the mobile browser project.');
    await page.route('**/model.glb', (route) => route.abort('blockedbyclient'));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Rishabh Chaturvedi' })).toBeVisible();

    for (const section of SECTIONS) {
      if (section.key !== 'intro') {
        const navigation = page.locator('.cp-sb-nav-item').filter({ hasText: section.label }).first();
        if (!await navigation.isVisible()) {
          await page.getByRole('button', { name: 'Open portfolio navigation' }).click({ force: true });
        }
        await navigation.click({ force: true });
      }
      const anchor = page.locator(`#anchor-${section.key}`).last();
      await anchor.waitFor({ state: 'attached' });
      const row = anchor.locator('xpath=ancestor::div[contains(@class, "cp-mrow")][1]');
      await row.evaluate((element) => {
        const feed = element.closest<HTMLElement>('.cp-feed');
        if (feed) feed.scrollTop = (element as HTMLElement).offsetTop - 12;
      });
      await page.waitForTimeout(150);

      if (section.key === 'experience') {
        await row.getByRole('button', { name: /Senior Software Engineer at Blackstraw/ }).click({ force: true });
        await page.waitForTimeout(300);
      }

      const audit = await row.evaluate((root) => {
        const allowedScrollers = new Set([
          'cp-projects-coverflow',
          'cp-review-tabs',
          'cp-suggestions',
          'cp-feed',
          'cp-sidebar-body',
          'cp-card-testimonial',
        ]);
        const clipped = Array.from(root.querySelectorAll<HTMLElement>('*'))
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            if (element.closest('.cp-skill-globe-container')) return false;
            if (element.clientWidth < 8 || element.scrollWidth <= element.clientWidth + 2) return false;
            if ([...allowedScrollers].some((className) => element.classList.contains(className))) return false;
            return !['auto', 'scroll'].includes(style.overflowX);
          })
          .slice(0, 16)
          .map((element) => ({
            className: element.className.toString().slice(0, 100),
            clientWidth: element.clientWidth,
            parentClassName: element.parentElement?.getAttribute('class')?.slice(0, 100) ?? '',
            scrollWidth: element.scrollWidth,
            tag: element.tagName.toLowerCase(),
          }));

        const content = root.querySelector<HTMLElement>('.cp-mcontent');
        const projectRail = root.querySelector<HTMLElement>('.cp-projects-coverflow');
        const projectCard = projectRail?.querySelector<HTMLElement>('.cp-card-proj');
        const reviewShowcase = root.querySelector<HTMLElement>('.cp-review-showcase');
        const reviewStage = root.querySelector<HTMLElement>('.cp-review-stage');
        const emailButton = root.querySelector<HTMLElement>('.cp-contact-btn--email');
        const phoneButton = root.querySelector<HTMLElement>('.cp-contact-btn--phone');
        const experiencePanels = Array.from(root.querySelectorAll<HTMLElement>('.cp-exp-body.is-open'));

        return {
          documentClientWidth: document.documentElement.clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          clipped,
          contentUsesRow: !root.classList.contains('cp-mrow--structured')
            || !content
            || content.clientWidth >= root.clientWidth - 25,
          projectCardFits: !projectRail || !projectCard || projectCard.offsetWidth <= projectRail.clientWidth,
          reviewStageFits: !reviewShowcase || !reviewStage || reviewStage.offsetWidth <= reviewShowcase.clientWidth,
          emailFits: !emailButton || emailButton.scrollWidth <= emailButton.clientWidth + 1,
          phoneFits: !phoneButton || phoneButton.scrollWidth <= phoneButton.clientWidth + 1,
          experiencePanelsFit: experiencePanels.every((panel) => panel.scrollWidth <= panel.clientWidth + 1),
        };
      });

      expect(audit.documentScrollWidth).toBeLessThanOrEqual(audit.documentClientWidth + 1);
      expect(audit.clipped, `${section.key} contains clipped mobile content`).toEqual([]);
      expect(audit.contentUsesRow).toBe(true);
      expect(audit.projectCardFits).toBe(true);
      expect(audit.reviewStageFits).toBe(true);
      expect(audit.emailFits).toBe(true);
      expect(audit.phoneFits).toBe(true);
      expect(audit.experiencePanelsFit).toBe(true);
    }
  });
}
