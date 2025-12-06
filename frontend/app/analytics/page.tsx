"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    DollarSign,
    Activity,
    Bike,
    ShoppingBag,
    Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';
import { Sparkline } from '@/components/ui/sparkline';

export default function AnalyticsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState("July");

    // Mock Data for Months
    const months = ["May", "June", "July"];
    const monthlyStats: Record<string, { income: any[], expenses: any[], totalIncome: number, totalExpense: number, netProfit: number, incomeTrend: number[], expenseTrend: number[], taxProgress: number }> = {
        "May": {
            income: [
                { name: "Grab Earnings", icon: Bike, amount: 2100.00, color: "bg-[#00b14f]", width: "75%" },
                { name: "Foodpanda", icon: ShoppingBag, amount: 980.50, color: "bg-[#d70f64]", width: "50%" },
                { name: "Lalamove", icon: Truck, amount: 650.00, color: "bg-[#ff6200]", width: "35%" },
                { name: "Freelance Design", icon: Activity, amount: 300.00, color: "bg-blue-500", width: "20%" },
            ],
            expenses: [
                { category: "Vehicle Maint.", amount: 150.00, percentage: 20, color: "bg-red-500" },
                { category: "Petrol/Fuel", amount: 380.00, percentage: 40, color: "bg-orange-500" },
                { category: "Food & Dining", amount: 600.00, percentage: 60, color: "bg-yellow-500" },
                { category: "Subscriptions", amount: 120.00, percentage: 15, color: "bg-purple-500" },
            ],
            totalIncome: 4030.50,
            totalExpense: 1250.00,
            netProfit: 2780.50,
            incomeTrend: [150, 230, 210, 320, 290, 400, 380],
            expenseTrend: [100, 80, 120, 90, 150, 130, 110],
            taxProgress: 35
        },
        "June": {
            income: [
                { name: "Grab Earnings", icon: Bike, amount: 2600.00, color: "bg-[#00b14f]", width: "90%" },
                { name: "Foodpanda", icon: ShoppingBag, amount: 1100.00, color: "bg-[#d70f64]", width: "55%" },
                { name: "Lalamove", icon: Truck, amount: 750.00, color: "bg-[#ff6200]", width: "40%" },
                { name: "Freelance Design", icon: Activity, amount: 0.00, color: "bg-blue-500", width: "0%" },
            ],
            expenses: [
                { category: "Vehicle Maint.", amount: 0.00, percentage: 0, color: "bg-red-500" },
                { category: "Petrol/Fuel", amount: 450.00, percentage: 50, color: "bg-orange-500" },
                { category: "Food & Dining", amount: 700.00, percentage: 70, color: "bg-yellow-500" },
                { category: "Subscriptions", amount: 120.00, percentage: 15, color: "bg-purple-500" },
            ],
            totalIncome: 4450.00,
            totalExpense: 1270.00,
            netProfit: 3180.00,
            incomeTrend: [300, 350, 320, 400, 420, 450, 500],
            expenseTrend: [120, 110, 130, 140, 120, 150, 160],
            taxProgress: 40
        },
        "July": {
            income: [
                { name: "Grab Earnings", icon: Bike, amount: 2450.50, color: "bg-[#00b14f]", width: "85%" },
                { name: "Foodpanda", icon: ShoppingBag, amount: 1240.00, color: "bg-[#d70f64]", width: "60%" },
                { name: "Lalamove", icon: Truck, amount: 820.20, color: "bg-[#ff6200]", width: "45%" },
                { name: "Freelance Design", icon: Activity, amount: 450.00, color: "bg-blue-500", width: "30%" },
            ],
            expenses: [
                { category: "Vehicle Maint.", amount: 350.00, percentage: 35, color: "bg-red-500" },
                { category: "Petrol/Fuel", amount: 420.00, percentage: 45, color: "bg-orange-500" },
                { category: "Food & Dining", amount: 650.00, percentage: 65, color: "bg-yellow-500" },
                { category: "Subscriptions", amount: 120.00, percentage: 15, color: "bg-purple-500" },
            ],
            totalIncome: 4960.70,
            totalExpense: 1540.00,
            netProfit: 3420.70,
            incomeTrend: [400, 380, 450, 420, 480, 520, 600],
            expenseTrend: [200, 180, 220, 250, 230, 280, 300],
            taxProgress: 45
        }
    };

    const currentData = monthlyStats[selectedMonth];

    useGSAP(() => {
        // Selectors
        const header = '.analytics-header';
        const summaryCards = '.summary-card'; // New
        const incomeCard = '.income-card';
        const expenseCard = '.expense-card';
        const incomeBars = gsap.utils.toArray<HTMLElement>('.income-bar');
        const expenseDonuts = gsap.utils.toArray<HTMLElement>('.expense-item');
        const numbers = gsap.utils.toArray<HTMLElement>('.scramble-val');
        const taxBar = '.tax-progress-bar'; // New

        // 1. Initial State (Hidden & Twisted)
        gsap.set(header, { autoAlpha: 0, y: -50 });
        gsap.set(summaryCards, { autoAlpha: 0, y: 30, scale: 0.95 });
        gsap.set([incomeCard, expenseCard], {
            autoAlpha: 0,
            y: 100,
            rotationX: 20,
            z: -100,
            filter: 'blur(10px)',
            transformPerspective: 1000
        });
        gsap.set(incomeBars, { width: 0 });
        gsap.set(expenseDonuts, { autoAlpha: 0, x: 20 });
        gsap.set(taxBar, { width: 0 });

        // 2. Header Entry
        gsap.to(header, {
            duration: 1,
            autoAlpha: 1,
            y: 0,
            ease: "expo.out"
        });

        // 3. Summary Cards Entry
        gsap.to(summaryCards, {
            delay: 0.3,
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            ease: "back.out(1.5)"
        });

        // 4. Tax Bar Fill
        gsap.to(taxBar, {
            delay: 0.6,
            duration: 1.5,
            width: (i, target) => target.dataset.width,
            ease: "power2.out"
        });

        // 5. Cards Explosion
        gsap.to([incomeCard, expenseCard], {
            delay: 0.5, // Delayed slightly more
            duration: 1.4,
            autoAlpha: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.2
        });

        // 6. Bar Chart Animation
        gsap.to(incomeBars, {
            delay: 1.0,
            duration: 1.5,
            width: (i, target) => target.dataset.width,
            ease: "power4.out",
            stagger: 0.1
        });

        // 7. Expense Items Stagger
        gsap.to(expenseDonuts, {
            delay: 1.2,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            ease: "back.out(2)",
            stagger: 0.1
        });

        // 8. Number Scramble
        numbers.forEach(el => {
            const raw = el.dataset.value;
            if (!raw) return;
            const endVal = parseFloat(raw);
            const obj = { val: 0 };

            gsap.to(obj, {
                val: endVal,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    el.innerText = 'RM ' + obj.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            });
        });

    }, { scope: containerRef });

    // Re-trigger animations on Month Change
    useGSAP(() => {
        const numbers = gsap.utils.toArray<HTMLElement>('.scramble-val');
        const incomeBars = gsap.utils.toArray<HTMLElement>('.income-bar');
        const taxBar = document.querySelector('.tax-progress-bar');

        // Animate Bars to new width
        gsap.to(incomeBars, {
            width: (i, target) => target.dataset.width,
            duration: 1,
            ease: "elastic.out(1, 0.7)"
        });

        // Animate Tax Bar
        if (taxBar) {
            gsap.to(taxBar, {
                width: `${currentData.taxProgress}%`,
                duration: 1.2,
                ease: "power2.inOut"
            });
        }

        // Re-scramble Numbers
        numbers.forEach(el => scrambleNumber(el));

    }, { scope: containerRef, dependencies: [selectedMonth] });

    const scrambleNumber = (el: HTMLElement) => {
        const raw = el.dataset.value;
        if (!raw) return;
        const endVal = parseFloat(raw);
        const obj = { val: 0 };

        gsap.to(obj, {
            val: endVal,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                el.innerText = 'RM ' + obj.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-6xl mx-auto">
                {/* Header with Month Selector */}
                <div className="analytics-header mb-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#00001c] mb-2">Financial Analytics</h1>
                        <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                            <Activity className="w-4 h-4 text-[#00ff7f]" />
                            Deep dive into your gig economy performance
                        </p>
                    </div>

                    {/* Month Selector */}
                    <div className="bg-white rounded-full p-1 shadow-md border flex items-center">
                        {months.map((m) => (
                            <button
                                key={m}
                                onClick={() => setSelectedMonth(m)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                    selectedMonth === m
                                        ? "bg-[#00001c] text-white shadow-lg scale-105"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* VISUAL METRICS SUMMARY (NEW) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Income Summary */}
                    <div className="summary-card bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Income</p>
                                <p className="text-2xl font-bold text-[#00001c] mt-1 scramble-val" data-value={currentData.totalIncome}>RM 0.00</p>
                            </div>
                            <div className="bg-[#00ff7f]/10 p-2 rounded-full">
                                <TrendingUp className="w-4 h-4 text-[#00b14f]" />
                            </div>
                        </div>
                        {/* Sparkline */}
                        <div className="mt-4 h-12 w-full">
                            <Sparkline data={currentData.incomeTrend} color="#00b14f" height={40} strokeWidth={3} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Last 7 Days Trend</p>
                    </div>

                    {/* Expense Summary */}
                    <div className="summary-card bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Expenses</p>
                                <p className="text-2xl font-bold text-[#00001c] mt-1 scramble-val" data-value={currentData.totalExpense}>RM 0.00</p>
                            </div>
                            <div className="bg-red-500/10 p-2 rounded-full">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            </div>
                        </div>
                        {/* Sparkline */}
                        <div className="mt-4 h-12 w-full">
                            <Sparkline data={currentData.expenseTrend} color="#ef4444" height={40} strokeWidth={3} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Last 7 Days Trend</p>
                    </div>

                    {/* Tax Progress Summary */}
                    <div className="summary-card bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tax Liability</p>
                                <h3 className="text-lg font-bold text-[#00001c] mt-1">Status: Active</h3>
                            </div>
                            <div className="bg-amber-500/10 p-2 rounded-full">
                                <DollarSign className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-2">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-amber-600">Tax threshold reached</span>
                                <span className="text-amber-600">{currentData.taxProgress}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="tax-progress-bar h-full bg-amber-500 rounded-full relative"
                                    data-width={`${currentData.taxProgress}%`}
                                    style={{ width: 0 }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">Estimated set aside: RM {(currentData.totalIncome * 0.15).toFixed(2)}</p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* INCOME SECTION */}
                    <div className="income-card bg-[#00001c] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff7f] opacity-5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-10" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#00ff7f]" /> Income Breakdown
                                </h2>
                                <p className="text-white/50 text-sm">Monthly Earnings by Platform</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold font-mono text-[#00ff7f] scramble-val" data-value={currentData.totalIncome}>RM 0.00</p>
                                <p className="text-xs text-white/50 uppercase tracking-widest">Total Income</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {currentData.income.map((source, i) => (
                                <div
                                    key={i}
                                    className="relative"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="flex items-center justify-between mb-2 text-sm z-10 relative">
                                        <div className="flex items-center gap-2">
                                            <source.icon className={cn("w-4 h-4", hoveredIndex === i ? "text-white" : "text-white/60")} />
                                            <span className="font-medium">{source.name}</span>
                                        </div>
                                        <span className="font-mono opacity-80">RM {source.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn("income-bar h-full rounded-full transition-shadow duration-300", source.color)}
                                            data-width={source.width}
                                            style={{ boxShadow: hoveredIndex === i ? `0 0 15px currentColor` : 'none' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* EXPENSES SECTION */}
                    <div className="expense-card bg-card border rounded-3xl p-8 shadow-lg relative perspective-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#00001c] flex items-center gap-2">
                                    <TrendingDown className="w-6 h-6 text-red-500" /> Expense Analysis
                                </h2>
                                <p className="text-muted-foreground text-sm">Operational Costs & Spending</p>
                            </div>
                            <div className="bg-red-500/10 px-4 py-2 rounded-xl">
                                <p className="text-xl font-bold text-red-600 scramble-val" data-value={currentData.totalExpense}>RM 0.00</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentData.expenses.map((expense, i) => (
                                <div
                                    key={i}
                                    className="expense-item p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-red-500/20 cursor-default group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("w-3 h-3 rounded-full mt-1.5", expense.color)} />
                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#00001c] mb-1 font-mono">RM {expense.amount}</p>
                                        <p className="text-sm font-medium text-muted-foreground">{expense.category}</p>
                                    </div>
                                    <div className="mt-3 w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", expense.color)} style={{ width: `${expense.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Net Profit Box */}
                        <div className="expense-item mt-6 p-6 bg-gradient-to-r from-[#00001c] to-[#1a1a4a] rounded-2xl text-white flex items-center justify-between shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                            <div>
                                <p className="text-sm text-white/60 mb-1">Net Monthly Profit</p>
                                <p className="text-3xl font-bold font-mono text-[#00ff7f] scramble-val" data-value={currentData.netProfit}>RM 0.00</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#00ff7f]/20 flex items-center justify-center text-[#00ff7f]">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
