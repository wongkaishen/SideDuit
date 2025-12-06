import React from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    color = "currentColor",
    width = 100,
    height = 30,
    className,
    strokeWidth = 2
}) => {
    // 1. Normalize Data
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid division by zero

    // 2. Generate Path Points
    const points = data.map((d, i) => {
        // x: spread evenly across width (using percentage for SVG viewBox)
        const x = (i / (data.length - 1)) * 100;
        // y: invert because SVG y grows downwards. Map value to 0-100 scale.
        const normalizedVal = (d - min) / range; // 0 to 1
        const y = 100 - (normalizedVal * 100);
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;

    return (
        <div className={className} style={{ width, height }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
            >
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke" // Keeps line thickness constant even if scaled
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};
