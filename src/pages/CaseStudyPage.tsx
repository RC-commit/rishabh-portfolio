import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DottedGridBackground } from '../components/neural/DottedGridBackground';
import { PROFILE, PROJECTS } from '../data/resumeData';
import { OFFICIAL_CURRENT_TITLE } from '../data/publicProfile';
import { createArticleStructuredData, getCanonicalUrl, setPageMetadata } from '../lib/seo';
import NotFoundPage from './NotFoundPage';
import '../case-study.css';

type CopyStatus = 'idle' | 'copied' | 'failed';

async function copyToClipboard(value: string) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Fall through to the selection-based fallback.
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        if (!document.execCommand('copy')) throw new Error('Copy command was rejected');
    } finally {
        textarea.remove();
    }
}

export default function CaseStudyPage() {
    const { slug } = useParams<{ slug: string }>();
    const requestedSlug = slug || '';
    const project = useMemo(() => PROJECTS.find((p) => p.slug === requestedSlug), [requestedSlug]);
    const [copyState, setCopyState] = useState<{ slug: string; status: CopyStatus }>({ slug: requestedSlug, status: 'idle' });
    const copyResetTimer = useRef<number | null>(null);
    const copyStatus = copyState.slug === requestedSlug ? copyState.status : 'idle';

    useEffect(() => {
        if (!project) {
            setPageMetadata({
                title: 'Case Study Not Found | Rishabh Chaturvedi',
                description: 'The requested engineering case study could not be found.',
                canonicalPath: `/case-studies/${requestedSlug}`,
                noIndex: true,
            });
            return;
        }

        const canonicalPath = `/case-studies/${project.slug}`;
        setPageMetadata({
            title: `${project.seoTitle || project.title} | Rishabh Chaturvedi`,
            description: project.seoDescription || project.description,
            canonicalPath,
            imageAlt: `${project.title} engineering case study preview`,
            type: 'article',
            tags: project.tags,
            structuredData: createArticleStructuredData({
                headline: project.seoTitle || project.title,
                description: project.seoDescription || project.description,
                canonicalPath,
                keywords: project.tags,
            }),
        });
    }, [project, requestedSlug]);

    useEffect(() => () => {
        if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
    }, []);

    const handleCopy = async () => {
        const copySlug = project?.slug || requestedSlug;

        try {
            await copyToClipboard(getCanonicalUrl(`/case-studies/${copySlug}`));
            setCopyState({ slug: copySlug, status: 'copied' });
        } catch {
            setCopyState({ slug: copySlug, status: 'failed' });
        }

        if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
        copyResetTimer.current = window.setTimeout(() => {
            setCopyState((current) => current.slug === copySlug ? { slug: copySlug, status: 'idle' } : current);
        }, 2400);
    };

    const handleShare = () => {
        const url = encodeURIComponent(getCanonicalUrl(`/case-studies/${project?.slug || requestedSlug}`));
        const summary = encodeURIComponent(project?.shareText || project?.description || '');
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${summary}`, '_blank', 'noopener,noreferrer');
    };

    if (!project) {
        return <NotFoundPage title="Case study not found" description="This project story is not available." />;
    }

    const metrics = project.displayMetrics || Object.entries(project.metrics).map(([key, value]) => `${key}: ${value}`);

    return (
        <div className="art-page case-page">
            <DottedGridBackground />

            <article className="case-container">
                <Link to="/" className="art-back-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Portfolio
                </Link>

                <header className="case-hero">
                    <div className="case-eyebrow">{project.category || 'ENGINEERING CASE STUDY'}</div>
                    <h1 className="case-title">{project.title}</h1>
                    <p className="case-summary">{project.description}</p>
                    <div className="case-meta">
                        <span>{OFFICIAL_CURRENT_TITLE}</span>
                        <span className="art-meta-dot">.</span>
                        <span>{PROFILE.location}</span>
                    </div>
                    <div className="case-actions">
                        <button className="art-action-btn art-action-btn--linkedin" type="button" onClick={handleShare} aria-label="Share case study on LinkedIn">
                            Share on LinkedIn
                        </button>
                        <button className="art-action-btn" type="button" onClick={handleCopy} aria-live="polite">
                            {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy Link'}
                        </button>
                    </div>
                </header>

                <section className="case-metrics" aria-label="Case study impact">
                    {metrics.map((metric) => (
                        <div key={metric} className="case-metric" aria-label={metric}>
                            <span>{metric.split(' ')[0]}</span>
                            <small>{metric.split(' ').slice(1).join(' ') || 'impact'}</small>
                        </div>
                    ))}
                </section>

                <section className="case-grid">
                    <div className="case-panel">
                        <h2>Challenge</h2>
                        <p>{project.challenge}</p>
                    </div>
                    <div className="case-panel">
                        <h2>Approach</h2>
                        <p>{project.approach}</p>
                    </div>
                    <div className="case-panel">
                        <h2>Role</h2>
                        <p>{project.role}</p>
                    </div>
                    <div className="case-panel">
                        <h2>Next Iteration</h2>
                        <p>{project.differently}</p>
                    </div>
                </section>

                <div className="case-tags">
                    {project.tags.map((tag) => <span key={tag} className="art-tag">{tag}</span>)}
                </div>

                <section className="case-narrative">
                    <h2 className="case-section-heading">Why It Matters</h2>
                    <p>
                        {project.whyItMatters || 'This project shows a clear engineering problem, measurable impact, and pragmatic execution across product, cloud, data, and delivery constraints.'}
                    </p>
                </section>
            </article>
        </div>
    );
}
