import * as React from 'react';
import { useRef, useState } from 'react';
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
import { openChatbot } from '@/lib/chatbot-utils';
import { GaugeChart } from './gauge-chart';
import { Typewriter } from './typewriter';

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
    gigHealthScore?: number;
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
    const [inputValue, setInputValue] = useState("");

    // Gig Health Score Logic - Use real value from summary prop
    const healthScore = summary.gigHealthScore || 0;
    let gaugeColor = "#00ff7f"; // Green
    if (healthScore < 50) gaugeColor = "#ef4444"; // Red
    else if (healthScore < 80) gaugeColor = "#f97316"; // Orange
    
    // Handle chat open - use global chatbot
    const handleOpenChat = () => {
        openChatbot(inputValue);
        setInputValue(''); // Clear input after opening chat
    };
    
    // Handle Enter key press in input
    const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleOpenChat();
        }
    };

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
                        el.innerText = 'RM ' + obj.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    } else {
                        el.innerText = Math.floor(obj.value).toString();
                    }
                },
                onComplete: () => {
                    // Ensure final formatted value
                    if (isCurrency) {
                        el.innerText = 'RM ' + finalValue.toLocaleString();
                    } else {
                        el.innerText = Math.floor(finalValue).toString();
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
                {/* Header Section: Greeting & AI Badge */}
                <div className="flex flex-col items-center justify-center mb-8 text-center animate-in fade-in slide-in-from-top-10 duration-700">
                    <div className="text-3xl md:text-5xl font-bold text-[#00001c] mb-3 flex flex-wrap justify-center items-center gap-2">
                        <span>We help you</span>
                        <Typewriter
                            text={[
                                "track your daily earnings",
                                "estimate your tax payments",
                                "understand your true profits"
                            ]}
                            speed={70}
                            className="text-[#00b14f]"
                            waitTime={1500}
                            deleteSpeed={40}
                            cursorChar={"_"}
                        />
                    </div>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#00ff7f]/10 border border-[#00ff7f]/20">
                        <Sparkles className="w-3 h-3 text-[#00b14f] mr-2" />
                        <span className="text-xs font-bold text-[#00b14f] tracking-widest uppercase">AI Powered</span>
                    </div>
                </div>

                {/* AI Hero Input - Centered & Focused */}
                <div className="dashboard-item relative mb-12 flex justify-center z-20">
                    <div className="relative w-full max-w-2xl group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full opacity-25 blur-lg"></div>
                        <div className="relative flex items-center bg-white backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all duration-500 h-16 px-6">
                            <button 
                                onClick={handleOpenChat}
                                className="mr-4 p-2 bg-gradient-to-br from-yellow-400 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer relative group"
                                title="Open AI Chat"
                            >
                                <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300 -z-10"></div>
                                {/* Tooltip */}
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#00001c] text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                    Click to chat with AI
                                </span>
                            </button>
                            <input
                                type="text"
                                className="w-full bg-transparent border-none outline-none text-lg text-[#00001c] placeholder-transparent focus:ring-0 px-0 h-full font-medium tracking-wide"
                                id="ai-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleInputKeyPress}
                            />
                            {/* Typewriter Placeholder Overlay */}
                            <div
                                className={cn(
                                    "absolute left-16 pl-4 pointer-events-none text-lg text-[#00001c]/50 font-light transition-opacity duration-200",
                                    inputValue ? "opacity-0" : "opacity-100"
                                )}
                                id="ai-placeholder"
                            >
                                What financial insight do you need today?
                            </div>
                            <kbd className="hidden sm:inline-flex items-center justify-center h-8 px-3 text-xs font-mono text-[#00001c]/40 bg-black/5 rounded-full border border-black/10 ml-4">
                                Enter
                            </kbd>
                        </div>  
                    </div>
                </div>

                {/* Core Metrics & Gig Health Score */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    {/* Income */}
                    <div className="dashboard-item lg:col-span-1 p-6 rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col justify-between relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 rounded-full">
                                <Sparkles className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-xl font-bold text-[#00001c] uppercase tracking-wider">Income</span>
                        </div>
                        <p className="text-5xl md:text-6xl font-bold text-[#00001c] mt-2 tracking-tight scramble-num" data-value={summary.totalIncome} data-currency="true">RM 0</p>
                    </div>

                    {/* Expenses */}
                    <div className="dashboard-item lg:col-span-1 p-6 rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col justify-between relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-100 rounded-full">
                                <History className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-xl font-bold text-[#00001c] uppercase tracking-wider">Expenses</span>
                        </div>
                        <p className="text-5xl md:text-6xl font-bold text-[#00001c] mt-2 tracking-tight scramble-num" data-value={summary.totalExpenses} data-currency="true">RM 0</p>
                    </div>

                    {/* Taxes */}
                    <div className="dashboard-item lg:col-span-1 p-6 rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col justify-between relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Library className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-xl font-bold text-[#00001c] uppercase tracking-wider">Est. Tax</span>
                        </div>
                        <p className="text-5xl md:text-6xl font-bold text-[#00001c] mt-2 tracking-tight scramble-num" data-value={summary.estimatedTaxes} data-currency="true">RM 0</p>
                    </div>

                    {/* Gig Health Score (New) */}
                    <div className="dashboard-item lg:col-span-1 p-6 rounded-3xl bg-[#00001c] text-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                        <div
                            className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"
                            style={{ backgroundColor: gaugeColor }}
                        ></div>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">Gig Health Score</h3>
                        
                        {/* Score Number */}
                        <div className="relative mb-3 flex items-baseline justify-center">
                            <span 
                                className="text-5xl md:text-6xl font-bold tracking-tight scramble-num" 
                                data-value={healthScore}
                                data-currency="false"
                                style={{ color: gaugeColor }}
                            >
                                0
                            </span>
                            <span className="text-3xl font-bold text-white/50 ml-1">/100</span>
                        </div>
                        
                        <GaugeChart value={healthScore} color={gaugeColor} size={140} label="Profitability" />
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
                                className="mx-auto mb-2 bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors text-foreground/80"
                            />
                            <p className="text-sm font-bold text-[#00001c]">{action.title}</p>
                            <p className="text-xs text-muted-foreground/80 font-medium">
                                {action.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid for Desktop */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="dashboard-item mb-6 md:mb-0 bg-white rounded-3xl p-6 shadow-xl border border-gray-100/50 h-full">
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
                                        {activity.amount > 0 ? '+' : '-'}RM
                                        {Math.abs(activity.amount).toFixed(2)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Financial Services */}
                    <div className="dashboard-item bg-white rounded-3xl p-6 shadow-xl border border-gray-100/50 h-full">
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
