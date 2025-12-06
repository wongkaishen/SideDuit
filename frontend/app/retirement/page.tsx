"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Sparkles, Calculator, TrendingUp, DollarSign, Send, User, Bot, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, subtext, delay }: { title: string, value: string, icon: any, subtext?: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="w-4 h-4 text-primary" />
            </div>
        </div>
        <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
    </motion.div>
);

const InputGroup = ({ label, value, onChange, min, max, step = 1, prefix = "", suffix = "", tooltip }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground/90">{label}</label>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all"
            style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
        />
        {tooltip && <p className="text-xs text-muted-foreground">{tooltip}</p>}
    </div>
);

export default function RetirementPage() {
    // --- State for Calculator ---
    const [currentAge, setCurrentAge] = useState<number>(25);
    const [retirementAge, setRetirementAge] = useState<number>(60);
    const [currentSavings, setCurrentSavings] = useState<number>(10000);
    const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
    const [interestRate, setInterestRate] = useState<number>(5.5);

    // --- State for AI Advisor ---
    const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- Calculations ---
    const projectionData = useMemo(() => {
        const data = [];
        let balance = currentSavings;
        let totalContributed = currentSavings;
        const yearsToRetire = retirementAge - currentAge;
        const currentYear = new Date().getFullYear();

        for (let i = 0; i <= yearsToRetire; i++) {
            data.push({
                year: currentYear + i,
                age: currentAge + i,
                balance: Math.round(balance),
                contributed: Math.round(totalContributed),
                interest: Math.round(balance - totalContributed)
            });

            // Add yearly contributions
            const yearlyContrib = monthlyContribution * 12;
            balance += yearlyContrib;
            totalContributed += yearlyContrib;
            
            // Add compound interest
            balance += balance * (interestRate / 100);
        }
        return data;
    }, [currentAge, retirementAge, currentSavings, monthlyContribution, interestRate]);

    const finalAmount = projectionData[projectionData.length - 1]?.balance || 0;
    const totalContributed = projectionData[projectionData.length - 1]?.contributed || 0;
    const totalInterest = projectionData[projectionData.length - 1]?.interest || 0;

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoadingAi]);

    // --- AI Advisor Handler ---
    const handleSendMessage = async (initial = false) => {
        if (!initial && !inputMessage.trim()) return;

        setIsLoadingAi(true);

        let newMessages = [...messages];
        if (!initial) {
            newMessages.push({ role: 'user', content: inputMessage });
            setMessages(newMessages);
            setInputMessage('');
        } else {
            setIsChatStarted(true);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/finance/retirement-advisor/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    age: currentAge,
                    current_savings: currentSavings,
                    monthly_contribution: monthlyContribution,
                    retirement_age: retirementAge,
                    messages: newMessages
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'model', content: data.advice }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: "I encountered an error. Please try again." }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Error connecting to the financial advisor." }]);
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-24 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Retirement Planner</h1>
                        <p className="text-muted-foreground mt-2 text-lg">Visualize your financial future and get AI-powered advice.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setCurrentAge(25);
                                setRetirementAge(60);
                                setCurrentSavings(10000);
                                setMonthlyContribution(500);
                                setInterestRate(5.5);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Projected Savings" 
                        value={`RM ${finalAmount.toLocaleString()}`} 
                        icon={DollarSign}
                        subtext={`At age ${retirementAge}`}
                        delay={0.1}
                    />
                    <StatCard 
                        title="Total Contribution" 
                        value={`RM ${totalContributed.toLocaleString()}`} 
                        icon={TrendingUp}
                        subtext="Your principal amount"
                        delay={0.2}
                    />
                    <StatCard 
                        title="Total Interest" 
                        value={`RM ${totalInterest.toLocaleString()}`} 
                        icon={Sparkles}
                        subtext={`At ${interestRate}% avg. return`}
                        delay={0.3}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Controls (4 cols) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Calculator className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-semibold">Configuration</h2>
                            </div>

                            <InputGroup 
                                label="Current Age" 
                                value={currentAge} 
                                onChange={setCurrentAge} 
                                min={18} max={70} 
                                suffix=" years"
                            />
                            <InputGroup 
                                label="Retirement Age" 
                                value={retirementAge} 
                                onChange={setRetirementAge} 
                                min={currentAge + 1} max={80} 
                                suffix=" years"
                            />
                            <InputGroup 
                                label="Current Savings" 
                                value={currentSavings} 
                                onChange={setCurrentSavings} 
                                min={0} max={1000000} step={1000} 
                                prefix="RM "
                            />
                            <InputGroup 
                                label="Monthly Contribution" 
                                value={monthlyContribution} 
                                onChange={setMonthlyContribution} 
                                min={0} max={20000} step={100} 
                                prefix="RM "
                            />
                            <InputGroup 
                                label="Est. Annual Return" 
                                value={interestRate} 
                                onChange={setInterestRate} 
                                min={0} max={15} step={0.1} 
                                suffix="%"
                                tooltip="Historical EPF average is ~5-6%"
                            />
                        </div>
                    </motion.div>

                    {/* Right Column: Graph & AI (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Graph Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="bg-card border border-border p-6 rounded-2xl shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Growth Projection
                                </h2>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis 
                                            dataKey="age" 
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl">
                                                            <p className="text-muted-foreground text-xs mb-1">Age {label}</p>
                                                            <p className="font-bold text-lg text-primary">
                                                                RM {Number(payload[0].value).toLocaleString()}
                                                            </p>
                                                            <div className="mt-2 text-xs space-y-1">
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Principal:</span>
                                                                    <span>RM {payload[0].payload.contributed.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span className="text-muted-foreground">Interest:</span>
                                                                    <span className="text-green-500">+RM {payload[0].payload.interest.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} 
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="balance" 
                                            stroke="hsl(var(--primary))" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorBalance)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* AI Chat Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] max-h-[600px]"
                        >
                            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">AI Financial Advisor</h2>
                                        <p className="text-xs text-muted-foreground">Powered by Gemini</p>
                                    </div>
                                </div>
                                {isChatStarted && (
                                    <button 
                                        onClick={() => {
                                            setMessages([]);
                                            setIsChatStarted(false);
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 px-2 py-1 rounded border border-gray-200 transition-colors"
                                    >
                                        Reset Chat
                                    </button>
                                )}
                            </div>

                            {!isChatStarted ? (
                                <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-6 bg-gradient-to-b from-background to-muted/20">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                        <Bot className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="max-w-md space-y-2">
                                        <h3 className="text-xl font-semibold">Need personalized advice?</h3>
                                        <p className="text-muted-foreground">
                                            I can analyze your current trajectory and suggest optimizations for your retirement plan.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleSendMessage(true)}
                                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary hover:ring-offset-2"
                                    >
                                        <span className="mr-2">Generate Analysis</span>
                                        <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
                                                    }`}>
                                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                                    </div>
                                                    <div className={`p-4 rounded-2xl shadow-sm ${
                                                        msg.role === 'user' 
                                                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                            : 'bg-card border border-border rounded-tl-none'
                                                    }`}>
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isLoadingAi && (
                                            <div className="flex justify-start">
                                                <div className="flex gap-3 max-w-[85%]">
                                                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                                        <Bot className="w-4 h-4" />
                                                    </div>
                                                    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                        <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="p-4 bg-background border-t border-border">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Ask a follow-up question..."
                                                className="flex-1 bg-muted/50 border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                disabled={isLoadingAi}
                                            />
                                            <button
                                                onClick={() => handleSendMessage()}
                                                disabled={!inputMessage.trim() || isLoadingAi}
                                                className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
