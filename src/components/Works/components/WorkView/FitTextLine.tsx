import React, { useLayoutEffect, useRef } from 'react';

type FitTextLineProps = {
    className?: string;
    children: React.ReactNode;
};

const MIN_PX = 8;

/**
 * Одна строка текста: при нехватке ширины уменьшает font-size до MIN_PX.
 */
export const FitTextLine: React.FC<FitTextLineProps> = ({ className, children }) => {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const fit = () => {
            el.style.fontSize = '';
            el.style.textOverflow = '';
            if (!el.clientWidth) return;

            const maxPx = parseFloat(getComputedStyle(el).fontSize) || 14;
            let px = maxPx;
            el.style.fontSize = `${px}px`;

            while (el.scrollWidth > el.clientWidth && px > MIN_PX) {
                px -= 0.25;
                el.style.fontSize = `${px}px`;
            }

            if (el.scrollWidth > el.clientWidth) {
                el.style.textOverflow = 'ellipsis';
            }
        };

        fit();
        const id = requestAnimationFrame(fit);

        const ro = new ResizeObserver(fit);
        ro.observe(el);

        return () => {
            cancelAnimationFrame(id);
            ro.disconnect();
        };
    }, [children]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};
