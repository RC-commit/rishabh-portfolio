import { memo, useEffect, useRef } from 'react';

/**
 * SVG-based dotted grid background with a radial spotlight mask that follows
 * the cursor. Includes a full-canvas spectral wash, vignette, and noise grain
 * so translucent surfaces have variation to refract without decorative blobs.
 */
export const DottedGridBackground = memo(function DottedGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightGradientRef = useRef<SVGRadialGradientElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0-1
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const sg = spotlightGradientRef.current;
    if (!container || !sg) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: 0.5, y: 0.5 };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('mouseleave', onPointerLeave);

    const loop = () => {
      const tx = pointerRef.current.x;
      const ty = pointerRef.current.y;
      const lerp = reduceMotion ? 1 : 0.08;

      currentRef.current.x += (tx - currentRef.current.x) * lerp;
      currentRef.current.y += (ty - currentRef.current.y) * lerp;

      const cx = (currentRef.current.x * 100).toFixed(2) + '%';
      const cy = (currentRef.current.y * 100).toFixed(2) + '%';

      sg.setAttribute('cx', cx);
      sg.setAttribute('cy', cy);

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="dotted-grid-bg"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#07090c',
      }}
    >
      {/* ── SVG dot-grid with spotlight mask ── */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <defs>
          {/* Base dim dot pattern */}
          <pattern
            id="dot-pattern-dim"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="8" r="0.65" fill="rgba(224, 231, 255, 0.15)" />
          </pattern>

          {/* Bright dot pattern — shown only inside spotlight */}
          <pattern
            id="dot-pattern-bright"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="8" r="0.9" fill="rgba(224, 231, 255, 0.45)" />
          </pattern>

          {/* Radial gradient that moves with the cursor — used as mask */}
          <radialGradient
            ref={spotlightGradientRef}
            id="spotlight-grad"
            cx="50%"
            cy="50%"
            r="22%"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="40%" stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="url(#spotlight-grad)" />
          </mask>
        </defs>

        {/* Base dim dots — always visible */}
        <rect width="100%" height="100%" fill="url(#dot-pattern-dim)" />

        {/* Bright dots — only visible inside the spotlight mask */}
        <rect
          width="100%"
          height="100%"
          fill="url(#dot-pattern-bright)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Broad spectral bands give the glass depth without discrete blobs. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(118deg, rgba(88,166,204,.11) 0%, transparent 34%), linear-gradient(242deg, rgba(179,151,224,.09) 0%, transparent 30%), linear-gradient(168deg, transparent 42%, rgba(92,184,157,.055) 70%, transparent 100%)',
        }}
      />

      {/* ── Vignette overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,10,.7) 100%)',
        }}
      />

      {/* ── Noise grain overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          opacity: 0.028,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
});
