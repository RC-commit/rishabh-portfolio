import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROFILE, PROJECTS } from '../../data/resumeData';
import { PUBLIC_PHONE_URL, PUBLIC_RESUME_URL } from '../../data/publicProfile';

interface GenerativeParserProps {
    content: string;
}

const UI_ACTION_REGEX = /<ui_action\s+action="([^"]+)"\s+value="([^"]+)"\s*\/?\s*>/g;

const ALLOWED_PUBLIC_LINKS = new Set([
    PROFILE.website,
    PROFILE.github,
    PROFILE.linkedin,
    PUBLIC_RESUME_URL,
    PUBLIC_PHONE_URL,
    `mailto:${PROFILE.email}`,
    ...PROJECTS.map((project) => `/case-studies/${project.slug}`),
]);

function isAllowedPublicLink(href?: string) {
    if (!href) return false;
    return ALLOWED_PUBLIC_LINKS.has(href);
}

function transformPublicLink(href: string) {
    return isAllowedPublicLink(href) ? href : '';
}

export function GenerativeParser({ content }: GenerativeParserProps) {
    if (!content) return null;

    const displayContent = content.replace(UI_ACTION_REGEX, '').trim();
    return (
        <div className="cp-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={transformPublicLink}
                components={{
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    p: ({ node, ...rest }) => <p className="mb" style={{ marginTop: '0.5em', marginBottom: '0.5em' }} {...rest} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ul: ({ node, ...rest }) => <ul style={{ paddingLeft: '1.2em', marginBottom: '1em' }} {...rest} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    li: ({ node, ...rest }) => <li style={{ marginBottom: '0.25em' }} {...rest} />,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    a: ({ node, href, children, ...rest }) => isAllowedPublicLink(href)
                        ? <a href={href} style={{ color: 'var(--lg-accent, var(--cp-accent))' }} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined} {...rest}>{children}</a>
                        : <span>{children}</span>,
                    img: () => null,
                }}
            >
                {displayContent}
            </ReactMarkdown>
        </div>
    );
}
