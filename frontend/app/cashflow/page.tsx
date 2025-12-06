"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    TrendingDown,
    Calendar,
    Filter,
    Download,
    RefreshCcw,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAllTransactions } from '@/lib/api';

type Period = 'week' | 'month' | 'year';

export default function CashFlowPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [period, setPeriod] = useState<Period>('month');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await fetchAllTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Error loading transactions:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Calculate stats
    const filterByPeriod = (txs: any[], p: Period) => {
        const now = new Date();
        return txs.filter(t => {
            const txDate = new Date(t.date);
            if (p === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return txDate >= weekAgo;
            } else if (p === 'month') {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else {
                return txDate.getFullYear() === now.getFullYear();
            }
        });
    };

    const filteredTxs = filterByPeriod(transactions, period);
    const totalIncome = filteredTxs
        .filter(t => t.transaction_type?.toLowerCase() === 'income')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const totalExpense = filteredTxs
        .filter(t => t.transaction_type?.toLowerCase() === 'expense')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const netCashFlow = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : '0';

    // Group transactions by date
    const groupedByDate = filteredTxs.reduce((acc, tx) => {
        const date = new Date(tx.date).toLocaleDateString('en-MY', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {} as Record<string, any[]>);

    useGSAP(() => {
        if (loading) return;

        const header = '.cashflow-header';
        const statsCards = gsap.utils.toArray('.stat-card');
        const flowChart = '.flow-chart';
        const txGroups = gsap.utils.toArray('.tx-group');

        gsap.set(header, { autoAlpha: 0, y: -30 });
        gsap.set(statsCards, { autoAlpha: 0, scale: 0.9, y: 30 });
        gsap.set(flowChart, { autoAlpha: 0, scaleY: 0, transformOrigin: 'bottom' });
        gsap.set(txGroups, { autoAlpha: 0, x: -20 });

        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "expo.out" });
        
        gsap.to(statsCards, {
            delay: 0.2,
            duration: 0.8,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: "back.out(1.5)",
            stagger: 0.1
        });

        gsap.to(flowChart, {
            delay: 0.5,
            duration: 1,
            autoAlpha: 1,
            scaleY: 1,
            ease: "expo.out"
        });

        gsap.to(txGroups, {
            delay: 0.7,
            duration: 0.6,
            autoAlpha: 1,
            x: 0,
            ease: "power2.out",
            stagger: 0.08
        });

    }, { scope: containerRef, dependencies: [loading, period] });

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing cash flow...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="cashflow-header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#00001c] mb-2">Cash Flow</h1>
                        <p className="text-muted-foreground">Income & expense analysis at a glance</p>
                    </div>
                    
                    {/* Period Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-md border">
                        {(['week', 'month', 'year'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize",
                                    period === p 
                                        ? "bg-[#00001c] text-white" 
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="stat-card bg-white p-5 rounded-2xl shadow-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Income</span>
                        </div>
                        <p className="text-2xl font-bold text-[#00001c]">RM {totalIncome.toLocaleString()}</p>
                    </div>

                    <div className="stat-card bg-white p-5 rounded-2xl shadow-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Expenses</span>
                        </div>
                        <p className="text-2xl font-bold text-[#00001c]">RM {totalExpense.toLocaleString()}</p>
                    </div>

                    <div className="stat-card bg-[#00001c] text-white p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-[#00ff7f]/20 rounded-lg">
                                {netCashFlow >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-[#00ff7f]" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                            </div>
                            <span className="text-xs text-white/60 uppercase font-semibold">Net Flow</span>
                        </div>
                        <p className={cn(
                            "text-2xl font-bold",
                            netCashFlow >= 0 ? "text-[#00ff7f]" : "text-red-400"
                        )}>
                            {netCashFlow >= 0 ? '+' : '-'}RM {Math.abs(netCashFlow).toLocaleString()}
                        </p>
                    </div>

                    <div className="stat-card bg-white p-5 rounded-2xl shadow-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-xs text-muted-foreground uppercase font-semibold">Savings Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-[#00001c]">{savingsRate}%</p>
                    </div>
                </div>

                {/* Visual Flow Chart */}
                <div className="flow-chart bg-white rounded-3xl p-8 shadow-lg border mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#00001c]">Flow Visualization</h2>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Download className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Simple Bar Comparison */}
                    <div className="relative h-20 flex gap-4 items-end">
                        <div className="flex-1">
                            <div 
                                className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-700"
                                style={{ height: `${totalIncome > 0 ? Math.min((totalIncome / Math.max(totalIncome, totalExpense)) * 100, 100) : 0}%` }}
                            />
                            <p className="text-center text-sm font-medium mt-2 text-muted-foreground">Income</p>
                        </div>
                        <div className="flex-1">
                            <div 
                                className="bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-700"
                                style={{ height: `${totalExpense > 0 ? Math.min((totalExpense / Math.max(totalIncome, totalExpense)) * 100, 100) : 0}%` }}
                            />
                            <p className="text-center text-sm font-medium mt-2 text-muted-foreground">Expenses</p>
                        </div>
                    </div>

                    {/* Flow Indicator */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <ArrowUpRight className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden max-w-xs">
                            <div 
                                className={cn(
                                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                    netCashFlow >= 0 ? "bg-green-500" : "bg-red-500"
                                )}
                                style={{ 
                                    width: `${totalIncome > 0 ? Math.min((Math.abs(netCashFlow) / totalIncome) * 100, 100) : 0}%` 
                                }}
                            />
                        </div>
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <ArrowDownRight className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#00001c]">Transaction History</h2>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#00001c] transition-colors">
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="space-y-6 max-h-96 overflow-y-auto">
                        {Object.entries(groupedByDate).length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No transactions for this period</p>
                        ) : (
                            Object.entries(groupedByDate).map(([date, txs]) => (
                                <div key={date} className="tx-group">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{date}</p>
                                    <div className="space-y-2">
                                        {txs.map((tx, idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                                        tx.transaction_type?.toLowerCase() === 'income' 
                                                            ? "bg-green-100 text-green-600" 
                                                            : "bg-red-100 text-red-600"
                                                    )}>
                                                        {tx.transaction_type?.toLowerCase() === 'income' 
                                                            ? <ArrowUpRight className="w-5 h-5" />
                                                            : <ArrowDownRight className="w-5 h-5" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-[#00001c]">
                                                            {tx.document_name || tx.transaction_type}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{tx.category || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                                <p className={cn(
                                                    "font-bold",
                                                    tx.transaction_type?.toLowerCase() === 'income' 
                                                        ? "text-green-600" 
                                                        : "text-red-600"
                                                )}>
                                                    {tx.transaction_type?.toLowerCase() === 'income' ? '+' : '-'}
                                                    RM {Math.abs(tx.amount).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

