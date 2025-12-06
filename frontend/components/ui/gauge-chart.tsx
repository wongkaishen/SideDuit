import React from 'react';

interface GaugeChartProps {
    value: number; // 0 to 100
    label?: string;
    size?: number;
    color?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
    value,
    label = "Score",
    size = 120,
    color = "#00ff7f" // Default green
}) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    // Calculate arc
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    // We want a semi-circle (180 degrees), so we only use half the circumference for the full gauge
    // actually, let's do a 180 degree gauge.
    // SVG stroke-dasharray logic: [dashLength, gapLength]

    // For a 180 degree gauge, the "full" line is half the circle.
    // But standard gauge usage often uses `stroke-dasharray` on a full circle and rotates it.
    // Let's keep it simple: transparent circle + filled circle with dashoffset.

    // Half circle circumference
    const halfCircumference = Math.PI * radius;

    // Amount to fill: (value / 100) * halfCircumference
    const fillAmount = (clampedValue / 100) * halfCircumference;

    // stroke-dasharray: [fillAmount, circumference] 
    // Wait, typical SVG gauge trick:
    // stroke-dasharray: [halfCircumference, halfCircumference] -> makes a 50% dashed line.
    // stroke-dashoffset: determines where it starts.

    const strokeDasharray = `${halfCircumference} ${halfCircumference}`;
    const strokeDashoffset = halfCircumference - fillAmount;

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <svg
                width={size}
                height={size / 2 + 10} // Half height + padding
                viewBox="0 0 100 60"
                className="overflow-visible"
            >
                {/* Background Track (Semi-Circle) */}
                <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke="#e5e7eb" // gray-200
                    strokeWidth="10"
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={halfCircumference}
                    strokeDashoffset={halfCircumference - fillAmount} // Animate this
                    className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-0 mt-2 text-center">
                <span className="text-3xl font-bold text-[#00001c]">{Math.round(clampedValue)}</span>
            </div>
            {label && <p className="text-sm font-medium text-muted-foreground mt-2">{label}</p>}
        </div>
    );
};
