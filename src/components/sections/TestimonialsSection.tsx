import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { TESTIMONIALS, type Testimonial } from '../../data/testimonials';
import { TiltedCardWrapper } from '../ui/TiltedCardWrapper';

const REVIEW_ACCENTS = [
  '137, 205, 224',
  '181, 151, 232',
  '103, 198, 168',
  '232, 181, 108',
] as const;

const PERSPECTIVES = ['Client', 'Manager', 'Teammate', 'Mentor', 'Peer'] as const;

const PERSPECTIVE_COUNTS = PERSPECTIVES.map((perspective) => ({
  perspective,
  count: TESTIMONIALS.filter((testimonial) => testimonial.perspective === perspective).length,
})).filter(({ count }) => count > 0);

const MIN_AUTO_ADVANCE_MS = 4_000;
const MAX_AUTO_ADVANCE_MS = 8_000;

interface MagneticReviewTabProps {
  testimonial: Testimonial;
  index: number;
  isActive: boolean;
  reduceMotion: boolean;
  setRef: (element: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const MagneticReviewTab = memo(function MagneticReviewTab({
  testimonial,
  index,
  isActive,
  reduceMotion,
  setRef,
  onSelect,
  onKeyDown,
}: MagneticReviewTabProps) {
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const springX = useSpring(pullX, { stiffness: 360, damping: 24, mass: 0.45 });
  const springY = useSpring(pullY, { stiffness: 360, damping: 24, mass: 0.45 });

  const resetPull = () => {
    pullX.set(0);
    pullY.set(0);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    pullX.set(Math.max(-7, Math.min(7, offsetX * 0.24)));
    pullY.set(Math.max(-5, Math.min(5, offsetY * 0.2)));
  };

  return (
    <button
      ref={setRef}
      id={`review-tab-${index}`}
      className={`cp-review-tab${isActive ? ' is-active' : ''}`}
      type="button"
      role="tab"
      aria-label={`${testimonial.name}, ${testimonial.perspective}`}
      aria-selected={isActive}
      aria-controls="active-review-panel"
      tabIndex={isActive ? 0 : -1}
      title={`${testimonial.name}, ${testimonial.perspective}`}
      data-magnetic-initials="true"
      data-cursor-snap="off"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPull}
      onPointerCancel={resetPull}
    >
      <motion.span
        className="cp-review-tab-avatar"
        aria-hidden="true"
        style={{ x: springX, y: springY }}
      >
        {testimonial.initials}
      </motion.span>
      <span className="cp-review-tab-name">{testimonial.name.split(' ')[0]}</span>
    </button>
  );
});

export const TestimonialsSection = memo(function TestimonialsSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isPointerPaused, setIsPointerPaused] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(() => (
    typeof document === 'undefined' || document.visibilityState !== 'hidden'
  ));
  const showcaseRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeTestimonial = TESTIMONIALS[activeIndex];
  const isLongReview = activeTestimonial.quote.length > 260;
  const isExpanded = expandedIndex === activeIndex;
  const isAutoPlayPaused = reduceMotion
    || !isInView
    || !isPageVisible
    || isPointerPaused
    || isFocusPaused
    || isExpanded;
  const autoPlayStatus = !isAutoPlayEnabled ? 'off' : (isAutoPlayPaused ? 'paused' : 'running');

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.25));
    }, { threshold: [0, 0.25, 0.5] });
    observer.observe(showcase);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (!isAutoPlayEnabled || isAutoPlayPaused) return;
    const delay = Math.min(
      MAX_AUTO_ADVANCE_MS,
      Math.max(MIN_AUTO_ADVANCE_MS, 3_200 + activeTestimonial.quote.length * 8),
    );
    const timeout = window.setTimeout(() => {
      setExpandedIndex(null);
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, activeTestimonial.quote.length, isAutoPlayEnabled, isAutoPlayPaused]);

  useEffect(() => {
    const tabs = tabsRef.current;
    const activeTab = tabRefs.current[activeIndex];
    if (!tabs || !activeTab || tabs.scrollWidth <= tabs.clientWidth) return;
    const targetLeft = activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2;
    tabs.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeIndex, reduceMotion]);

  const selectReview = (index: number, focus = false, revealPanel = false) => {
    const nextIndex = (index + TESTIMONIALS.length) % TESTIMONIALS.length;
    setActiveIndex(nextIndex);
    setExpandedIndex(null);
    requestAnimationFrame(() => {
      if (focus) tabRefs.current[nextIndex]?.focus({ preventScroll: true });
      if (revealPanel) {
        const reveal = () => panelRef.current?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
        if (reduceMotion) reveal();
        else window.setTimeout(reveal, 260);
      }
    });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = TESTIMONIALS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    selectReview(nextIndex, true);
  };

  return (
    <section
      ref={showcaseRef}
      className="cp-review-showcase"
      aria-label="LinkedIn recommendations"
      data-review-autoplay={autoPlayStatus}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setIsPointerPaused(true);
      }}
      onPointerLeave={() => setIsPointerPaused(false)}
      onFocusCapture={() => setIsFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusPaused(false);
      }}
    >
      <div className="cp-review-overview">
        <div>
          <div className="cp-review-eyebrow">LinkedIn recommendations</div>
          <div className="cp-review-summary">Eight perspectives. One consistent signal.</div>
        </div>
        <div className="cp-review-perspectives" aria-label="Reviewer perspectives">
          {PERSPECTIVE_COUNTS.map(({ perspective, count }) => (
            <span key={perspective}><strong>{count}</strong> {perspective}{count > 1 ? 's' : ''}</span>
          ))}
        </div>
      </div>

      <div className="cp-review-tabs-wrap">
        <div ref={tabsRef} className="cp-review-tabs" role="tablist" aria-label="Choose a LinkedIn recommendation">
          {TESTIMONIALS.map((testimonial, index) => {
            const isActive = index === activeIndex;
            return (
              <MagneticReviewTab
                key={testimonial.profileUrl}
                testimonial={testimonial}
                index={index}
                isActive={isActive}
                reduceMotion={reduceMotion}
                setRef={(element) => { tabRefs.current[index] = element; }}
                onSelect={() => selectReview(index, false, true)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              />
            );
          })}
        </div>
      </div>

      <TiltedCardWrapper
        className="cp-card-testimonial cp-review-stage"
        maxTilt={3}
        keyboardAction={false}
        style={{ '--review-accent': REVIEW_ACCENTS[activeIndex % REVIEW_ACCENTS.length] } as React.CSSProperties}
      >
        <div
          id="active-review-panel"
          ref={panelRef}
          className="cp-review-panel"
          role="tabpanel"
          aria-labelledby={`review-tab-${activeIndex}`}
          tabIndex={0}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              className="cp-review-stage-content"
              key={activeTestimonial.profileUrl}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            >
              <blockquote className="cp-review-quote-block">
                <div className="cp-review-quote-meta">
                  <span className="cp-review-theme">{activeTestimonial.theme}</span>
                  <div className="cp-review-inline-controls">
                    <button
                      className="cp-review-arrow"
                      type="button"
                      title="Previous recommendation"
                      aria-label="Previous recommendation"
                      onClick={() => selectReview(activeIndex - 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <span className="cp-review-progress-label">
                      {String(activeIndex + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
                    </span>
                    <button
                      className="cp-review-arrow"
                      type="button"
                      title="Next recommendation"
                      aria-label="Next recommendation"
                      onClick={() => selectReview(activeIndex + 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                    <button
                      className="cp-review-arrow cp-review-autoplay"
                      type="button"
                      title={isAutoPlayEnabled ? 'Pause automatic recommendations' : 'Resume automatic recommendations'}
                      aria-label={isAutoPlayEnabled ? 'Pause automatic recommendations' : 'Resume automatic recommendations'}
                      data-autoplay-enabled={isAutoPlayEnabled}
                      onClick={() => setIsAutoPlayEnabled((enabled) => !enabled)}
                    >
                      {isAutoPlayEnabled ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M9 5v14M15 5v14" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                          <path d="m8 5 11 7-11 7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <p className={isLongReview && !isExpanded ? 'is-collapsed' : undefined}>
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </p>
                {isLongReview && (
                  <button
                    className="cp-review-read-more"
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedIndex(isExpanded ? null : activeIndex)}
                  >
                    {isExpanded ? 'Show less' : 'Read full recommendation'}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={isExpanded ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
                    </svg>
                  </button>
                )}
              </blockquote>

              <footer className="cp-review-person-card">
                <div className="cp-review-person-avatar" aria-hidden="true">{activeTestimonial.initials}</div>
                <div className="cp-review-person-copy">
                  <a
                    className="cp-review-person-name"
                    href={activeTestimonial.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeTestimonial.name}
                  </a>
                  <div className="cp-review-person-headline">{activeTestimonial.headline}</div>
                  <div className="cp-review-context">
                    <span>{activeTestimonial.relationship}</span>
                    <span aria-hidden="true">&middot;</span>
                    <time>{activeTestimonial.date}</time>
                  </div>
                  <a
                    className="cp-review-source-link"
                    href={activeTestimonial.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${activeTestimonial.name}'s recommendation source on LinkedIn`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    View source
                  </a>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="cp-review-stage-footer" aria-hidden="true">
          <span style={{ width: `${((activeIndex + 1) / TESTIMONIALS.length) * 100}%` }} />
        </div>
      </TiltedCardWrapper>

    </section>
  );
});
