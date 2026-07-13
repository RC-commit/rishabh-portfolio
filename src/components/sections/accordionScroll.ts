export function keepAccordionPanelVisible(panelId: string) {
  if (typeof window === 'undefined') return;

  const adjust = () => {
    const panel = document.getElementById(panelId);
    const card = panel?.closest('.cp-card-exp') as HTMLElement | null;
    const feed = card?.closest('.cp-feed') as HTMLElement | null;
    if (!card || !feed) return;

    const inputArea = document.querySelector('.cp-input-area') as HTMLElement | null;
    const cardRect = card.getBoundingClientRect();
    const feedRect = feed.getBoundingClientRect();
    const inputTop = inputArea?.getBoundingClientRect().top ?? feedRect.bottom;
    const visibleBottom = Math.min(feedRect.bottom, inputTop) - 24;
    const overflow = cardRect.bottom - visibleBottom;

    if (overflow > 0) {
      feed.scrollTo({
        top: feed.scrollTop + overflow,
        behavior: 'smooth',
      });
    }
  };

  window.setTimeout(adjust, 120);
  window.setTimeout(adjust, 560);
}
