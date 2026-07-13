import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DottedGridBackground } from '../components/neural/DottedGridBackground';
import { VisionOSCursor } from '../components/ui/VisionOSCursor';
import { setPageMetadata } from '../lib/seo';
import '../case-study.css';

interface NotFoundPageProps {
    title?: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
}

export default function NotFoundPage({
    title = 'Page not found',
    description = 'The page you are looking for does not exist or has moved.',
    backTo = '/',
    backLabel = 'Back to Portfolio',
}: NotFoundPageProps) {
    const location = useLocation();

    useEffect(() => {
        setPageMetadata({
            title: `${title} | Rishabh Chaturvedi`,
            description,
            canonicalPath: location.pathname,
            noIndex: true,
        });
    }, [description, location.pathname, title]);

    return (
        <div className="art-page" data-route-status="404">
            <VisionOSCursor />
            <DottedGridBackground />
            <main className="art-detail-container">
                <Link to={backTo} className="art-back-btn-capsule" style={{ marginBottom: '24px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    {backLabel}
                </Link>
                <div className="art-not-found">
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </main>
        </div>
    );
}
