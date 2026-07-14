import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { setPageMetadata } from '../lib/seo';
import '../case-study.css';

interface BoundaryProps {
    children: ReactNode;
    resetKey: string;
}

interface BoundaryState {
    error: Error | null;
}

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
    state: BoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): BoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Route rendering failed', error, info.componentStack);
    }

    componentDidUpdate(previousProps: BoundaryProps) {
        if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    render() {
        if (this.state.error) return <RouteErrorFallback onRetry={() => window.location.reload()} />;
        return this.props.children;
    }
}

function RouteErrorFallback({ onRetry }: { onRetry: () => void }) {
    useEffect(() => {
        setPageMetadata({
            title: 'Page temporarily unavailable | Rishabh Chaturvedi',
            description: 'This page could not be displayed. Please retry or return to the portfolio.',
            canonicalPath: window.location.pathname,
            noIndex: true,
        });
    }, []);

    return (
        <main className="art-page">
            <div className="art-detail-container">
                <div className="art-not-found" role="alert">
                    <h1>This page could not be displayed</h1>
                    <p>Retry the page, or return to the portfolio and continue from there.</p>
                    <div className="case-actions">
                        <button className="art-action-btn" type="button" onClick={onRetry}>Retry</button>
                        <Link className="art-action-btn" to="/">Portfolio</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export function RouteErrorBoundary({ children }: { children: ReactNode }) {
    const location = useLocation();
    const resetKey = `${location.pathname}${location.search}${location.hash}`;
    return <ErrorBoundary resetKey={resetKey}>{children}</ErrorBoundary>;
}
