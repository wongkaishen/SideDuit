"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    TrendingUp, 
    TrendingDown, 
    RefreshCcw, 
    PieChart,
    Plus,
    Minus,
    Star,
    Bell,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Asset = {
    id: number;
    name: string;
    ticker: string;
    price: number;
    change: number;
    value: number;
    shares: number;
    color: string;
    category: string;
};

const assets: Asset[] = [
    { id: 1, name: "S&P 500 ETF", ticker: "VOO", price: 412.35, change: +1.2, value: 5240.50, shares: 12.7, color: "bg-blue-500", category: "ETF" },
    { id: 2, name: "Bitcoin", ticker: "BTC", price: 64230.10, change: -2.4, value: 3210.00, shares: 0.05, color: "bg-orange-500", category: "Crypto" },
    { id: 3, name: "Tesla Inc.", ticker: "TSLA", price: 178.40, change: +3.5, value: 1784.00, shares: 10, color: "bg-red-500", category: "Stocks" },
    { id: 4, name: "Apple Inc.", ticker: "AAPL", price: 189.90, change: +0.8, value: 3798.00, shares: 20, color: "bg-gray-800", category: "Stocks" },
    { id: 5, name: "Ethereum", ticker: "ETH", price: 3450.20, change: -1.1, value: 1725.10, shares: 0.5, color: "bg-purple-600", category: "Crypto" },
];

const watchlist = [
    { name: "Microsoft", ticker: "MSFT", price: 378.50, change: +0.9 },
    { name: "NVIDIA", ticker: "NVDA", price: 495.20, change: +2.3 },
    { name: "Google", ticker: "GOOGL", price: 141.80, change: -0.5 },
];

const marketNews = [
    { title: "Fed signals potential rate cuts in 2024", time: "2h ago", source: "Bloomberg" },
    { title: "Bitcoin reaches new all-time high", time: "4h ago", source: "CoinDesk" },
    { title: "Tech stocks rally on AI optimism", time: "6h ago", source: "Reuters" },
];

type ModalType = 'buy' | 'sell' | null;

export default function InvestPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [quantity, setQuantity] = useState('');
    const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist' | 'news'>('portfolio');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const totalValue = assets.reduce((acc, a) => acc + a.value, 0);
    const totalChange = assets.reduce((acc, a) => acc + (a.value * a.change / 100), 0);
    const percentChange = (totalChange / (totalValue - totalChange)) * 100;

    useGSAP(() => {
        const header = '.invest-header';
        const chartArea = '.invest-chart';
        const assetItems = gsap.utils.toArray('.asset-item');
        const sidebar = '.invest-sidebar';

        gsap.set([header, chartArea], {
            autoAlpha: 0,
            y: -30,
            filter: 'blur(5px)'
        });
        gsap.set(sidebar, { autoAlpha: 0, x: 30 });
        gsap.set(assetItems, {
            autoAlpha: 0,
            x: 50,
            rotationX: 10,
            z: -20,
            filter: 'blur(5px)'
        });

        gsap.to([header, chartArea], {
            duration: 1,
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.2
        });

        gsap.to(sidebar, { delay: 0.3, duration: 0.8, autoAlpha: 1, x: 0, ease: "expo.out" });

        const obj = { value: 0 };
        gsap.to(obj, {
            value: totalValue,
            duration: 2.5,
            ease: "circ.out",
            onUpdate: () => {
                const el = document.querySelector('.total-value');
                if (el) el.innerHTML = 'RM ' + obj.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        });

        gsap.to(assetItems, {
            delay: 0.5,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            z: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.2)",
            stagger: 0.08
        });

    }, { scope: containerRef });

    const openTradeModal = (asset: Asset, type: 'buy' | 'sell') => {
        setSelectedAsset(asset);
        setModalType(type);
        setQuantity('');
        setShowSuccess(false);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedAsset(null);
        setQuantity('');
        setShowSuccess(false);
    };

    const handleTrade = async () => {
        if (!quantity || parseFloat(quantity) <= 0) return;
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setShowSuccess(true);
    };

    const estimatedTotal = selectedAsset ? parseFloat(quantity || '0') * selectedAsset.price : 0;

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="invest-header flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#00001c] mb-1">Investment Portfolio</h1>
                        <p className="text-muted-foreground">Real-time market updates & trading</p>
                    </div>
                    <div className="bg-[#00001c] text-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
                        <div className="bg-[#00ff7f]/20 p-3 rounded-xl">
                            <TrendingUp className="w-7 h-7 text-[#00ff7f]" />
                        </div>
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">Total Value</p>
                            <p className="text-3xl font-bold total-value font-mono">RM 0.00</p>
                            <p className={cn(
                                "text-sm font-medium flex items-center gap-1",
                                percentChange >= 0 ? "text-[#00ff7f]" : "text-red-400"
                            )}>
                                {percentChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}% today
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Chart Area */}
                        <div className="invest-chart bg-gradient-to-br from-[#00001c] to-[#1a1a4a] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff7f] opacity-5 blur-[100px] rounded-full pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-[#00ff7f]" /> Portfolio Performance
                                </h3>
                                <div className="flex gap-2">
                                    {['1D', '1W', '1M', '3M', '1Y'].map((period, idx) => (
                                        <button 
                                            key={period}
                                            className={cn(
                                                "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                                                idx === 1 ? "bg-[#00ff7f] text-[#00001c]" : "bg-white/10 hover:bg-white/20 text-white"
                                            )}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chart Visualization */}
                            <div className="h-48 flex items-end justify-between gap-1 px-2 mb-4">
                                {[40, 55, 45, 60, 70, 65, 80, 75, 85, 78, 90, 88, 95, 92, 98].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-full bg-[#00ff7f] opacity-30 hover:opacity-100 transition-all duration-300 rounded-t-sm cursor-pointer group relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#00001c] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                            RM {(h * 157).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Allocation Pills */}
                            <div className="flex flex-wrap gap-2">
                                {['Stocks 45%', 'Crypto 25%', 'ETFs 30%'].map((label) => (
                                    <span key={label} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                            {(['portfolio', 'watchlist', 'news'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize",
                                        activeTab === tab 
                                            ? "bg-white shadow text-[#00001c]" 
                                            : "text-muted-foreground hover:text-[#00001c]"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Portfolio Assets */}
                        {activeTab === 'portfolio' && (
                            <div className="space-y-3">
                                {assets.map((asset) => (
                                    <div key={asset.id} className="asset-item bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-3 h-12 rounded-full", asset.color)} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-[#00001c]">{asset.ticker}</p>
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{asset.category}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{asset.name}</p>
                                                <p className="text-xs text-muted-foreground">{asset.shares} shares @ RM {asset.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-[#00001c]">RM {asset.value.toLocaleString()}</p>
                                                <p className={cn(
                                                    "text-sm font-medium flex items-center justify-end gap-1",
                                                    asset.change > 0 ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {asset.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {asset.change > 0 ? '+' : ''}{asset.change}%
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openTradeModal(asset, 'buy')}
                                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openTradeModal(asset, 'sell')}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Watchlist */}
                        {activeTab === 'watchlist' && (
                            <div className="space-y-3">
                                {watchlist.map((stock, idx) => (
                                    <div key={idx} className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <Star className="w-5 h-5 text-amber-500 fill-current" />
                                            <div>
                                                <p className="font-bold text-[#00001c]">{stock.ticker}</p>
                                                <p className="text-sm text-muted-foreground">{stock.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-[#00001c]">RM {stock.price}</p>
                                                <p className={cn(
                                                    "text-sm font-medium",
                                                    stock.change > 0 ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {stock.change > 0 ? '+' : ''}{stock.change}%
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 bg-[#00001c] text-white rounded-lg text-sm font-medium hover:bg-[#00001c]/80">
                                                Trade
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-muted-foreground/20 rounded-xl text-muted-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Add to Watchlist
                                </button>
                            </div>
                        )}

                        {/* News */}
                        {activeTab === 'news' && (
                            <div className="space-y-3">
                                {marketNews.map((news, idx) => (
                                    <div key={idx} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-[#00001c] group-hover:text-[#00b14f] transition-colors">{news.title}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{news.source} • {news.time}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="invest-sidebar lg:col-span-1 space-y-4">
                        {/* Quick Trade */}
                        <div className="bg-card border rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-[#00001c] mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#00b14f]" /> Quick Trade
                            </h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search stocks, crypto..."
                                    className="w-full bg-muted/50 border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00b14f]"
                                />
                            </div>
                            <div className="space-y-2">
                                {assets.slice(0, 3).map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => openTradeModal(asset, 'buy')}
                                        className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors text-left"
                                    >
                                        <span className="font-medium text-sm">{asset.ticker}</span>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            asset.change > 0 ? "text-green-600" : "text-red-500"
                                        )}>
                                            {asset.change > 0 ? '+' : ''}{asset.change}%
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alerts */}
                        <div className="bg-[#00001c] text-white rounded-2xl p-5">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-[#00ff7f]" /> Price Alerts
                            </h3>
                            <p className="text-white/60 text-sm mb-4">Get notified when prices hit your targets</p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                                Set Alert
                            </button>
                        </div>

                        {/* Sync Button */}
                        <button className="w-full py-3 border-2 border-dashed border-muted-foreground/20 rounded-xl text-muted-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2">
                            <RefreshCcw className="w-4 h-4" /> Sync Portfolio
                        </button>
                    </div>
                </div>
            </div>

            {/* Trade Modal */}
            {modalType && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        {!showSuccess ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-[#00001c]">
                                        {modalType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.ticker}
                                    </h2>
                                    <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">Current Price</span>
                                        <span className="font-bold text-[#00001c]">RM {selectedAsset.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">24h Change</span>
                                        <span className={cn(
                                            "font-medium",
                                            selectedAsset.change > 0 ? "text-green-600" : "text-red-500"
                                        )}>
                                            {selectedAsset.change > 0 ? '+' : ''}{selectedAsset.change}%
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        {modalType === 'buy' ? 'Shares to Buy' : 'Shares to Sell'}
                                    </label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className="w-full border rounded-xl py-3 px-4 text-2xl font-bold text-center outline-none focus:ring-2 focus:ring-[#00b14f]"
                                        autoFocus
                                    />
                                    {modalType === 'sell' && (
                                        <p className="text-sm text-muted-foreground mt-2 text-center">
                                            Available: {selectedAsset.shares} shares
                                        </p>
                                    )}
                                </div>

                                <div className="bg-[#00001c] text-white rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60">Estimated Total</span>
                                        <span className="text-2xl font-bold text-[#00ff7f]">
                                            RM {estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleTrade}
                                    disabled={!quantity || parseFloat(quantity) <= 0 || isProcessing}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-lg transition-all",
                                        quantity && parseFloat(quantity) > 0
                                            ? modalType === 'buy' 
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {isProcessing ? 'Processing...' : `${modalType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset.ticker}`}
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#00001c] mb-2">Order Placed!</h3>
                                <p className="text-muted-foreground mb-6">
                                    {modalType === 'buy' ? 'Bought' : 'Sold'} {quantity} shares of {selectedAsset.ticker}
                                </p>
                                <button onClick={closeModal} className="py-3 px-8 bg-[#00001c] text-white rounded-xl font-bold">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
