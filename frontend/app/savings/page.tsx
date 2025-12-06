"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    Target, 
    Plus, 
    Sparkles, 
    Car, 
    Home, 
    Plane, 
    GraduationCap,
    Gift,
    TrendingUp,
    Calendar,
    Coins,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Goal = {
    id: number;
    name: string;
    target: number;
    current: number;
    icon: React.ElementType;
    color: string;
    deadline: string;
};

const defaultGoals: Goal[] = [
    { id: 1, name: "Dream Car", target: 80000, current: 32000, icon: Car, color: "from-blue-500 to-cyan-500", deadline: "Dec 2025" },
    { id: 2, name: "House Down Payment", target: 50000, current: 15000, icon: Home, color: "from-purple-500 to-pink-500", deadline: "Jun 2026" },
    { id: 3, name: "Japan Vacation", target: 8000, current: 6500, icon: Plane, color: "from-orange-500 to-red-500", deadline: "Mar 2025" },
    { id: 4, name: "Education Fund", target: 30000, current: 12000, icon: GraduationCap, color: "from-green-500 to-emerald-500", deadline: "Sep 2027" },
];

const goalIcons = [
    { icon: Car, name: "Car" },
    { icon: Home, name: "Home" },
    { icon: Plane, name: "Travel" },
    { icon: GraduationCap, name: "Education" },
    { icon: Gift, name: "Gift" },
    { icon: Coins, name: "Emergency" },
];

export default function SavingsGoalsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [goals, setGoals] = useState<Goal[]>(defaultGoals);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: 0 });
    const [depositAmount, setDepositAmount] = useState<{ [key: number]: string }>({});

    useGSAP(() => {
        const header = '.savings-header';
        const cards = gsap.utils.toArray('.goal-card');
        const addButton = '.add-goal-btn';

        gsap.set(header, { autoAlpha: 0, y: -30 });
        gsap.set(cards, { 
            autoAlpha: 0, 
            scale: 0.9,
            y: 40,
            filter: 'blur(5px)'
        });
        gsap.set(addButton, { autoAlpha: 0, scale: 0.8 });

        gsap.to(header, { duration: 1, autoAlpha: 1, y: 0, ease: "expo.out" });
        
        gsap.to(cards, {
            delay: 0.3,
            duration: 0.8,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.5)",
            stagger: 0.1
        });

        gsap.to(addButton, {
            delay: 0.6,
            duration: 0.6,
            autoAlpha: 1,
            scale: 1,
            ease: "elastic.out(1, 0.5)"
        });

    }, { scope: containerRef, dependencies: [goals.length] });

    const handleDeposit = (goalId: number) => {
        const amount = parseFloat(depositAmount[goalId] || '0');
        if (amount > 0) {
            setGoals(prev => prev.map(g => 
                g.id === goalId 
                    ? { ...g, current: Math.min(g.current + amount, g.target) }
                    : g
            ));
            setDepositAmount(prev => ({ ...prev, [goalId]: '' }));
        }
    };

    const handleAddGoal = () => {
        if (newGoal.name && newGoal.target) {
            const IconComponent = goalIcons[newGoal.icon].icon;
            const colors = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-red-500",
                "from-green-500 to-emerald-500",
                "from-amber-500 to-yellow-500",
            ];
            setGoals(prev => [...prev, {
                id: Date.now(),
                name: newGoal.name,
                target: parseFloat(newGoal.target),
                current: 0,
                icon: IconComponent,
                color: colors[Math.floor(Math.random() * colors.length)],
                deadline: "Dec 2025"
            }]);
            setNewGoal({ name: '', target: '', icon: 0 });
            setShowAddModal(false);
        }
    };

    const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
    const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="savings-header mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-[#00001c] mb-2 flex items-center gap-3">
                                <Target className="w-10 h-10 text-[#00b14f]" />
                                Savings Goals
                            </h1>
                            <p className="text-muted-foreground">Track your progress towards financial milestones</p>
                        </div>
                        
                        {/* Overall Progress */}
                        <div className="bg-[#00001c] text-white p-4 rounded-2xl shadow-lg">
                            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Total Saved</p>
                            <p className="text-2xl font-bold text-[#00ff7f]">
                                RM {totalSaved.toLocaleString()} 
                                <span className="text-white/40 text-base ml-2">/ RM {totalTarget.toLocaleString()}</span>
                            </p>
                            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#00ff7f] rounded-full transition-all duration-500"
                                    style={{ width: `${(totalSaved / totalTarget) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const progress = (goal.current / goal.target) * 100;
                        const isComplete = progress >= 100;

                        return (
                            <div 
                                key={goal.id} 
                                className={cn(
                                    "goal-card bg-white rounded-2xl p-6 shadow-lg border transition-all hover:shadow-xl",
                                    isComplete && "border-[#00b14f] bg-[#00b14f]/5"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                            goal.color
                                        )}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#00001c] text-lg">{goal.name}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Target: {goal.deadline}
                                            </p>
                                        </div>
                                    </div>
                                    {isComplete && (
                                        <div className="bg-[#00b14f] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Complete!
                                        </div>
                                    )}
                                </div>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-[#00001c]">
                                            RM {goal.current.toLocaleString()}
                                        </span>
                                        <span className="text-muted-foreground">
                                            RM {goal.target.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                                                goal.color
                                            )}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 text-right">
                                        {progress.toFixed(1)}% complete
                                    </p>
                                </div>

                                {/* Deposit Input */}
                                {!isComplete && (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RM</span>
                                            <input
                                                type="number"
                                                value={depositAmount[goal.id] || ''}
                                                onChange={(e) => setDepositAmount(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                                placeholder="0"
                                                className="w-full bg-muted/50 border rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00b14f]"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDeposit(goal.id)}
                                            className="px-4 py-2 bg-[#00001c] text-white rounded-lg font-medium hover:bg-[#00001c]/80 transition-colors flex items-center gap-1"
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add New Goal Card */}
                    <div 
                        onClick={() => setShowAddModal(true)}
                        className="add-goal-btn goal-card border-2 border-dashed border-muted-foreground/30 rounded-2xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer group min-h-[200px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-lg">Create New Goal</p>
                        <p className="text-sm">Start saving for something special</p>
                    </div>
                </div>

                {/* Add Goal Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#00001c]">New Savings Goal</h2>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-[#00001c] mb-2 block">Goal Name</label>
                                    <input
                                        type="text"
                                        value={newGoal.name}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., New Laptop"
                                        className="w-full border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#00b14f]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[#00001c] mb-2 block">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#00b14f]">RM</span>
                                        <input
                                            type="number"
                                            value={newGoal.target}
                                            onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                                            placeholder="0"
                                            className="w-full border rounded-xl py-3 pl-14 pr-4 outline-none focus:ring-2 focus:ring-[#00b14f]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[#00001c] mb-2 block">Choose Icon</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {goalIcons.map((item, idx) => {
                                            const IconComp = item.icon;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setNewGoal(prev => ({ ...prev, icon: idx }))}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 transition-all",
                                                        newGoal.icon === idx 
                                                            ? "border-[#00b14f] bg-[#00b14f]/10" 
                                                            : "border-transparent bg-muted hover:bg-muted/80"
                                                    )}
                                                >
                                                    <IconComp className="w-5 h-5 mx-auto" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddGoal}
                                    disabled={!newGoal.name || !newGoal.target}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-lg transition-all mt-4",
                                        newGoal.name && newGoal.target
                                            ? "bg-[#00b14f] text-white hover:shadow-lg"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    Create Goal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

