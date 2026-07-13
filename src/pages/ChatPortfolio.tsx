import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { PROFILE, CAREER, KEY_METRICS, PROJECTS, SKILLS } from '../data/resumeData';
import { OFFICIAL_CURRENT_TITLE } from '../data/publicProfile';
import { TESTIMONIALS } from '../data/testimonials';
import { useCloudAI, type ChatMessage } from '../lib/cloudAI';
import { isPortfolioUIAction } from '../lib/nlp/types';
import { setPageMetadata } from '../lib/seo';
import { getSkillIconUrl } from '../lib/skillIconUrl';
import { DottedGridBackground } from '../components/neural/DottedGridBackground';
import { VisionOSCursor } from '../components/ui/VisionOSCursor';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { EducationSection } from '../components/sections/EducationSection';
import { ContactSection } from '../components/sections/ContactSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { TiltedCardWrapper } from '../components/ui/TiltedCardWrapper';
import '../chat-portfolio.css';

const PortfolioAvatar = lazy(() =>
    import('../components/chat/PortfolioAvatar').then((m) => ({ default: m.PortfolioAvatar }))
);

const SkillGlobe = lazy(() =>
    import('../components/neural/SkillGlobe').then((m) => ({ default: m.SkillGlobe }))
);

// =========================================================
// Types
// =========================================================
interface MessageData {
    id: string;
    isAI: boolean;
    name: string;
    body: string;
    isMarkdown?: boolean;
    section?: SectionKey;
    experienceRoleIndex?: number;
}

type SectionKey = 'intro' | 'experience' | 'education' | 'projects' | 'stack' | 'testimonials' | 'contact';
const SECTION_KEYS: SectionKey[] = ['intro', 'experience', 'education', 'projects', 'stack', 'testimonials', 'contact'];
const USERS_IMPACTED = KEY_METRICS.find((metric) => metric.label === 'Users Impacted')?.value ?? '10M+';
const ENGINEERS_MENTORED = KEY_METRICS.find((metric) => metric.label === 'Engineers Mentored')?.value ?? '20+';

function isSectionKey(value: string): value is SectionKey {
    return SECTION_KEYS.includes(value as SectionKey);
}

// =========================================================
// Command Palette Items
// =========================================================
interface CmdItem {
    group: string;
    icon: string;
    label: string;
    hint: string;
    key?: string;
    action: () => void;
}



const LazyGenerativeParser = lazy(() =>
    import('../components/neural/GenerativeParser').then((module) => ({ default: module.GenerativeParser }))
);

const IntroSectionMessage = memo(function IntroSectionMessage() {
    const firstName = PROFILE.name.split(' ')[0].toUpperCase();
    const lastName = PROFILE.name.split(' ').slice(1).join(' ').toUpperCase();

    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const springValues = {
        damping: 30,
        stiffness: 100,
        mass: 2
    };

    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const scale = useSpring(1, springValues);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;

        const rotateAmplitude = 8; // gentle rotation
        const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
        const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

        rotateX.set(rotationX);
        rotateY.set(rotationY);

        // Update custom properties for spotlight glare
        const glareX = 50 + (offsetX / rect.width) * 100;
        const glareY = 50 + (offsetY / rect.height) * 100;

        ref.current.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
        ref.current.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);

        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        ref.current.style.setProperty('--mouse-x', `${localX}px`);
        ref.current.style.setProperty('--mouse-y', `${localY}px`);
    }

    function handleMouseEnter() {
        setIsHovered(true);
        scale.set(1.02);
    }

    function handleMouseLeave() {
        setIsHovered(false);
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);

        // Keep last cursor coordinates so the CSS opacity transition
        // can fade out the specular highlight smoothly (0.4s) before clearing.
        const el = ref.current;
        if (el) {
            el.style.setProperty('--glare-x', '50%');
            el.style.setProperty('--glare-y', '50%');

            setTimeout(() => {
                if (el.isConnected && !el.matches(':hover')) {
                    el.style.setProperty('--mouse-x', '-999px');
                    el.style.setProperty('--mouse-y', '-999px');
                }
            }, 400);
        }
    }

    return (
        <>
            <p className="cp-intro-text">Hey 👋 I&apos;m <strong>RC.AI</strong>, Rishabh&apos;s portfolio assistant. Ask me anything, or browse the sections in the sidebar.</p>
            <div style={{ perspective: '1000px', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <motion.div
                    ref={ref}
                    className={`cp-card-hero apple-glass apple-glass-interactive${isHovered ? ' cp-liquid-active' : ''}`}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        scale,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <div className="cp-hero-layout" style={{ transform: 'translateZ(0px)' }}>
                        <div className="cp-hero-avatar-wrap">
                            <div className="cp-hero-avatar-orbit">
                                <Suspense fallback={<div className="cp-avatar-skeleton" />}>
                                    <PortfolioAvatar />
                                </Suspense>
                            </div>
                        </div>
                        <div className="cp-hero-content-wrap">
                            <div className="cp-hero-name-block">
                                <h1 className="cp-hero-disp" aria-label={PROFILE.name}>
                                    <span className="cp-hero-first">{firstName}</span>
                                    <span className="cp-hero-last" id="cp-scramble-target">{lastName}</span>
                                </h1>
                                <div className="cp-hero-subs">
                                    <span className="cp-hero-sub">{OFFICIAL_CURRENT_TITLE}</span>
                                    <span className="cp-hero-sub">THANE, MH</span>
                                    <span className="cp-hero-sub">8+ Years Exp</span>
                                    <span className="cp-hero-sub">AI Systems Architect</span>
                                </div>
                                <div className="cp-hero-punchline">
                                    Leading engineering delivery across <strong>scalable backends</strong>, <strong>cloud-native systems</strong>, and <strong>applied AI</strong> with end-to-end product ownership.
                                </div>
                            </div>
                            <div className="cp-hero-stat-cards">
                                <TiltedCardWrapper className="cp-hero-stat-card" maxTilt={10} scaleOnHover={1.04}>
                                    <div className="cp-hsc-val">{USERS_IMPACTED}</div>
                                    <div className="cp-hsc-label">Users Impacted</div>
                                </TiltedCardWrapper>
                                <TiltedCardWrapper className="cp-hero-stat-card" maxTilt={10} scaleOnHover={1.04}>
                                    <div className="cp-hsc-val">↓61%</div>
                                    <div className="cp-hsc-label">Cloud Cost Cut</div>
                                </TiltedCardWrapper>
                                <TiltedCardWrapper className="cp-hero-stat-card" maxTilt={10} scaleOnHover={1.04}>
                                    <div className="cp-hsc-val">{ENGINEERS_MENTORED}</div>
                                    <div className="cp-hsc-label">Engineers Mentored</div>
                                </TiltedCardWrapper>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
});


// =========================================================
// AI Avatar SVG
// =========================================================
const AIAvatar = memo(function AIAvatar() {
    return (
        <div className="cp-mav ai" aria-hidden="true">
            R
        </div>
    );
});

// =========================================================
// Portfolio Data
// =========================================================

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// =========================================================
// Section Renderers — Return only anchors. Actual visual
// presentation is rendered through native React components.
// =========================================================

function renderExperience(): string {
    return '';
}

// Projects section now returns only empty string; actual carousel is rendered as React component
function renderProjects(): string {
    return '';
}

// =========================================================
// Project Carousel — React component replacing DOM-based coverflow
// =========================================================
const ProjectCarousel = memo(function ProjectCarousel({ intro }: { intro: string }) {
    const coverflowRef = useRef<HTMLDivElement>(null);
    const scrollTickRef = useRef<number | null>(null);
    const [activeIdx, setActiveIdx] = useState(0);

    const handleScroll = useCallback(() => {
        if (scrollTickRef.current !== null) return;

        scrollTickRef.current = requestAnimationFrame(() => {
            scrollTickRef.current = null;
            const el = coverflowRef.current;
            if (!el) return;
            const cards = el.querySelectorAll('.cp-card-proj');
            if (!cards.length) return;

            const containerRect = el.getBoundingClientRect();
            const center = containerRect.left + containerRect.width / 2;
            let closest = 0;
            let minDist = Infinity;

            cards.forEach((card, i) => {
                const r = card.getBoundingClientRect();
                const d = Math.abs(center - (r.left + r.width / 2));
                if (d < minDist) { minDist = d; closest = i; }
            });

            setActiveIdx(closest);
        });
    }, []);

    const handleNav = useCallback((dir: number) => {
        const el = coverflowRef.current;
        if (!el) return;
        const card = el.querySelector('.cp-card-proj') as HTMLElement | null;
        if (!card) return;
        const step = card.offsetWidth + 20;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    }, []);

    useEffect(() => () => {
        if (scrollTickRef.current !== null) {
            cancelAnimationFrame(scrollTickRef.current);
        }
    }, []);

    return (
        <div className="cp-projects-section">
            <div dangerouslySetInnerHTML={{ __html: intro }} />
            <div className="cp-projects-wrapper">
                <button className="cp-proj-nav cp-prev" aria-label="Previous" onClick={() => handleNav(-1)}>←</button>
                <div
                    className="cp-projects-coverflow"
                    ref={coverflowRef}
                    onScroll={handleScroll}
                >
                    {PROJECTS.map((p, i) => {
                        const validLinks = (p.links || []).filter((l) => l.href && l.href !== '#');
                        return (
                            <TiltedCardWrapper
                                key={p.title}
                                className={`cp-card-proj${i === activeIdx ? ' cp-active' : ''}`}
                                maxTilt={8}
                                scaleOnHover={1.02}
                                isActive={i === activeIdx}
                                keyboardAction={false}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
                                        return;
                                    }
                                    const el = coverflowRef.current;
                                    if (el) {
                                        const cardEl = e.currentTarget;
                                        const containerRect = el.getBoundingClientRect();
                                        const cardRect = cardEl.getBoundingClientRect();
                                        const targetScroll = el.scrollLeft + (cardRect.left - containerRect.left) - (containerRect.width - cardRect.width) / 2;
                                        el.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                    }
                                }}
                            >
                                <span className="cp-proj-num">PROJECT {String(i + 1).padStart(3, '0')}</span>
                                <div className="cp-proj-name">{p.title}</div>
                                <div className="cp-proj-desc">{p.description}</div>

                                {p.metrics && (
                                    <div className="cp-proj-metrics-bar">
                                        {Object.entries(p.metrics).map(([key, val]) => (
                                            <div key={key} className="cp-proj-metric-item">
                                                <span className="cp-proj-metric-val">{val}</span>
                                                <span className="cp-proj-metric-lbl">{key}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {p.role && (
                                    <div className="cp-proj-role-clean">
                                        <span className="cp-pdk">Role</span>
                                        <span className="cp-pdv">{p.role.split('.')[0]}.</span>
                                    </div>
                                )}

                                <div className="cp-proj-pills">
                                    {p.tags.map(t => <span key={t} className="cp-proj-pill">{t}</span>)}
                                </div>

                                <div className="cp-proj-links" style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Link to={`/case-studies/${p.slug}`} className="cp-proj-case-study-btn">
                                        Case Study ↗
                                    </Link>
                                    {validLinks.map(l => (
                                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="cp-proj-link">
                                            {l.label} ↗
                                        </a>
                                    ))}
                                </div>
                            </TiltedCardWrapper>
                        );
                    })}
                </div>
                <button className="cp-proj-nav cp-next" aria-label="Next" onClick={() => handleNav(1)}>→</button>
            </div>
        </div>
    );
});

interface SkillDomain {
    id: string;
    name: string;
    description: string;
    accent: 'cyan' | 'violet' | 'blue' | 'green' | 'amber' | 'rose';
    categories: string[];
}

const SKILL_DOMAINS: SkillDomain[] = [
    {
        id: 'leadership-architecture',
        name: 'Leadership & Architecture',
        description: 'Technical direction, system design, and scalable architecture',
        accent: 'cyan',
        categories: ['Leadership', 'Architecture'],
    },
    {
        id: 'applied-ai',
        name: 'Applied AI',
        description: 'LLM applications, multi-agent systems, and tool-using AI',
        accent: 'violet',
        categories: ['AI'],
    },
    {
        id: 'backend-engineering',
        name: 'Backend Engineering',
        description: 'Languages, frameworks, APIs, authentication, and realtime delivery',
        accent: 'blue',
        categories: ['Languages', 'Frameworks', 'API', 'Auth', 'Realtime'],
    },
    {
        id: 'cloud-delivery',
        name: 'Cloud & Delivery',
        description: 'Cloud platforms, containers, infrastructure, and CI/CD',
        accent: 'green',
        categories: ['Cloud', 'DevOps'],
    },
    {
        id: 'data-messaging',
        name: 'Data & Messaging',
        description: 'Storage, caching, search, and event-driven systems',
        accent: 'amber',
        categories: ['Databases', 'Events', 'Search'],
    },
    {
        id: 'reliability-tooling',
        name: 'Reliability & Tooling',
        description: 'Observability, performance engineering, and delivery tools',
        accent: 'rose',
        categories: ['Monitoring', 'Performance', 'Tools'],
    },
];

interface SkillStackSectionProps {
    intro: string;
    onShowCompleteStack: (target: Element) => unknown;
}

const SkillStackSection = memo(function SkillStackSection({ intro, onShowCompleteStack }: SkillStackSectionProps) {
    const completeStackRef = useRef<HTMLElement>(null);
    const scrollToCompleteStack = () => {
        if (completeStackRef.current) onShowCompleteStack(completeStackRef.current);
    };
    const skillsByDomain = SKILL_DOMAINS
        .map((domain) => ({
            ...domain,
            skills: SKILLS.filter((skill) => domain.categories.includes(skill.category)),
        }))
        .filter((group) => group.skills.length > 0);

    return (
        <div className="cp-skill-stack-container">
            <div className="cp-stack-intro-row">
                <div className="cp-stack-intro-copy" dangerouslySetInnerHTML={{ __html: intro }} />
                <button
                    type="button"
                    className="cp-stack-scroll-cue"
                    aria-label="View complete skill list"
                    aria-controls="complete-stack-title"
                    title="View complete skill list"
                    onClick={scrollToCompleteStack}
                >
                    <span aria-hidden="true">↓</span>
                </button>
            </div>
            <div className="cp-skill-planet-wrapper">
                <Suspense fallback={<div className="cp-skill-globe-container cp-centered-fallback">Loading 3D Stack...</div>}>
                    <SkillGlobe />
                </Suspense>
            </div>
            <section ref={completeStackRef} className="cp-stack-directory" aria-labelledby="complete-stack-title">
                <div className="cp-stack-directory-heading">
                    <div>
                        <h3 id="complete-stack-title">Complete stack</h3>
                        <p>{SKILLS.length} skills across {skillsByDomain.length} capability areas</p>
                    </div>
                    <span className="cp-stack-total" aria-label={`${SKILLS.length} total skills`}>{SKILLS.length}</span>
                </div>

                <div className="cp-stack-groups">
                    {skillsByDomain.map(({ id, name, description, accent, skills }) => (
                        <section className={`cp-stack-group cp-stack-group--${accent}`} key={id} aria-labelledby={`stack-domain-${id}`}>
                            <div className="cp-stack-group-heading">
                                <div>
                                    <h4 id={`stack-domain-${id}`}>{name}</h4>
                                    <p>{description}</p>
                                </div>
                                <span aria-label={`${skills.length} skills`}>{skills.length}</span>
                            </div>
                            <div className="cp-stack-skills">
                                {skills.map((skill) => (
                                    <span
                                        className={`cp-stack-skill${skill.featured ? ' is-core' : ''}`}
                                        key={skill.name}
                                        aria-label={`${skill.name}${skill.featured ? ', core strength' : ''}`}
                                    >
                                        {skill.iconPath ? (
                                            <img
                                                src={getSkillIconUrl(skill.iconPath) ?? undefined}
                                                alt=""
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="cp-stack-skill-dot" aria-hidden="true" />
                                        )}
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </section>
        </div>
    );
});

function renderStack(): string {
    return `<div class="cp-skill-planet-placeholder"></div>`;
}

function renderTestimonials(): string {
    return '';
}

function renderContact(): string {
    return '';
}

function renderEducation(): string {
    return '';
}

// =========================================================
// Section Configuration
// =========================================================
const SECTIONS: Record<SectionKey, { label: string; intro: string; render: () => string }> = {
    intro: {
        label: 'About',
        intro: `<p>Hey 👋 I'm <strong>RC.AI</strong> — Rishabh's portfolio assistant. Ask me anything, or browse the sections in the sidebar.</p>`,
        render: () => '',
    },
    experience: {
        label: 'Experience',
        intro: `<p>Here's Rishabh's work experience — click any role to expand it.</p>`,
        render: renderExperience,
    },
    education: {
        label: 'Education',
        intro: `<p>Rishabh's academic background.</p>`,
        render: renderEducation,
    },
    projects: {
        label: 'Projects',
        intro: `<p>${PROJECTS.length} projects with full case studies — problem, approach, impact, and honest reflection.</p>`,
        render: renderProjects,
    },
    stack: {
        label: 'Tech Stack',
        intro: `<p>${SKILLS.length} skills anchored in architecture, backend systems, cloud delivery, reliability, and applied AI.</p>`,
        render: renderStack,
    },
    testimonials: {
        label: 'Reviews',
        intro: `<p>What clients, managers, teammates, and mentors say about working with Rishabh.</p>`,
        render: renderTestimonials,
    },
    contact: {
        label: 'Contact',
        intro: `<p>Ready to work together? Reach out directly.</p>`,
        render: renderContact,
    },
};

// =========================================================
// Nav Configuration
// =========================================================
const NAV_ITEMS: { key: SectionKey; icon: string; label: string; badge: string }[] = [
    { key: 'intro', icon: '◉', label: 'About', badge: 'Home' },
    { key: 'experience', icon: '◈', label: 'Experience', badge: `${CAREER.length} roles` },
    { key: 'education', icon: '◫', label: 'Education', badge: 'B.E.' },
    { key: 'projects', icon: '◇', label: 'Projects', badge: String(PROJECTS.length) },
    { key: 'stack', icon: '⬡', label: 'Tech Stack', badge: String(SKILLS.length) },
    { key: 'testimonials', icon: '◎', label: 'Reviews', badge: String(TESTIMONIALS.length) },
    { key: 'contact', icon: '✦', label: 'Contact', badge: '' },
];

const PLACEHOLDER_TEXTS = [
    'What is your core tech stack?',
    'Tell me about your experience…',
    'What projects have you built?',
    'How do you integrate AI in your workflow?',
    'Are you open to remote work?',
    'Tell me about your leadership style…',
    'What makes you stand out?',
];

const QUICK_ACTION_QUESTIONS = {
    biggestWin: 'What was Rishabh\'s 61% cloud-cost reduction achievement at Blackstraw?',
    currentWork: 'What is Rishabh currently responsible for at Blackstraw, and what AI systems is he focused on now?',
    availability: 'Is Rishabh currently available for Senior or Lead engineering roles? Please answer directly and share his public contact options.',
} as const;

function useRotatingPlaceholder(texts: string[], intervalMs = 4200) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (texts.length < 2) return;

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let interval: number | undefined;
        const syncRotation = () => {
            if (interval) window.clearInterval(interval);
            interval = undefined;
            if (!motionQuery.matches) {
                interval = window.setInterval(() => {
                    setIndex((current) => (current + 1) % texts.length);
                }, intervalMs);
            }
        };

        syncRotation();
        motionQuery.addEventListener('change', syncRotation);
        return () => {
            if (interval) window.clearInterval(interval);
            motionQuery.removeEventListener('change', syncRotation);
        };
    }, [texts, intervalMs]);

    return texts[index % Math.max(texts.length, 1)] ?? '';
}

// =========================================================
// Main Component
// =========================================================
export default function ChatPortfolio() {
    const { generateResponse } = useCloudAI();

    const [messages, setMessages] = useState<MessageData[]>(() => [{
        id: `msg-intro-${Date.now()}`,
        isAI: true,
        name: 'RC.AI',
        body: '',
        section: 'intro',
    }]);
    const [typingVisible, setTypingVisible] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [currentSection, setCurrentSection] = useState<SectionKey>('intro');
    const [loadedSections, setLoadedSections] = useState<Set<SectionKey>>(() => new Set(['intro']));
    const inputReady = !isPending;
    const [inputValue, setInputValue] = useState('');
    const rotatingPlaceholder = useRotatingPlaceholder(PLACEHOLDER_TEXTS);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [cmdQuery, setCmdQuery] = useState('');
    const feedRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pendingRef = useRef(false);
    const scrollRafRef = useRef<number | null>(null);
    const navigationScrollRafRef = useRef<number | null>(null);
    const navigationScrollTimerRef = useRef<number | null>(null);
    const focusScrollTimerRefs = useRef<number[]>([]);
    const nestedScrollPriorityUntilRef = useRef(0);
    const suppressAutoScrollUntilRef = useRef(0);
    const userHasScrolledUpRef = useRef(false);
    const navigationSequenceRef = useRef(0);
    const hasHandledInitialRouteRef = useRef(false);

    const isNavigatingRef = useRef<boolean>(false);
    const navTimeoutRef = useRef<number | null>(null);

    const cmdInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setPageMetadata({
            title: 'Rishabh Chaturvedi | Lead Engineer & Applied AI Systems',
            description: 'Portfolio of Rishabh Chaturvedi, a lead engineer specializing in scalable backends, cloud platforms, search performance, and tool-grounded applied AI systems.',
            canonicalPath: '/',
        });
    }, []);


    // Scroll feed to bottom (smooth when forced on new message, auto/conditional during streaming)
    const scrollToBottom = useCallback((force = false) => {
        if (!force && Date.now() < suppressAutoScrollUntilRef.current) return;
        if (scrollRafRef.current !== null) return;

        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;
            const feed = feedRef.current;
            if (feed) {
                // If forced (new query), scroll down smoothly.
                // Otherwise, only auto-scroll if the user is already at the bottom and hasn't scrolled up.
                const isAtBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight <= 100;
                if (force || (isAtBottom && !userHasScrolledUpRef.current)) {
                    feed.scrollTo({
                        top: feed.scrollHeight,
                        behavior: force ? 'smooth' : 'auto'
                    });
                }
            }
        });
    }, []);

    const animateFeedScroll = useCallback((feed: HTMLDivElement, targetTop: number, duration = 700) => {
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = null;
        }
        if (navigationScrollRafRef.current !== null) {
            cancelAnimationFrame(navigationScrollRafRef.current);
            navigationScrollRafRef.current = null;
        }
        if (navigationScrollTimerRef.current !== null) {
            window.clearTimeout(navigationScrollTimerRef.current);
            navigationScrollTimerRef.current = null;
        }

        const maxTop = Math.max(0, feed.scrollHeight - feed.clientHeight);
        const boundedTarget = Math.min(maxTop, Math.max(0, targetTop));
        const startTop = feed.scrollTop;
        feed.scrollTo({ top: startTop, behavior: 'auto' });

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(boundedTarget - startTop) < 2) {
            feed.scrollTop = boundedTarget;
            return;
        }

        const startedAt = performance.now();
        const step = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            feed.scrollTop = startTop + ((boundedTarget - startTop) * eased);
            if (progress < 1) {
                navigationScrollRafRef.current = requestAnimationFrame(step);
            } else {
                navigationScrollRafRef.current = null;
                if (navigationScrollTimerRef.current !== null) {
                    window.clearTimeout(navigationScrollTimerRef.current);
                    navigationScrollTimerRef.current = null;
                }
            }
        };
        navigationScrollRafRef.current = requestAnimationFrame(step);
        navigationScrollTimerRef.current = window.setTimeout(() => {
            if (navigationScrollRafRef.current !== null) {
                cancelAnimationFrame(navigationScrollRafRef.current);
                navigationScrollRafRef.current = null;
            }
            feed.scrollTop = boundedTarget;
            navigationScrollTimerRef.current = null;
        }, duration + 120);
    }, []);

    const cancelFocusScrollRetries = useCallback(() => {
        focusScrollTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
        focusScrollTimerRefs.current = [];
    }, []);

    useEffect(() => () => {
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
        }
        if (navigationScrollRafRef.current !== null) {
            cancelAnimationFrame(navigationScrollRafRef.current);
        }
        if (navigationScrollTimerRef.current !== null) {
            window.clearTimeout(navigationScrollTimerRef.current);
        }
        if (navTimeoutRef.current !== null) {
            window.clearTimeout(navTimeoutRef.current);
        }
        cancelFocusScrollRetries();
    }, [cancelFocusScrollRetries]);

    const scrollElementIntoFeed = useCallback((target: Element, offset = 18) => {
        const feed = feedRef.current;
        if (!feed) return false;

        cancelFocusScrollRetries();

        const feedRect = feed.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const nextTop = feed.scrollTop + targetRect.top - feedRect.top - offset;

        isNavigatingRef.current = true;
        if (navTimeoutRef.current !== null) {
            window.clearTimeout(navTimeoutRef.current);
        }
        navTimeoutRef.current = window.setTimeout(() => {
            isNavigatingRef.current = false;
        }, 1000);

        animateFeedScroll(feed, nextTop);
        return true;
    }, [animateFeedScroll, cancelFocusScrollRetries]);

    const scrollNestedElementIntoFeed = useCallback((target: Element) => {
        nestedScrollPriorityUntilRef.current = Date.now() + 1500;
        return scrollElementIntoFeed(target);
    }, [scrollElementIntoFeed]);

    const addAIMessage = useCallback((body: string, isMarkdown = false, section?: SectionKey, experienceRoleIndex?: number): string => {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setMessages(prev => [...prev, {
            id: messageId,
            isAI: true,
            name: 'RC.AI',
            body,
            isMarkdown,
            section,
            experienceRoleIndex,
        }]);
        scrollToBottom();
        return messageId;
    }, [scrollToBottom]);

    // Add user message
    const addUserMessage = useCallback((text: string) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const safeBody = `<p>${escapeHtml(text).replaceAll('\n', '<br />')}</p>`;
        setMessages(prev => [...prev, { id, isAI: false, name: 'You', body: safeBody }]);
        scrollToBottom();
    }, [scrollToBottom]);

    const focusSection = useCallback((section: SectionKey) => {
        if (Date.now() < nestedScrollPriorityUntilRef.current) return;
        cancelFocusScrollRetries();
        let completed = false;
        const attemptScroll = () => {
            if (completed) return true;
            if (Date.now() < nestedScrollPriorityUntilRef.current) {
                completed = true;
                cancelFocusScrollRetries();
                return true;
            }
            if (section === 'intro' && feedRef.current) {
                isNavigatingRef.current = true;
                if (navTimeoutRef.current !== null) {
                    window.clearTimeout(navTimeoutRef.current);
                }
                navTimeoutRef.current = window.setTimeout(() => {
                    isNavigatingRef.current = false;
                }, 1000);
                animateFeedScroll(feedRef.current, 0);
                completed = true;
                return true;
            }

            const anchor = document.getElementById(`anchor-${section}`);
            if (!anchor) return false;
            completed = scrollElementIntoFeed(anchor);
            return completed;
        };

        focusScrollTimerRefs.current = [100, 240, 420].map((delay) => (
            window.setTimeout(attemptScroll, delay)
        ));
    }, [animateFeedScroll, cancelFocusScrollRetries, scrollElementIntoFeed]);

    const openSection = useCallback(async (section: SectionKey, shouldFocus = true) => {
        setCurrentSection(section);
        setMobileMenuOpen(false);

        if (section === 'intro') {
            window.history.replaceState(null, '', window.location.pathname);
        } else {
            window.history.replaceState(null, '', `#${section}`);
        }

        if (loadedSections.has(section)) {
            if (shouldFocus) focusSection(section);
            return;
        }

        const sec = SECTIONS[section];
        setLoadedSections(prev => new Set([...prev, section]));
        if (section === 'intro') {
            addAIMessage('', false, 'intro');
        } else {
            const body = sec.intro + sec.render();
            addAIMessage(body, false, section);
        }
        if (shouldFocus) focusSection(section);
    }, [loadedSections, addAIMessage, focusSection]);

    // Navigate to section
    const navigateTo = useCallback(async (section: SectionKey) => {
        if (pendingRef.current) return;
        const navigationId = ++navigationSequenceRef.current;

        pendingRef.current = true;
        try {
            await openSection(section);
        } finally {
            pendingRef.current = false;
        }
        return navigationId;
    }, [openSection]);

    const executeUIAction = useCallback((detail: unknown) => {
        if (!isPortfolioUIAction(detail)) return;

        const { action, value } = detail;
        if (action === 'focus_section') {
            if (isSectionKey(value)) navigateTo(value);
            return;
        }

        if (action === 'highlight_project') {
            const projectIndex = PROJECTS.findIndex((project) => project.title === value);
            if (projectIndex === -1) return;

            const highlightProject = (container: ParentNode) => {
                const projCards = container.querySelectorAll('.cp-card-proj');
                const card = projCards[projectIndex] as HTMLElement | undefined;
                if (!card) return;

                const coverflow = card.closest('.cp-projects-coverflow') as HTMLElement | null;
                if (coverflow) {
                    const targetLeft = card.offsetLeft - ((coverflow.clientWidth - card.clientWidth) / 2);
                    coverflow.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
                }
                scrollElementIntoFeed(card, 64);
                card.classList.add('ai-highlight');
                window.setTimeout(() => card.classList.remove('ai-highlight'), 2000);
            };

            const msgContainers = Array.from(document.querySelectorAll('.cp-mrow'));
            const latestProjMsg = [...msgContainers].reverse().find((message) => message.querySelector('.cp-card-proj'));
            if (latestProjMsg) {
                highlightProject(latestProjMsg);
                return;
            }

            navigateTo('projects').then((navigationId) => {
                window.setTimeout(() => {
                    if (navigationId === undefined || navigationSequenceRef.current !== navigationId) return;
                    const updatedMessages = Array.from(document.querySelectorAll('.cp-mrow'));
                    const projectMessage = [...updatedMessages].reverse().find((message) => message.querySelector('.cp-card-proj'));
                    highlightProject(projectMessage || document);
                }, 300);
            });
            return;
        }

        const idx = Number.parseInt(value, 10);
        if (!Number.isInteger(idx) || idx < 0 || idx >= CAREER.length) return;

        const expandExperienceCard = (container: ParentNode) => {
            const target = container.querySelector<HTMLButtonElement>(`.cp-exp-header[data-career-index="${idx}"]`);
            if (target && target.getAttribute('aria-expanded') !== 'true') {
                target.click();
            }
            const card = target?.closest('.cp-card-exp') as HTMLElement | null;
            if (!card) return;

            scrollElementIntoFeed(card, 72);
            card.classList.add('ai-highlight');
            window.setTimeout(() => card.classList.remove('ai-highlight'), 2000);
        };

        const navigationId = ++navigationSequenceRef.current;
        setCurrentSection('experience');
        setMobileMenuOpen(false);
        window.history.replaceState(null, '', '#experience');
        const experienceMessageId = addAIMessage('', false, 'experience', idx);
        window.setTimeout(() => {
            if (navigationSequenceRef.current !== navigationId) return;
            const experienceMessage = document.querySelector(`[data-message-id="${experienceMessageId}"]`);
            expandExperienceCard(experienceMessage || document);
        }, 360);
    }, [addAIMessage, navigateTo, scrollElementIntoFeed]);

    // Handle chat question
    const askQuestion = useCallback(async (question: string) => {
        if (!inputReady || pendingRef.current || !question.trim()) return;
        pendingRef.current = true;
        setIsPending(true);

        const text = question.trim();
        setInputValue('');

        const rawBodyStripper = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
        const conversation: ChatMessage[] = messages
            .filter((message) => !message.section && message.body.trim())
            .map((message) => ({
                role: message.isAI ? 'assistant' : 'user',
                content: message.isMarkdown ? message.body : rawBodyStripper(message.body),
            }));
        conversation.push({ role: 'user', content: text });

        addUserMessage(text);
        userHasScrolledUpRef.current = false;
        scrollToBottom(true);
        setTypingVisible(true);
        window.dispatchEvent(new CustomEvent('avatar-ai-state', { detail: { state: 'thinking' } }));
        let action: Awaited<ReturnType<typeof generateResponse>>['uiAction'];
        try {
            const result = await generateResponse(conversation);
            action = result.uiAction;
            suppressAutoScrollUntilRef.current = action ? Date.now() + 1600 : 0;
            addAIMessage(result.body, true);
            window.dispatchEvent(new CustomEvent('avatar-ai-state', { detail: { state: 'success' } }));
        } catch {
            addAIMessage(`I couldn't reach the portfolio assistant just now. Please try again in a moment.`, true);
            window.dispatchEvent(new CustomEvent('avatar-ai-state', { detail: { state: 'idle' } }));
        } finally {
            setTypingVisible(false);
            pendingRef.current = false;
            setIsPending(false);
        }

        if (action) {
            executeUIAction(action);
            window.dispatchEvent(new CustomEvent('ai-ui-action', { detail: action }));
        }
    }, [inputReady, messages, addUserMessage, addAIMessage, generateResponse, scrollToBottom, executeUIAction]);

    // Scroll listener to update active sidebar section based on viewport visibility
    useEffect(() => {
        const feed = feedRef.current;
        if (!feed) return;

        let scrollTimeout: number | null = null;

        const handleScroll = () => {
            // Check if the user has manually scrolled up
            const isAtBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight <= 100;
            if (!isAtBottom) {
                userHasScrolledUpRef.current = true;
            } else {
                userHasScrolledUpRef.current = false;
            }

            if (isNavigatingRef.current) return;

            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }

            scrollTimeout = window.requestAnimationFrame(() => {
                if (isNavigatingRef.current) return;

                const feedRect = feed.getBoundingClientRect();
                const activationLine = feedRect.top + Math.min(180, feedRect.height * 0.32);
                const visibleSections = SECTION_KEYS
                    .map((key) => {
                        const anchor = document.getElementById(`anchor-${key}`);
                        if (!anchor) return null;
                        return { key, rect: anchor.getBoundingClientRect() };
                    })
                    .filter((item): item is { key: SectionKey; rect: DOMRect } => item !== null)
                    .sort((a, b) => a.rect.top - b.rect.top);

                if (visibleSections.length === 0) return;

                const current = isAtBottom
                    ? visibleSections[visibleSections.length - 1].key
                    : visibleSections.reduce((active, item) => {
                        if (item.rect.top <= activationLine) return item.key;
                        return active;
                    }, visibleSections[0].key);

                if (isNavigatingRef.current) return;

                setCurrentSection(current);
            });
        };

        feed.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            feed.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
        };
    }, [messages]);

    // A real page load starts fresh; in-app route changes keep this component mounted.
    useEffect(() => {
        if (hasHandledInitialRouteRef.current) return;
        hasHandledInitialRouteRef.current = true;

        if (window.location.pathname === '/' && window.location.hash) {
            window.history.replaceState(null, '', '/');
        }

        window.setTimeout(() => feedRef.current?.scrollTo({ top: 0 }), 100);
    }, []);

    // Command palette keyboard shortcut
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(o => !o);
                setCmdQuery('');
            }
            if (e.key === 'Escape' && cmdOpen) setCmdOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [cmdOpen, navigateTo]);

    // Focus cmd input when opened
    useEffect(() => {
        if (cmdOpen) setTimeout(() => cmdInputRef.current?.focus(), 50);
    }, [cmdOpen]);

    // Command palette items
    const cmdItems: CmdItem[] = [
        { group: 'Navigate', icon: '◉', label: 'About', hint: 'Overview and stats', key: '1', action: () => navigateTo('intro') },
        { group: 'Navigate', icon: '◈', label: 'Experience', hint: '3 companies, 7 yrs', key: '2', action: () => navigateTo('experience') },
        { group: 'Navigate', icon: '◫', label: 'Education', hint: 'Computer Science', key: '3', action: () => navigateTo('education') },
        { group: 'Navigate', icon: '◇', label: 'Projects', hint: `${PROJECTS.length} case studies`, key: '4', action: () => navigateTo('projects') },
        { group: 'Navigate', icon: '⬡', label: 'Stack', hint: `${SKILLS.length} skills`, key: '5', action: () => navigateTo('stack') },
        { group: 'Navigate', icon: '◎', label: 'Reviews', hint: 'Testimonials', key: '6', action: () => navigateTo('testimonials') },
        { group: 'Navigate', icon: '✦', label: 'Contact', hint: 'Hire Rishabh', key: '7', action: () => navigateTo('contact') },
        { group: 'Ask', icon: '01', label: 'Biggest win', hint: 'Impact story', action: () => askQuestion(QUICK_ACTION_QUESTIONS.biggestWin) },
        { group: 'Ask', icon: '02', label: 'Tech stack', hint: 'Languages and tools', action: () => askQuestion('What is your tech stack?') },
        { group: 'Ask', icon: '03', label: 'Available?', hint: 'Hire status', action: () => askQuestion(QUICK_ACTION_QUESTIONS.availability) },
    ];

    const filteredCmdItems = cmdItems.filter(c => {
        const q = cmdQuery.toLowerCase();
        return !q || c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q) || c.group.toLowerCase().includes(q);
    });

    const cmdGroups = [...new Set(filteredCmdItems.map(c => c.group))];



    // Card tilt is now handled by TiltedCardWrapper component on each card.

    // Reveal animation for new messages
    useEffect(() => {
        const rows = document.querySelectorAll('.cp-mrow:not(.show)');
        rows.forEach((row, i) => {
            setTimeout(() => row.classList.add('show'), i * 80);
        });
        scrollToBottom();
    }, [messages, typingVisible, scrollToBottom]);

    // Handle send
    const handleSend = () => {
        if (inputReady && inputValue.trim()) {
            askQuestion(inputValue.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-portfolio" ref={containerRef}>
            <DottedGridBackground />
            <VisionOSCursor />

            {/* ── COMMAND PALETTE ── */}
            {cmdOpen && (
                <div
                    className="cp-cmd-overlay open"
                    onClick={e => { if (e.target === e.currentTarget) setCmdOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Command palette"
                >
                    <div className="cp-cmd-box">
                        <div className="cp-cmd-search">
                            <span className="cp-cmd-search-icon" aria-hidden="true">⌘</span>
                            <input
                                ref={cmdInputRef}
                                className="cp-cmd-input"
                                placeholder="Type a command or search…"
                                value={cmdQuery}
                                onChange={e => setCmdQuery(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') setCmdOpen(false);
                                    if (e.key === 'Enter') {
                                        const first = filteredCmdItems[0];
                                        if (first && !(isPending && first.group === 'Ask')) { first.action(); setCmdOpen(false); }
                                    }
                                }}
                            />
                        </div>
                        <div className="cp-cmd-results">
                            {cmdGroups.map(g => (
                                <div key={g}>
                                    <div className="cp-cmd-group">{g}</div>
                                    {filteredCmdItems.filter(c => c.group === g).map(item => (
                                        <button
                                            key={item.label}
                                            className="cp-cmd-item"
                                            onClick={() => { item.action(); setCmdOpen(false); }}
                                            disabled={isPending && item.group === 'Ask'}
                                            type="button"
                                        >
                                            <span className="cp-cmd-item-icon" aria-hidden="true">{item.icon}</span>
                                            <span className="cp-cmd-item-label">{item.label}</span>
                                            <span className="cp-cmd-item-hint">{item.hint}</span>
                                            {item.key && <span className="cp-cmd-item-key">{item.key}</span>}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="cp-app">
                {/* ── SIDEBAR ── */}
                {mobileMenuOpen && <div className="cp-mobile-overlay" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
                <aside id="portfolio-sidebar" className={`cp-sidebar${mobileMenuOpen ? ' mobile-open' : ''}`} aria-label="Portfolio navigation">
                    <div className="cp-sb-logo">
                        <div className="cp-sb-logo-mark">R</div>
                        <div className="cp-sb-logo-copy">
                            <div className="cp-sb-logo-name">{PROFILE.name}</div>
                            <div className="cp-sb-logo-role">{OFFICIAL_CURRENT_TITLE}</div>
                        </div>
                    </div>



                    <div className="cp-sb-section-label">Portfolio</div>
                    <nav className="cp-sb-nav">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.key}
                                className={`cp-sb-nav-item${currentSection === item.key ? ' active' : ''}`}
                                onClick={() => navigateTo(item.key)}
                                type="button"
                            >
                                <span className="cp-sb-nav-icon">{item.icon}</span>
                                <span className="cp-sb-nav-label">{item.label}</span>
                                {item.badge && <span className="cp-sb-nav-badge">{item.badge}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="cp-sb-divider" />
                    <div className="cp-sb-section-label">Quick Actions</div>
                    <div className="cp-sb-actions">
                        <button className="cp-sb-action-btn" onClick={() => askQuestion(QUICK_ACTION_QUESTIONS.biggestWin)} disabled={isPending} type="button">
                            Biggest win
                        </button>
                        <button className="cp-sb-action-btn" onClick={() => askQuestion(QUICK_ACTION_QUESTIONS.currentWork)} disabled={isPending} style={{ marginTop: 6 }} type="button">
                            Current work
                        </button>
                        <button className="cp-sb-action-btn gold" onClick={() => askQuestion(QUICK_ACTION_QUESTIONS.availability)} disabled={isPending} style={{ marginTop: 6 }} type="button">
                            Available for hire?
                        </button>
                    </div>



                    <div className="cp-sb-spacer" />

                    <div className="cp-sb-status">
                        <div className="cp-sb-location-row">
                            <div className="cp-sb-location-pin" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <span className="cp-sb-location-city">{PROFILE.location}</span>
                            <span className="cp-sb-location-badge">
                                <span className="cp-sb-pulse-dot" />
                                Open to work
                            </span>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CHAT PANEL ── */}
                <main className="cp-main" role="main">
                    <div className="cp-topbar apple-glass">
                        <div className="cp-tb-left">
                            <button
                                className="cp-mobile-menu"
                                type="button"
                                aria-label="Open portfolio navigation"
                                aria-expanded={mobileMenuOpen}
                                aria-controls="portfolio-sidebar"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="4" y1="7" x2="20" y2="7" />
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <line x1="4" y1="17" x2="20" y2="17" />
                                </svg>
                            </button>
                        </div>
                        <div className="cp-tb-right cp-tb-actions">
                            <button className="cp-tb-btn" onClick={() => setCmdOpen(true)} title="Search ⌘K" aria-label="Command palette">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </button>
                            <a href={PROFILE.resumeUrl} target="_blank" rel="noopener noreferrer" className="cp-tb-resume-btn">
                                Resume
                            </a>
                            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="cp-tb-btn" title="LinkedIn" aria-label="LinkedIn">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="cp-tb-btn" title="GitHub" aria-label="GitHub">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            </a>
                        </div>
                    </div>

                    {/* Thinking Bar */}
                    <div className={`cp-thinking-bar${typingVisible ? ' on' : ''}`} />

                    {/* Message Feed */}
                    <div className="cp-feed" ref={feedRef} role="log" aria-live="polite" aria-busy={isPending} aria-label="Portfolio content">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`cp-mrow ${msg.isAI ? 'ai-row' : 'user-row'}${msg.section === 'intro' ? ' cp-mrow--intro' : ''}${msg.section && msg.section !== 'intro' ? ' cp-mrow--structured' : ''}`}
                                role="article"
                                data-message-id={msg.id}
                                data-section={msg.section}
                            >
                                <div className="cp-minner">
                                    {msg.isAI ? (
                                        <AIAvatar />
                                    ) : (
                                        <div className="cp-mav user" aria-hidden="true">Y</div>
                                    )}
                                    <div className="cp-mcontent">
                                        {msg.section && !(msg.section === 'experience' && msg.experienceRoleIndex !== undefined) && (
                                            <div id={`anchor-${msg.section}`} className="cp-section-anchor" />
                                        )}
                                        {!msg.isAI && <div className="cp-mname user">{msg.name}</div>}
                                        <div className="cp-mbody">
                                        {msg.section === 'intro' ? (
                                                <IntroSectionMessage />
                                            ) : msg.section === 'projects' ? (
                                                <ProjectCarousel intro={msg.body.split('<div id="anchor-projects"')[0]} />
                                            ) : msg.section === 'stack' ? (
                                                <SkillStackSection
                                                    intro={msg.body.split('<div class="cp-skill-planet-placeholder">')[0]}
                                                    onShowCompleteStack={scrollNestedElementIntoFeed}
                                                />
                                            ) : msg.section === 'experience' ? (
                                                <div>
                                                    {msg.experienceRoleIndex === undefined && (
                                                        <div dangerouslySetInnerHTML={{ __html: msg.body.split('<div id="anchor-')[0] }} />
                                                    )}
                                                    <ExperienceSection
                                                        idPrefix={msg.id}
                                                        roleIndex={msg.experienceRoleIndex}
                                                    />
                                                </div>
                                            ) : msg.section === 'education' ? (
                                                <div>
                                                    <div dangerouslySetInnerHTML={{ __html: msg.body.split('<div id="anchor-')[0] }} />
                                                    <EducationSection idPrefix={msg.id} />
                                                </div>
                                            ) : msg.section === 'contact' ? (
                                                <div>
                                                    <div dangerouslySetInnerHTML={{ __html: msg.body.split('<div id="anchor-')[0] }} />
                                                    <ContactSection />
                                                </div>
                                            ) : msg.section === 'testimonials' ? (
                                                <div>
                                                    <div dangerouslySetInnerHTML={{ __html: msg.body.split('<div id="anchor-')[0] }} />
                                                    <TestimonialsSection />
                                                </div>
                                            ) : msg.isMarkdown ? (
                                                <Suspense fallback={<div className="cp-markdown"><div className="mb">{msg.body}</div></div>}>
                                                    <LazyGenerativeParser content={msg.body} />
                                                </Suspense>
                                            ) : <div dangerouslySetInnerHTML={{ __html: msg.body }} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingVisible && (
                            <div className="cp-mrow ai-row show" role="status" aria-label="RC.AI is checking portfolio data">
                                <div className="cp-minner">
                                    <AIAvatar />
                                    <div className="cp-mcontent">
                                        <div className="cp-mbody">
                                            <div className="cp-typing-wrap">
                                                <div className="cp-tdot" />
                                                <div className="cp-tdot" />
                                                <div className="cp-tdot" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Input Bar */}
                    <div className="cp-input-area">
                        <div className={`cp-input-box${inputReady ? ' glow' : ''}`}>
                            <textarea
                                ref={inputRef}
                                className="cp-chat-input"
                                placeholder={isPending ? 'Checking portfolio data…' : (rotatingPlaceholder || 'Ask about Rishabh…')}
                                rows={1}
                                aria-label="Chat message input"
                                disabled={!inputReady}
                                maxLength={2000}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onInput={e => {
                                    const ta = e.target as HTMLTextAreaElement;
                                    ta.style.height = 'auto';
                                    ta.style.height = ta.scrollHeight + 'px';
                                }}
                            />
                            <div className="cp-input-actions">
                                <span
                                    className="cp-provider-note"
                                    role="note"
                                    aria-label="Messages may be processed by Groq. Do not share sensitive information."
                                    title="Messages may be processed by Groq. Do not share sensitive information."
                                >
                                    ⓘ
                                </span>
                                <button
                                    className={`cp-send-btn${inputReady && inputValue.trim() ? ' ready' : ''}`}
                                    aria-label="Send message"
                                    onClick={handleSend}
                                    disabled={!inputReady || !inputValue.trim()}
                                    type="button"
                                >
                                    ↑
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
