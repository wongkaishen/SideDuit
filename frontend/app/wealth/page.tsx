"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    Crown, 
    TrendingUp, 
    Shield, 
    BarChart3, 
    ArrowUpRight, 
    Star,
    Sparkles,
    ChevronRight,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const portfolioOptions = [
    { 
        name: "Conservative", 
        risk: "Low Risk", 
        returns: "4-6%", 
        description: "Bonds, Fixed deposits, Blue-chip stocks",
        allocation: { stocks: 20, bonds: 60, cash: 20 },
        color: "from-blue-500 to-cyan-500"
    },
    { 
        name: "Balanced", 
        risk: "Medium Risk", 
        returns: "8-12%", 
        description: "Mix of growth and income assets",
        allocation: { stocks: 50, bonds: 35, cash: 15 },
        color: "from-purple-500 to-pink-500",
        recommended: true
    },
    { 
        name: "Aggressive", 
        risk: "High Risk", 
        returns: "15-25%", 
        description: "Growth stocks, Tech, Emerging markets",
        allocation: { stocks: 80, bonds: 10, cash: 10 },
        color: "from-orange-500 to-red-500"
    },
];

const advisors = [
    { name: "Sarah Chen", specialty: "Retirement Planning", rating: 4.9, clients: 234 },
    { name: "Michael Tan", specialty: "Tax Optimization", rating: 4.8, clients: 189 },
    { name: "Priya Kumar", specialty: "Growth Investing", rating: 4.9, clients: 312 },
];

export default function WealthManagementPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
    const [investmentAmount, setInvestmentAmount] = useState<string>('');

    useGSAP(() => {
        const header = '.wealth-header';
        const cards = gsap.utils.toArray('.portfolio-card');
        const advisorItems = gsap.utils.toArray('.advisor-item');
        const premiumBadge = '.premium-badge';

        gsap.set(header, { autoAlpha: 0, y: -30 });
        gsap.set(premiumBadge, { autoAlpha: 0, scale: 0.8 });
        gsap.set(cards, { 
            autoAlpha: 0, 
            y: 60, 
            rotationX: 15,
            filter: 'blur(8px)',
            transformPerspective: 1000 
        });
        gsap.set(advisorItems, { autoAlpha: 0, x: -30 });

        // Header entry
        gsap.to(header, { duration: 1, autoAlpha: 1, y: 0, ease: "expo.out" });
        
        // Premium badge bounce
        gsap.to(premiumBadge, { 
            delay: 0.3, 
            duration: 0.8, 
            autoAlpha: 1, 
            scale: 1, 
            ease: "elastic.out(1, 0.5)" 
        });

        // Portfolio cards stagger
        gsap.to(cards, {
            delay: 0.4,
            duration: 1,
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.15
        });

        // Advisors stagger
        gsap.to(advisorItems, {
            delay: 0.8,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            ease: "back.out(1.5)",
            stagger: 0.1
        });

    }, { scope: containerRef });

    const handleStartInvesting = () => {
        if (selectedPortfolio !== null && investmentAmount) {
            alert(`Starting investment of RM ${investmentAmount} in ${portfolioOptions[selectedPortfolio].name} portfolio!`);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="wealth-header text-center mb-12">
                    <div className="premium-badge inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-lg">
                        <Crown className="w-4 h-4" />
                        Premium Feature
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#00001c] mb-3">
                        Wealth Management
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Professional investment portfolios and personalized advisory services to grow your wealth.
                    </p>
                </div>

                {/* Portfolio Options */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-[#00001c] mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#00b14f]" />
                        Choose Your Portfolio Strategy
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {portfolioOptions.map((portfolio, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedPortfolio(idx)}
                                className={cn(
                                    "portfolio-card relative bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl",
                                    selectedPortfolio === idx 
                                        ? "border-[#00b14f] shadow-[0_0_20px_rgba(0,177,79,0.2)]" 
                                        : "border-transparent"
                                )}
                            >
                                {portfolio.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00b14f] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Recommended
                                    </div>
                                )}
                                
                                <div className={cn(
                                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                                    portfolio.color
                                )}>
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-[#00001c] mb-1">{portfolio.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{portfolio.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-medium text-muted-foreground">{portfolio.risk}</span>
                                    <span className="text-lg font-bold text-[#00b14f]">{portfolio.returns}</span>
                                </div>

                                {/* Allocation Bar */}
                                <div className="space-y-2">
                                    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-500 transition-all" 
                                            style={{ width: `${portfolio.allocation.stocks}%` }}
                                        />
                                        <div 
                                            className="bg-purple-500 transition-all" 
                                            style={{ width: `${portfolio.allocation.bonds}%` }}
                                        />
                                        <div 
                                            className="bg-gray-300 transition-all" 
                                            style={{ width: `${portfolio.allocation.cash}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Stocks {portfolio.allocation.stocks}%</span>
                                        <span>Bonds {portfolio.allocation.bonds}%</span>
                                        <span>Cash {portfolio.allocation.cash}%</span>
                                    </div>
                                </div>

                                {selectedPortfolio === idx && (
                                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#00b14f] rounded-full flex items-center justify-center">
                                        <Shield className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Investment Input */}
                <div className="bg-[#00001c] rounded-3xl p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff7f] opacity-5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 max-w-md mx-auto text-center">
                        <h3 className="text-white text-xl font-bold mb-2">Start Your Investment</h3>
                        <p className="text-white/60 text-sm mb-6">Minimum investment: RM 1,000</p>
                        
                        <div className="relative mb-6">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#00ff7f]">RM</span>
                            <input
                                type="number"
                                value={investmentAmount}
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-16 pr-4 text-3xl font-bold text-white placeholder-white/30 outline-none focus:border-[#00ff7f] transition-colors text-center"
                            />
                        </div>

                        <div className="flex gap-2 justify-center mb-6">
                            {[1000, 5000, 10000].map(amt => (
                                <button 
                                    key={amt}
                                    onClick={() => setInvestmentAmount(amt.toString())}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    RM {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleStartInvesting}
                            disabled={selectedPortfolio === null || !investmentAmount}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                                selectedPortfolio !== null && investmentAmount
                                    ? "bg-[#00ff7f] text-[#00001c] hover:shadow-[0_0_30px_rgba(0,255,127,0.4)] transform hover:scale-[1.02]"
                                    : "bg-white/10 text-white/40 cursor-not-allowed"
                            )}
                        >
                            <Lock className="w-5 h-5" />
                            Start Investing
                            <ArrowUpRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Advisors */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h2 className="text-xl font-bold text-[#00001c] mb-6 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Meet Our Advisors
                    </h2>
                    <div className="space-y-4">
                        {advisors.map((advisor, idx) => (
                            <div 
                                key={idx} 
                                className="advisor-item flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {advisor.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#00001c]">{advisor.name}</p>
                                        <p className="text-sm text-muted-foreground">{advisor.specialty}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold">{advisor.rating}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{advisor.clients} clients</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-[#00b14f] transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

