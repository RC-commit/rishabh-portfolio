import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function InternalNavigation() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (
                event.defaultPrevented
                || event.button !== 0
                || event.metaKey
                || event.ctrlKey
                || event.shiftKey
                || event.altKey
            ) return;

            const target = event.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest<HTMLAnchorElement>('a[href]');
            if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#')) return;

            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;

            if (
                url.pathname === window.location.pathname
                && url.search === window.location.search
                && url.hash
            ) return;

            event.preventDefault();
            navigate(`${url.pathname}${url.search}${url.hash}`);
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [navigate]);

    return null;
}
