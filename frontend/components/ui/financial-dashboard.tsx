import * as React from 'react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    ChevronRight,
    History,
    Library,
    Search,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TYPE DEFINITIONS ---
type QuickAction = {
    icon: React.ElementType;
    title: string;
    description: string;
    href?: string;
};

type Activity = {
    icon: React.ReactNode | React.ElementType;
    title: string;
    time: string;
    amount: number;
};

type Service = {
    icon: React.ElementType;
    title: string;
    description: string;
    isPremium?: boolean;
    hasAction?: boolean;
    href?: string;
};

type FinancialSummary = {
    totalIncome: number;
    totalExpenses: number;
    estimatedTaxes: number;
};

interface FinancialDashboardProps {
    quickActions: QuickAction[];
    recentActivity: Activity[];
    financialServices: Service[];
    summary: FinancialSummary;
}

// --- HELPER COMPONENTS ---
const IconWrapper = ({
    icon: Icon,
    className,
}: {
    icon: React.ElementType;
    className?: string;
}) => (
    <div
        className={cn(
            'p-2 rounded-full flex items-center justify-center',
            className
        )}
    >
        <Icon className="w-5 h-5" />
    </div>
);

// --- MAIN COMPONENT ---
export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
    quickActions,
    recentActivity,
    financialServices,
    summary,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = React.useState("");

    useGSAP(() => {
        const items = gsap.utils.toArray<HTMLElement>('.dashboard-item');
        const numberElements = gsap.utils.toArray<HTMLElement>('.scramble-num');

        // 1. Initial State (Hidden, Scaled Down, Tilted in 3D, Blurred)
        gsap.set(items, {
            autoAlpha: 0,
            scale: 0.8,
            rotationX: 45, // Tilted back
            z: -100,      // Pushed back in 3D space
            y: 50,
            filter: 'blur(10px)',
            transformPerspective: 1000,
            transformOrigin: "center center"
        });

        // 2. The "Furious" Entry Animation
        gsap.to(items, {
            duration: 1.2,
            autoAlpha: 1,
            scale: 1,
            rotationX: 0,
            z: 0,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out", // High initial velocity, heavy friction
            stagger: {
                grid: 'auto', // Use grid detection
                from: 'center', // Explode from center
                amount: 0.6,    // Total stagger time
            },
            clearProps: "all" // Clean up for cleaner DOM after
        });

        // 3. Number Scramble Animation
        numberElements.forEach((el) => {
            const finalValue = parseFloat(el.dataset.value || "0");
            const isCurrency = el.dataset.currency === "true";

            const obj = { value: 0 };

            gsap.to(obj, {
                value: finalValue,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    if (isCurrency) {
                        el.innerText = '$' + obj.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    } else {
                        el.innerText = Math.floor(obj.value).toString();
                    }
                },
                onComplete: () => {
                    // Ensure final formatted value with decimals if needed
                    if (isCurrency) {
                        el.innerText = '$' + finalValue.toLocaleString();
                    }
                }
            });
        });


        // 4. Typewriter Placeholder Animation
        const placeholder = document.getElementById('ai-placeholder');
        if (placeholder) {
            const prompts = [
                "Ask SideDuit: 'How much can I spend this weekend?'",
                "Ask SideDuit: 'Scan my Grab receipt'",
                "Ask SideDuit: 'What is my net worth?'",
                "Ask SideDuit: 'Show me my top expenses'"
            ];

            const masterTl = gsap.timeline({ repeat: -1 });

            prompts.forEach(text => {
                let typeTl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 1.5 });
                typeTl.to(placeholder, {
                    duration: text.length * 0.05,
                    text: { value: text, delimiter: "" },
                    ease: "none"
                });
                masterTl.add(typeTl);
            });
        }

    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="w-full max-w-7xl mx-auto font-sans perspective-1000" // Added perspective context
        >
            <div className="py-4 md:py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="dashboard-item p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Income</p>
                        <p className="text-xl font-bold text-green-600 mt-1 scramble-num" data-value={summary.totalIncome} data-currency="true">$0</p>
                    </div>
                    <div className="dashboard-item p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Expenses</p>
                        <p className="text-xl font-bold text-red-600 mt-1 scramble-num" data-value={summary.totalExpenses} data-currency="true">$0</p>
                    </div>
                    <div className="dashboard-item p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Taxes (Est.)</p>
                        <p className="text-xl font-bold text-blue-600 mt-1 scramble-num" data-value={summary.estimatedTaxes} data-currency="true">$0</p>
                    </div>
                </div>

                {/* AI Hero Input */}
                <div className="dashboard-item relative mb-8 flex justify-center z-20">
                    <div className="relative w-full max-w-2xl group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full opacity-25 blur-lg"></div>
                        <div className="relative flex items-center bg-white backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 h-16 px-6">
                            <div className="mr-4 p-2 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full animate-pulse shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-transparent border-none outline-none text-lg text-[#00001c] placeholder-transparent focus:ring-0 px-0 h-full font-medium tracking-wide"
                                id="ai-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            {/* Typewriter Placeholder Overlay */}
                            <div
                                className={cn(
                                    "absolute left-16 pl-4 pointer-events-none text-lg text-[#00001c]/50 font-light transition-opacity duration-200",
                                    inputValue ? "opacity-0" : "opacity-100"
                                )}
                                id="ai-placeholder"
                            >
                                Ask SideDuit: 'How much can I spend?'
                            </div>
                            <kbd className="hidden sm:inline-flex items-center justify-center h-8 px-3 text-xs font-mono text-[#00001c]/40 bg-black/5 rounded-full border border-black/10 ml-4">
                                ⌘ K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            onClick={() => action.href ? window.location.href = action.href : null}
                            className="dashboard-item group text-center p-3 rounded-xl cursor-pointer transition-colors hover:bg-muted"
                        >
                            <IconWrapper
                                icon={action.icon}
                                className="mx-auto mb-2 bg-muted group-hover:bg-background transition-colors"
                            />
                            <p className="text-sm font-medium">{action.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {action.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid for Desktop */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="dashboard-item mb-6 md:mb-0">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Recent activity</h2>
                        </div>
                        <ul className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        {React.isValidElement(activity.icon) ? (
                                            activity.icon
                                        ) : (
                                            <IconWrapper
                                                icon={activity.icon as React.ElementType}
                                                className="bg-muted text-muted-foreground"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            'text-sm font-mono p-1 px-2 rounded',
                                            activity.amount > 0
                                                ? 'text-green-600 dark:text-green-400 bg-green-500/10'
                                                : 'text-red-600 dark:text-red-400 bg-red-500/10'
                                        )}
                                    >
                                        {activity.amount > 0 ? '+' : '-'}$
                                        {Math.abs(activity.amount).toFixed(2)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Financial Services */}
                    <div className="dashboard-item">
                        <div className="flex items-center gap-2 mb-4">
                            <Library className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Financial services</h2>
                        </div>
                        <div className="space-y-2">
                            {financialServices.map((service, index) => (
                                <div
                                    key={index}
                                    onClick={() => service.href ? window.location.href = service.href : null}
                                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm hover:bg-muted"
                                >
                                    <div className="flex items-center gap-3">
                                        <IconWrapper
                                            icon={service.icon}
                                            className="bg-muted-foreground/10"
                                        />
                                        <div>
                                            <p className="font-medium text-sm flex items-center gap-2">
                                                {service.title}
                                                {service.isPremium && (
                                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                        Premium
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                    {service.hasAction && (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
