import { memo, useEffect, useRef, useState } from 'react';

/**
 * VisionOS-style cursor with:
 * 1. A canvas-rendered multi-segment comet trail (smooth color shifts, radial glows).
 * 2. An interactive snapping glass ring that morphs to hovered elements via CSS transitions.
 *
 * Bug fixes applied:
 * - Debounced element-to-element transitions prevent jitter when crossing card boundaries.
 * - Trail alpha smoothly interpolates instead of snapping to prevent visual jumps.
 * - PointerEvent delegation avoids stale refs when rapidly moving between cards.
 */
export const VisionOSCursor = memo(function VisionOSCursor({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: -100, y: -100 });
  const activeElementRef = useRef<HTMLElement | null>(null);
  const snappedAlphaRef = useRef(0); // Smooth alpha interpolation for trail fade

  // Comet trail coordinates
  const TRAIL_LENGTH = 9;
  const pointsRef = useRef(Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 })));

  // Debounce timer for element transitions
  const leaveTimerRef = useRef<number>(0);

  // Ring position coordinates for JS-based lerp
  const ringPosRef = useRef({ x: -100, y: -100, w: 24, h: 24 });
  const mouseOnScreenRef = useRef(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    const updateEnabled = () => {
      setEnabled(active && hoverQuery.matches && !motionQuery.matches && !connection?.saveData);
    };

    updateEnabled();
    hoverQuery.addEventListener('change', updateEnabled);
    motionQuery.addEventListener('change', updateEnabled);

    return () => {
      hoverQuery.removeEventListener('change', updateEnabled);
      motionQuery.removeEventListener('change', updateEnabled);
    };
  }, [active]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const ringEl = ringRef.current;
    if (!canvas || !ringEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Interactive selectors for snapping
    const SNAP_SELECTOR =
      'a, button, [role="button"], .cp-sb-nav-item, .cp-chip, .cp-send-btn, .cp-proj-link, .cp-accordion-trigger, .cp-tb-btn, .cp-tb-resume-btn, .cp-sb-action-btn, .ni, .qa-btn, .pill, .tbtn, .tico, .sbtn, .sc';
    const SNAP_EXCLUSION_SELECTOR = '[data-cursor-snap="off"]';

    const findSnapTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest(SNAP_EXCLUSION_SELECTOR)) return null;
      return target.closest(SNAP_SELECTOR) as HTMLElement | null;
    };

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let animationFrameId = 0;
    let quietFrames = 0;
    let loop = () => {};

    const scheduleLoop = () => {
      if (animationFrameId || document.visibilityState === 'hidden') return;
      animationFrameId = requestAnimationFrame(loop);
    };

    // Resize canvas to cover the viewport without overspending on dense displays.
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = Math.round(viewportWidth * dpr);
      canvas.height = Math.round(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      quietFrames = 0;
      scheduleLoop();
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target;
      const interactive = findSnapTarget(target);

      if (target instanceof Element && target.closest(SNAP_EXCLUSION_SELECTOR)) {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = 0;
        activeElementRef.current = null;
        quietFrames = 0;
        scheduleLoop();
        return;
      }

      if (interactive) {
        // Size guard: ignore elements that are too large (e.g. full cards, large headers, panel wrappers)
        // This ensures the snapping ring only targets actual buttons, links, and chips.
        const rect = interactive.getBoundingClientRect();
        if (rect.width > 240 || rect.height > 80) {
          return;
        }

        // Cancel any pending leave timer — the user is moving to a new interactive element
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = 0;
        }
        activeElementRef.current = interactive;
        quietFrames = 0;
        scheduleLoop();
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      const interactive = findSnapTarget(e.target);

      if (interactive && activeElementRef.current === interactive) {
        // Check if the mouse is moving to another interactive element (relatedTarget)
        const nextInteractive = findSnapTarget(e.relatedTarget);

        if (nextInteractive) {
          // Check if next target fits the size guard
          const rect = nextInteractive.getBoundingClientRect();
          if (rect.width <= 240 && rect.height <= 80) {
            // Immediately snap to new target — no delay needed
            activeElementRef.current = nextInteractive;
            quietFrames = 0;
            scheduleLoop();
            return;
          }
        }

        // Leaving interactive area — short debounce to prevent flicker
        // when crossing tiny gaps between elements
        leaveTimerRef.current = window.setTimeout(() => {
          activeElementRef.current = null;
          leaveTimerRef.current = 0;
          quietFrames = 0;
          scheduleLoop();
        }, 60);
      }
    };

    // Release snapping immediately when scrolling to prevent cursor getting stuck
    const handleScroll = () => {
      activeElementRef.current = null;
      quietFrames = 0;
      scheduleLoop();
    };

    // Tracking mouse entering/leaving the viewport
    const handleMouseLeaveDoc = () => {
      mouseOnScreenRef.current = false;
      quietFrames = 0;
      scheduleLoop();
    };
    const handleMouseEnterDoc = () => {
      mouseOnScreenRef.current = true;
      quietFrames = 0;
      scheduleLoop();
    };

    const handleResize = () => {
      resizeCanvas();
      quietFrames = 0;
      scheduleLoop();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      } else {
        quietFrames = 0;
        scheduleLoop();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('mouseleave', handleMouseLeaveDoc);
    document.addEventListener('mouseenter', handleMouseEnterDoc);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    loop = () => {
      animationFrameId = 0;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const pts = pointsRef.current;
      let maxMovement = 0;
      let activeRect: DOMRect | null = null;

      // Clean up stale or detached elements
      if (activeElementRef.current) {
        if (!activeElementRef.current.isConnected) {
          activeElementRef.current = null;
        } else {
          const rect = activeElementRef.current.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            activeElementRef.current = null;
          } else {
            activeRect = rect;
          }
        }
      }

      // Determine target snapped alpha (smooth transition between snapped/free states)
      let targetAlpha = activeElementRef.current ? 0.12 : 1.0;
      if (!mouseOnScreenRef.current) {
        targetAlpha = 0;
      }
      const previousAlpha = snappedAlphaRef.current;
      snappedAlphaRef.current += (targetAlpha - snappedAlphaRef.current) * 0.12;
      maxMovement = Math.max(maxMovement, Math.abs(snappedAlphaRef.current - previousAlpha));

      // Update comet trail physics
      const leadX = pts[0].x;
      const leadY = pts[0].y;
      if (activeRect) {
        const cx = activeRect.left + activeRect.width / 2;
        const cy = activeRect.top + activeRect.height / 2;
        pts[0].x += (cx - pts[0].x) * 0.22;
        pts[0].y += (cy - pts[0].y) * 0.22;
      } else {
        pts[0].x += (mx - pts[0].x) * 0.35;
        pts[0].y += (my - pts[0].y) * 0.35;
      }
      maxMovement = Math.max(maxMovement, Math.abs(pts[0].x - leadX), Math.abs(pts[0].y - leadY));

      // Physics interpolation for trailing segments
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        const previousX = pts[i].x;
        const previousY = pts[i].y;
        const ease = 0.36 - i * 0.008;
        pts[i].x += (pts[i - 1].x - pts[i].x) * ease;
        pts[i].y += (pts[i - 1].y - pts[i].y) * ease;
        maxMovement = Math.max(maxMovement, Math.abs(pts[i].x - previousX), Math.abs(pts[i].y - previousY));
      }

      // Clear canvas
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // Render comet trail on canvas
      const trailAlpha = snappedAlphaRef.current;

      if (trailAlpha > 0.01) {
        for (let i = TRAIL_LENGTH - 1; i >= 0; i--) {
          const t = (TRAIL_LENGTH - i) / TRAIL_LENGTH;
          const radius = 0.8 + t * 3.4;
          const alpha = t * 0.42 * trailAlpha;
          // Violet lead, cyan middle, emerald tail.
          const progress = i / (TRAIL_LENGTH - 1);
          const hue = progress < 0.5
            ? 257 + (187 - 257) * (progress * 2)
            : 187 + (158 - 187) * ((progress - 0.5) * 2);
          const sat = 72;
          const lig = 64;

          const g = ctx.createRadialGradient(pts[i].x, pts[i].y, 0, pts[i].x, pts[i].y, radius * 2.6);
          g.addColorStop(0, `hsla(${hue}, ${sat}%, ${lig}%, ${alpha})`);
          g.addColorStop(1, `hsla(${hue}, ${sat}%, ${lig}%, 0)`);

          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Draw core glow dot on the lead point
        const og = ctx.createRadialGradient(pts[0].x, pts[0].y, 1.5, pts[0].x, pts[0].y, 12);
        og.addColorStop(0, `rgba(72, 199, 217, ${0.18 * trailAlpha})`);
        og.addColorStop(1, 'rgba(72, 199, 217, 0)');
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 12, 0, Math.PI * 2);
        ctx.fillStyle = og;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155, 138, 251, ${0.72 * trailAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
        ctx.fill();
      }

      // Calculate target position and dimensions for the ring
      let tx = pts[0].x - 12;
      let ty = pts[0].y - 12;
      let tw = 24;
      let th = 24;
      let targetRadius = '50%';
      let hasActive = false;

      if (activeElementRef.current && activeRect && mouseOnScreenRef.current) {
        try {
          tx = activeRect.left;
          ty = activeRect.top;
          tw = activeRect.width;
          th = activeRect.height;

          const computedStyle = getComputedStyle(activeElementRef.current);
          targetRadius = computedStyle.borderRadius || '8px';
          hasActive = true;
        } catch {
          activeElementRef.current = null;
        }
      }

      // Lerp the ring's position and size
      const ringPos = ringPosRef.current;
      if (ringPos.x === -100 && ringPos.y === -100 && tx !== -100) {
        ringPos.x = tx;
        ringPos.y = ty;
      }

      const previousRingX = ringPos.x;
      const previousRingY = ringPos.y;
      const previousRingWidth = ringPos.w;
      const previousRingHeight = ringPos.h;
      const snapEase = 0.24;
      ringPos.x += (tx - ringPos.x) * snapEase;
      ringPos.y += (ty - ringPos.y) * snapEase;
      ringPos.w += (tw - ringPos.w) * snapEase;
      ringPos.h += (th - ringPos.h) * snapEase;
      maxMovement = Math.max(
        maxMovement,
        Math.abs(ringPos.x - previousRingX),
        Math.abs(ringPos.y - previousRingY),
        Math.abs(ringPos.w - previousRingWidth),
        Math.abs(ringPos.h - previousRingHeight),
      );

      // Apply the interpolated values to style
      ringEl.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      ringEl.style.width = `${ringPos.w}px`;
      ringEl.style.height = `${ringPos.h}px`;

      if (hasActive) {
        ringEl.style.borderRadius = targetRadius;
        ringEl.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        ringEl.style.borderColor = 'rgba(72, 199, 217, 0.22)';
        ringEl.style.boxShadow = '0 3px 14px rgba(72, 199, 217, 0.06), inset 0 1px rgba(255, 255, 255, 0.10)';
        ringEl.style.opacity = '1';
      } else {
        ringEl.style.borderRadius = '50%';
        ringEl.style.backgroundColor = 'transparent';
        ringEl.style.borderColor = 'rgba(155, 138, 251, 0.10)';
        ringEl.style.boxShadow = 'none';
        ringEl.style.opacity = '0';
      }

      quietFrames = maxMovement < 0.02 ? quietFrames + 1 : 0;
      if (quietFrames < 3) scheduleLoop();
    };

    scheduleLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeaveDoc);
      document.removeEventListener('mouseenter', handleMouseEnterDoc);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Comet trail canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9994,
          mixBlendMode: 'screen',
        }}
      />

      {/* Snapping glass ring */}
      <div
        ref={ringRef}
        className="v-cursor-ring"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '1px solid rgba(155, 138, 251, 0.10)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate3d(-100px, -100px, 0)',
          opacity: 0,
          transition:
            'border-radius 0.24s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out, opacity 0.18s ease-out',
        }}
      />
    </>
  );
});
