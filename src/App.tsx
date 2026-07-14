import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { InternalNavigation } from './routes/InternalNavigation';
import { RouteErrorBoundary } from './routes/RouteErrorBoundary';

const ChatPortfolio = lazy(() => import('./pages/ChatPortfolio'));
const CaseStudyPage = lazy(() => import('./pages/CaseStudyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function LoadingFallback() {
  return (
    <div className="app-loading-shell" role="status" aria-live="polite">
      <div className="app-loading-card">
        <div className="app-loading-mark" aria-hidden="true">R</div>
        <p className="app-loading-title">Preparing RC.AI</p>
        <p className="app-loading-subtitle">Loading the portfolio glass interface.</p>
        <div className="app-loading-track" aria-hidden="true" />
      </div>
    </div>
  );
}

function RouteView({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}

function PersistentRoutes() {
  const location = useLocation();
  const isPortfolioRoute = location.pathname === '/';
  const [hasMountedPortfolio, setHasMountedPortfolio] = useState(isPortfolioRoute);

  useEffect(() => {
    if (!isPortfolioRoute || hasMountedPortfolio) return;
    const frame = window.requestAnimationFrame(() => setHasMountedPortfolio(true));
    return () => window.cancelAnimationFrame(frame);
  }, [hasMountedPortfolio, isPortfolioRoute]);

  return (
    <>
      {hasMountedPortfolio && (
        <div hidden={!isPortfolioRoute} aria-hidden={!isPortfolioRoute}>
          <RouteView><ChatPortfolio isActive={isPortfolioRoute} /></RouteView>
        </div>
      )}

      {!isPortfolioRoute && (
        <Routes location={location}>
          <Route path="/case-studies/:slug" element={<RouteView><CaseStudyPage /></RouteView>} />
          <Route path="*" element={<RouteView><NotFoundPage /></RouteView>} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <InternalNavigation />
      <PersistentRoutes />
    </BrowserRouter>
  );
}
