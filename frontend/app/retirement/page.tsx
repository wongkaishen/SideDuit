"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, Sparkles } from 'lucide-react';

export default function RetirementPage() {
    // --- State for Calculator ---
    const [currentAge, setCurrentAge] = useState(25);
    const [retirementAge, setRetirementAge] = useState(60);
    const [currentSavings, setCurrentSavings] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [interestRate, setInterestRate] = useState(5.5); // EPF average roughly 5-6%

    // --- State for AI Advisor ---
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // --- Calculations ---
    const projectionData = useMemo(() => {
        const data = [];
        let balance = currentSavings;
        const yearsToRetire = retirementAge - currentAge;
        const currentYear = new Date().getFullYear();

        for (let i = 0; i <= yearsToRetire; i++) {
            data.push({
                year: currentYear + i,
                age: currentAge + i,
                balance: Math.round(balance),
            });

            // Add yearly contributions
            balance += monthlyContribution * 12;
            // Add compound interest
            balance += balance * (interestRate / 100);
        }
        return data;
    }, [currentAge, retirementAge, currentSavings, monthlyContribution, interestRate]);

    const finalAmount = projectionData[projectionData.length - 1]?.balance || 0;

    // --- AI Advisor Handler ---
    const handleGetAiAdvice = async () => {
        setIsLoadingAi(true);
        setAiAdvice(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/finance/retirement-advisor/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    age: currentAge,
                    current_savings: currentSavings,
                    monthly_contribution: monthlyContribution,
                    retirement_age: retirementAge,
                    // In a real app, we'd fetch actual income/expenses from DB too
                    // For now, we'll let the backend infer or just use these params
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiAdvice(data.advice);
            } else {
                setAiAdvice("Sorry, I couldn't generate advice right now. Please try again.");
            }
        } catch (error) {
            console.error("AI Error:", error);
            setAiAdvice("Error connecting to the financial advisor.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-20 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">Retirement Planner</h1>
                    <p className="text-muted-foreground">Visualize your EPF growth and plan for a secure future.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Controls */}
                    <div className="lg:col-span-1 space-y-6 bg-card p-6 rounded-xl border shadow-sm h-fit">
                        <h2 className="text-xl font-semibold mb-4">Configuration</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Age</label>
                                <input
                                    type="number"
                                    value={currentAge}
                                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                                    className="w-full p-2 rounded-md border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Retirement Age</label>
                                <input
                                    type="number"
                                    value={retirementAge}
                                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                                    className="w-full p-2 rounded-md border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Current EPF Savings (RM)</label>
                                <input
                                    type="number"
                                    value={currentSavings}
                                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                                    className="w-full p-2 rounded-md border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Monthly Contribution (RM)</label>
                                <input
                                    type="number"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                    className="w-full p-2 rounded-md border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Est. Annual Return (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full p-2 rounded-md border bg-background"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Avg EPF rate is ~5-6%</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">Projected Savings at {retirementAge}</p>
                            <p className="text-3xl font-bold text-primary">RM {finalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Right Column: Graph & AI */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Graph Section */}
                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Savings Projection</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={projectionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis
                                            dataKey="age"
                                            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                                            tick={{ fill: '#888' }}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `RM${value / 1000}k`}
                                            tick={{ fill: '#888' }}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`RM ${value.toLocaleString()}`, "Balance"]}
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="balance"
                                            stroke="#00ff7f"
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 8 }}
                                            name="EPF Savings"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Advisor Section */}
                        <div className="bg-card p-6 rounded-xl border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-24 h-24" />
                            </div>

                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                AI Retirement Advisor
                            </h2>

                            <p className="text-muted-foreground mb-6">
                                Get personalized advice based on your current contributions and goals.
                            </p>

                            {!aiAdvice && !isLoadingAi && (
                                <button
                                    onClick={handleGetAiAdvice}
                                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate AI Advice
                                </button>
                            )}

                            {isLoadingAi && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing your financial data...
                                </div>
                            )}

                            {aiAdvice && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-muted/30 p-4 rounded-lg border border-primary/20"
                                >
                                    <div className="prose prose-invert max-w-none">
                                        <p className="whitespace-pre-wrap leading-relaxed">{aiAdvice}</p>
                                    </div>
                                    <button
                                        onClick={handleGetAiAdvice}
                                        className="mt-4 text-xs text-primary hover:underline"
                                    >
                                        Refresh Advice
                                    </button>
                                </motion.div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
