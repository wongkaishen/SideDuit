"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TrendingUp, TrendingDown, RefreshCcw, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';

const assets = [
    { name: "S&P 500 ETF", ticker: "VOO", price: 412.35, change: +1.2, value: 5240.50, color: "bg-blue-500" },
    { name: "Bitcoin", ticker: "BTC", price: 64230.10, change: -2.4, value: 3210.00, color: "bg-orange-500" },
    { name: "Tesla Inc.", ticker: "TSLA", price: 178.40, change: +3.5, value: 1784.00, color: "bg-red-500" },
    { name: "Apple Inc.", ticker: "AAPL", price: 189.90, change: +0.8, value: 3798.00, color: "bg-gray-800" },
    { name: "Ethereum", ticker: "ETH", price: 3450.20, change: -1.1, value: 1725.10, color: "bg-purple-600" },
];

export default function InvestPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Elements to animate
        const header = '.invest-header';
        const chartArea = '.invest-chart';
        const assetItems = gsap.utils.toArray('.asset-item');
        const totalValue = '.total-value';

        // Initial States
        gsap.set([header, chartArea], {
            autoAlpha: 0,
            y: -30,
            filter: 'blur(5px)'
        });

        gsap.set(assetItems, {
            autoAlpha: 0,
            x: 50,
            rotationX: 10,
            z: -20,
            filter: 'blur(5px)'
        });

        // Header & Chart Animation
        gsap.to([header, chartArea], {
            duration: 1,
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.2
        });

        // Number Scramble for Total Value
        const obj = { value: 0 };
        gsap.to(obj, {
            value: 15757.60,
            duration: 2.5,
            ease: "circ.out",
            onUpdate: () => {
                const el = document.querySelector(totalValue);
                if (el) el.innerHTML = '$' + obj.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        });

        // Assets Stagger
        gsap.to(assetItems, {
            delay: 0.5,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            z: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.2)",
            stagger: 0.1
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="invest-header flex flex-col md:flex-row items-center justify-between mb-8 opacity-0">
                    <div>
                        <h1 className="text-3xl font-bold text-[#00001c]">Investment Portfolio</h1>
                        <p className="text-muted-foreground">Real-time market updates</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-[#00001c] text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
                        <div className="bg-[#00ff7f]/20 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-[#00ff7f]" />
                        </div>
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">Total Balance</p>
                            <p className="text-2xl font-bold total-value font-mono">$0.00</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid md:grid-cols-3 gap-6">

                    {/* Visual Chart Placeholder */}
                    <div className="invest-chart md:col-span-2 bg-gradient-to-br from-[#00001c] to-[#1a1a4a] rounded-2xl p-6 min-h-[300px] shadow-xl relative overflow-hidden group opacity-0">
                        <div className="absolute top-0 right-0 p-6 flex gap-2">
                            <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">1D</button>
                            <button className="text-xs bg-[#00ff7f] text-[#00001c] font-bold px-3 py-1 rounded transition-colors">1W</button>
                            <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">1M</button>
                        </div>
                        <h3 className="text-white font-semibold mb-8 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-[#00ff7f]" /> Portfolio Allocation
                        </h3>

                        {/* Animated Bars (Stylized) */}
                        <div className="flex items-end justify-between h-40 px-4 gap-2">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-[#00ff7f] opacity-20 hover:opacity-100 transition-all duration-300 rounded-t-sm hover:shadow-[0_0_15px_#00ff7f]"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Asset List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                            <span>Asset</span>
                            <span>Value</span>
                        </div>
                        {assets.map((asset, i) => (
                            <div key={i} className="asset-item bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer opacity-0">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-8 rounded-full", asset.color)} />
                                    <div>
                                        <p className="font-bold text-[#00001c]">{asset.ticker}</p>
                                        <p className="text-xs text-muted-foreground">{asset.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#00001c]">${asset.value.toLocaleString()}</p>
                                    <p className={cn("text-xs font-medium flex items-center justify-end gap-1", asset.change > 0 ? "text-green-600" : "text-red-500")}>
                                        {asset.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(asset.change)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 mt-4 border-2 border-dashed border-muted-foreground/20 rounded-xl text-muted-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                            <RefreshCcw className="w-4 h-4" /> Sync Assets
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
