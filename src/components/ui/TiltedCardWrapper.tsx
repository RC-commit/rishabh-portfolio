import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface TiltedCardWrapperProps {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
    scaleOnHover?: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    style?: React.CSSProperties;
    disabled?: boolean;
    isActive?: boolean;
    keyboardAction?: boolean;
}

export function TiltedCardWrapper({
    children,
    className = '',
    maxTilt = 4,
    scaleOnHover = 1.01,
    onClick,
    style = {},
    disabled = false,
    isActive = true,
    keyboardAction = true,
}: TiltedCardWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [supportsHover, setSupportsHover] = useState(() => (
        typeof window !== 'undefined'
        && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ));
    const reduceMotion = useReducedMotion() ?? false;

    const springValues = {
        damping: 28,
        stiffness: 180,
        mass: 1.1,
    };
    const rotateXValue = useMotionValue(0);
    const rotateYValue = useMotionValue(0);
    const rotateX = useSpring(rotateXValue, springValues);
    const rotateY = useSpring(rotateYValue, springValues);
    const scale = useSpring(isActive ? 1 : 0.92, springValues);

    const motionDisabled = disabled || reduceMotion || !supportsHover;
    const isClickable = Boolean(onClick) && !disabled;
    const isKeyboardAction = isClickable && keyboardAction;

    useEffect(() => {
        const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
        const updateHoverCapability = () => setSupportsHover(hoverQuery.matches);
        updateHoverCapability();
        hoverQuery.addEventListener('change', updateHoverCapability);
        return () => hoverQuery.removeEventListener('change', updateHoverCapability);
    }, []);

    useEffect(() => {
        const restingScale = isActive ? 1 : 0.92;
        const hoverScale = isActive ? scaleOnHover : scaleOnHover * 0.92;
        scale.set(isHovered && !motionDisabled ? hoverScale : restingScale);
    }, [isActive, isHovered, motionDisabled, scale, scaleOnHover]);

    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        const element = ref.current;
        if (!element || event.pointerType === 'touch') return;

        const rect = element.getBoundingClientRect();
        const offsetX = event.clientX - rect.left - rect.width / 2;
        const offsetY = event.clientY - rect.top - rect.height / 2;

        rotateXValue.set((offsetY / (rect.height / 2)) * -maxTilt);
        rotateYValue.set((offsetX / (rect.width / 2)) * maxTilt);

        const glareX = 50 + (offsetX / rect.width) * 100;
        const glareY = 50 + (offsetY / rect.height) * 100;
        element.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
        element.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
        element.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        element.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    }

    function handlePointerEnter(event: React.PointerEvent<HTMLDivElement>) {
        if (event.pointerType !== 'touch') setIsHovered(true);
    }

    function handlePointerLeave() {
        setIsHovered(false);
        rotateXValue.set(0);
        rotateYValue.set(0);

        const element = ref.current;
        if (!element) return;
        element.style.setProperty('--glare-x', '50%');
        element.style.setProperty('--glare-y', '50%');
        element.style.setProperty('--mouse-x', '-999px');
        element.style.setProperty('--mouse-y', '-999px');
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (!isKeyboardAction || event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
        }
    }

    if (motionDisabled) {
        return (
            <div
                ref={ref}
                className={className}
                role={isKeyboardAction ? 'button' : undefined}
                tabIndex={isKeyboardAction ? 0 : undefined}
                aria-pressed={isKeyboardAction ? isActive : undefined}
                onKeyDown={isKeyboardAction ? handleKeyDown : undefined}
                onClick={isClickable ? onClick : undefined}
                style={style}
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            className={`${className}${isHovered ? ' cp-liquid-active' : ''}`}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            role={isKeyboardAction ? 'button' : undefined}
            tabIndex={isKeyboardAction ? 0 : undefined}
            aria-pressed={isKeyboardAction ? isActive : undefined}
            onKeyDown={isKeyboardAction ? handleKeyDown : undefined}
            onClick={isClickable ? onClick : undefined}
            style={{
                ...style,
                transformPerspective: 1200,
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </motion.div>
    );
}
