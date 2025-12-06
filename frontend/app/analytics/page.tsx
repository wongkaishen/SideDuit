"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Loader2,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from '@/components/ui/sparkline';
import { fetchAllTransactions, fetchDashboardSummary, groupTransactionsByMonth, type MonthlyData, type DashboardSummary } from '@/lib/api';

export default function AnalyticsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [monthlyData, setMonthlyData] = useState<Record<string, MonthlyData>>({});
    const [allTimeSummary, setAllTimeSummary] = useState<DashboardSummary | null>(null);
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('all'); // Default to 'all' for all-time view
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                setLoading(true);
                setError(null);

                // Fetch both all-time summary and transactions in parallel
                const [summaryData, transactions] = await Promise.all([
                    fetchDashboardSummary(),
                    fetchAllTransactions()
                ]);
                
                setAllTimeSummary(summaryData);
                const grouped = groupTransactionsByMonth(transactions);
                
                // Get available months sorted by most recent using sortKey
                const months = Object.keys(grouped).sort((a, b) => {
                    const sortKeyA = grouped[a].sortKey || '0000-00';
                    const sortKeyB = grouped[b].sortKey || '0000-00';
                    return sortKeyB.localeCompare(sortKeyA); // Descending order
                });

                setMonthlyData(grouped);
                setAvailableMonths(months);
                
                // Default to "All Time" view to match dashboard
                setSelectedMonth('all');
            } catch (err) {
                console.error('Error loading analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        }

        loadAnalytics();
    }, []);

    // Get current data based on selection
    const currentData = selectedMonth === 'all' 
        ? (allTimeSummary ? {
            totalIncome: allTimeSummary.total_income,
            totalExpense: allTimeSummary.total_expenses,
            netProfit: allTimeSummary.net_income,
            incomeCount: 0,
            expenseCount: 0,
            transactions: Object.values(monthlyData).flatMap(m => m.transactions),
          } : null)
        : monthlyData[selectedMonth] || null;

    // Calculate simple trend data (last 7 days of transactions)
    const getTrendData = (transactions: any[], type: 'income' | 'expense') => {
        if (!transactions || transactions.length === 0) return [0, 0, 0, 0, 0, 0, 0];
        
        const last7Days = Array(7).fill(0);
        const today = new Date();
        
        transactions.forEach(t => {
            if (t.transaction_type.toLowerCase() === type) {
                const txDate = new Date(t.date);
                const daysDiff = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff >= 0 && daysDiff < 7) {
                    last7Days[6 - daysDiff] += Math.abs(t.amount);
                }
            }
        });
        
        return last7Days;
    };

    useGSAP(() => {
        if (!currentData) return;

        // Selectors
        const header = '.analytics-header';
        const summaryCards = '.summary-card';
        const incomeCard = '.income-card';
        const expenseCard = '.expense-card';
        const numbers = gsap.utils.toArray<HTMLElement>('.scramble-val');
        const taxBar = '.tax-progress-bar';

        // 1. Initial State
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
        const taxProgress = Math.min((currentData.totalIncome / 10000) * 100, 100);
        gsap.to(taxBar, {
            delay: 0.6,
            duration: 1.5,
            width: `${taxProgress}%`,
            ease: "power2.out"
        });

        // 5. Cards Explosion
        gsap.to([incomeCard, expenseCard], {
            delay: 0.5,
            duration: 1.4,
            autoAlpha: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.2
        });

        // 6. Number Scramble
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

    }, { scope: containerRef, dependencies: [currentData] });

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !currentData) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'No data available'}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const incomeTrend = getTrendData(currentData.transactions, 'income');
    const expenseTrend = getTrendData(currentData.transactions, 'expense');
    const taxProgress = Math.min((currentData.totalIncome / 10000) * 100, 100);

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

                    {/* Month Selector with All Time option */}
                    <div className="bg-white rounded-full p-1 shadow-md border flex items-center flex-wrap gap-1">
                        <button
                            onClick={() => setSelectedMonth('all')}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                selectedMonth === 'all'
                                    ? "bg-[#00001c] text-white shadow-lg scale-105"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            All Time
                        </button>
                        {availableMonths.slice(0, 3).map((month) => (
                            <button
                                key={month}
                                onClick={() => setSelectedMonth(month)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                                    selectedMonth === month
                                        ? "bg-[#00001c] text-white shadow-lg scale-105"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {month.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* VISUAL METRICS SUMMARY */}
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
                        <div className="mt-4 h-12 w-full">
                            <Sparkline data={incomeTrend} color="#00b14f" height={40} strokeWidth={3} />
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
                        <div className="mt-4 h-12 w-full">
                            <Sparkline data={expenseTrend} color="#ef4444" height={40} strokeWidth={3} />
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

                        <div className="mt-2">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-amber-600">Tax threshold reached</span>
                                <span className="text-amber-600">{taxProgress.toFixed(0)}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="tax-progress-bar h-full bg-amber-500 rounded-full relative"
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
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff7f] opacity-5 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-10" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#00ff7f]" /> Income Overview
                                </h2>
                                <p className="text-white/50 text-sm">Total earnings for {selectedMonth}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold font-mono text-[#00ff7f] scramble-val" data-value={currentData.totalIncome}>RM 0.00</p>
                                <p className="text-xs text-white/50 uppercase tracking-widest">{currentData.incomeCount} Transactions</p>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-white/70 text-sm">Average per transaction</span>
                                <span className="text-xl font-bold text-white">
                                    RM {currentData.incomeCount > 0 ? (currentData.totalIncome / currentData.incomeCount).toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00ff7f] rounded-full" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    {/* EXPENSES SECTION */}
                    <div className="expense-card bg-card border rounded-3xl p-8 shadow-lg relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#00001c] flex items-center gap-2">
                                    <TrendingDown className="w-6 h-6 text-red-500" /> Expense Analysis
                                </h2>
                                <p className="text-muted-foreground text-sm">Total costs for {selectedMonth}</p>
                            </div>
                            <div className="bg-red-500/10 px-4 py-2 rounded-xl">
                                <p className="text-xl font-bold text-red-600 scramble-val" data-value={currentData.totalExpense}>RM 0.00</p>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-2xl p-6 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-muted-foreground text-sm">Average per transaction</span>
                                <span className="text-xl font-bold text-[#00001c]">
                                    RM {currentData.expenseCount > 0 ? (currentData.totalExpense / currentData.expenseCount).toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Transactions</span>
                                <span className="font-semibold">{currentData.expenseCount}</span>
                            </div>
                        </div>

                        {/* Net Profit Box */}
                        <div className="p-6 bg-gradient-to-r from-[#00001c] to-[#1a1a4a] rounded-2xl text-white flex items-center justify-between shadow-xl">
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

                {/* Recent Transactions List */}
                {currentData.transactions.length > 0 && (
                    <div className="mt-8 bg-white rounded-3xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-[#00001c] mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Recent Transactions ({selectedMonth})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {currentData.transactions.slice(0, 20).map((transaction, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            transaction.transaction_type.toLowerCase() === 'income' ? "bg-green-500" : "bg-red-500"
                                        )} />
                                        <div>
                                            <p className="font-medium text-sm">{transaction.document_name || `${transaction.transaction_type} Transaction`}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-sm font-mono font-bold",
                                        transaction.transaction_type.toLowerCase() === 'income' ? "text-green-600" : "text-red-600"
                                    )}>
                                        {transaction.transaction_type.toLowerCase() === 'income' ? '+' : '-'}RM {Math.abs(transaction.amount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
