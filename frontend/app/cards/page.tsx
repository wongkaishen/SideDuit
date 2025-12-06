"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    CreditCard, 
    Plus, 
    ShoppingBag, 
    Coffee, 
    Car,
    Plane,
    Utensils,
    ShoppingCart,
    Settings,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Copy,
    Check,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    X,
    ChevronRight,
    FileText,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAllTransactions, fetchDashboardSummary, type Activity, type DashboardSummary } from '@/lib/api';

type Card = {
    id: number;
    type: string;
    number: string;
    balance: number;
    limit: number;
    color: string;
    textColor: string;
    expiry: string;
    cvv: string;
    frozen: boolean;
};

// Get icon based on transaction name/category
const getTransactionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('grab') || lowerName.includes('uber') || lowerName.includes('car') || lowerName.includes('petrol') || lowerName.includes('fuel')) return Car;
    if (lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('makan')) return Utensils;
    if (lowerName.includes('coffee') || lowerName.includes('starbucks') || lowerName.includes('cafe')) return Coffee;
    if (lowerName.includes('shop') || lowerName.includes('store') || lowerName.includes('mall')) return ShoppingBag;
    if (lowerName.includes('air') || lowerName.includes('flight') || lowerName.includes('travel')) return Plane;
    if (lowerName.includes('lazada') || lowerName.includes('shopee') || lowerName.includes('online')) return ShoppingCart;
    return FileText;
};

// Get category from transaction
const getTransactionCategory = (name: string, type: string) => {
    const lowerName = name.toLowerCase();
    if (type.toLowerCase() === 'income') return 'Income';
    if (lowerName.includes('grab') || lowerName.includes('uber') || lowerName.includes('car') || lowerName.includes('petrol')) return 'Transport';
    if (lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('coffee') || lowerName.includes('makan')) return 'Food & Drink';
    if (lowerName.includes('shop') || lowerName.includes('store') || lowerName.includes('lazada') || lowerName.includes('shopee')) return 'Shopping';
    if (lowerName.includes('air') || lowerName.includes('flight') || lowerName.includes('travel')) return 'Travel';
    if (lowerName.includes('bill') || lowerName.includes('electric') || lowerName.includes('water') || lowerName.includes('internet')) return 'Utilities';
    return 'Other';
};

export default function CardsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [transactions, setTransactions] = useState<Activity[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'transactions' | 'spending'>('transactions');

    // Fetch real data from API
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [txData, summaryData] = await Promise.all([
                    fetchAllTransactions(),
                    fetchDashboardSummary()
                ]);
                
                setTransactions(txData);
                setSummary(summaryData);

                // Create cards based on real expense data
                const totalExpenses = summaryData.total_expenses;
                const cardsData: Card[] = [
                    { 
                        id: 1, 
                        type: "Visa Platinum", 
                        number: "4532 •••• •••• 4242", 
                        balance: totalExpenses * 0.7, // 70% of expenses on this card
                        limit: 10000, 
                        color: "from-[#00001c] to-[#1e1e4a]", 
                        textColor: "text-white", 
                        expiry: "12/26", 
                        cvv: "***", 
                        frozen: false 
                    },
                    { 
                        id: 2, 
                        type: "Mastercard Gold", 
                        number: "5412 •••• •••• 8899", 
                        balance: totalExpenses * 0.3, // 30% of expenses on this card
                        limit: 5000, 
                        color: "from-[#00ff7f] to-[#00cc66]", 
                        textColor: "text-[#00001c]", 
                        expiry: "08/25", 
                        cvv: "***", 
                        frozen: false 
                    },
                ];
                setCards(cardsData);
                
            } catch (error) {
                console.error('Error loading card data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useGSAP(() => {
        if (loading) return;

        const cardElements = gsap.utils.toArray('.card-3d');
        const listItems = gsap.utils.toArray('.trans-item');
        const header = '.cards-header';
        const sidebar = '.cards-sidebar';

        gsap.set(header, { autoAlpha: 0, y: -20 });
        gsap.set(cardElements, {
            autoAlpha: 0,
            x: 100,
            rotationY: 45,
            z: -100,
            filter: 'blur(5px)'
        });
        gsap.set(listItems, { autoAlpha: 0, y: 20 });
        gsap.set(sidebar, { autoAlpha: 0, x: 30 });

        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "power2.out" });

        gsap.to(cardElements, {
            duration: 1.2,
            autoAlpha: 1,
            x: 0,
            rotationY: 0,
            z: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.15
        });

        gsap.to(sidebar, { delay: 0.4, duration: 0.8, autoAlpha: 1, x: 0, ease: "expo.out" });

        gsap.to(listItems, {
            delay: 0.6,
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            ease: "back.out(1.7)",
            stagger: 0.08
        });

        // Hover effect
        const cardEls = document.querySelectorAll('.card-3d');
        cardEls.forEach((card) => {
            card.addEventListener('mousemove', (e: any) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.2,
                    ease: "power1.out",
                    transformPerspective: 1000
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });

    }, { scope: containerRef, dependencies: [loading] });

    const toggleFreeze = (cardId: number) => {
        setCards(prev => prev.map(c => 
            c.id === cardId ? { ...c, frozen: !c.frozen } : c
        ));
    };

    const handleCopyNumber = (number: string) => {
        navigator.clipboard.writeText(number.replace(/[•\s]/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate spending by category from real transactions
    const getSpendingByCategory = () => {
        const categories: Record<string, number> = {};
        
        transactions.forEach(tx => {
            if (tx.transaction_type.toLowerCase() === 'expense') {
                const category = getTransactionCategory(tx.document_name || '', tx.transaction_type);
                categories[category] = (categories[category] || 0) + Math.abs(tx.amount);
            }
        });

        const total = Object.values(categories).reduce((a, b) => a + b, 0);
        const colors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-amber-500'];
        
        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([name, amount], idx) => ({
                name,
                amount,
                percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
                color: colors[idx % colors.length]
            }));
    };

    const spendingCategories = getSpendingByCategory();
    const totalSpending = summary?.total_expenses || 0;

    // Format transactions for display
    const formattedTransactions = transactions.slice(0, 20).map((tx, idx) => ({
        id: tx.id,
        title: tx.document_name?.replace(/\.[^/.]+$/, '') || `${tx.transaction_type} Transaction`,
        date: new Date(tx.date).toLocaleDateString('en-MY', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        amount: tx.transaction_type.toLowerCase() === 'income' ? Math.abs(tx.amount) : -Math.abs(tx.amount),
        icon: getTransactionIcon(tx.document_name || ''),
        category: getTransactionCategory(tx.document_name || '', tx.transaction_type),
        cardId: idx % 2 === 0 ? 1 : 2, // Distribute between cards
        type: tx.transaction_type
    }));

    const cardTransactions = selectedCard 
        ? formattedTransactions.filter(t => t.cardId === selectedCard.id)
        : formattedTransactions;

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your cards...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-6xl mx-auto">
                <div className="cards-header flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#00001c]">My Cards</h1>
                        <p className="text-muted-foreground">Manage your cards and spending</p>
                    </div>
                    <button className="bg-[#00001c] text-white p-3 rounded-full hover:bg-[#00001c]/80 transition-colors shadow-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cards & Transactions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => setSelectedCard(card)}
                                    className={cn(
                                        "card-3d relative h-56 rounded-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer bg-gradient-to-br transition-all",
                                        card.color,
                                        card.textColor,
                                        card.frozen && "grayscale opacity-60",
                                        selectedCard?.id === card.id && "ring-4 ring-[#00ff7f] ring-offset-2"
                                    )}
                                >
                                    {card.frozen && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                                            <div className="bg-white/90 text-[#00001c] px-4 py-2 rounded-full flex items-center gap-2 font-bold">
                                                <Lock className="w-4 h-4" /> Card Frozen
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start z-10">
                                        <div>
                                            <p className="opacity-70 text-sm font-medium">Total Spent</p>
                                            <p className="text-3xl font-bold font-mono">RM {card.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            <p className="text-xs opacity-60 mt-1">Limit: RM {card.limit.toLocaleString()}</p>
                                        </div>
                                        <CreditCard className="opacity-50 w-8 h-8" />
                                    </div>

                                    <div className="z-10">
                                        <div className="flex gap-4 mb-2">
                                            <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
                                            <div className="w-8 h-6 border border-white/20 rounded-full" />
                                        </div>
                                        <p className="font-mono text-lg tracking-widest opacity-90">{card.number}</p>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-sm opacity-70">Exp: {card.expiry}</p>
                                            <p className="font-bold text-lg">{card.type}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Card */}
                            <div className="card-3d h-56 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <p className="font-medium">Add New Card</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                            {(['transactions', 'spending'] as const).map((tab) => (
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

                        {/* Transactions */}
                        {activeTab === 'transactions' && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border">
                                <h2 className="text-lg font-bold text-[#00001c] mb-4">
                                    {selectedCard ? `${selectedCard.type} Transactions` : 'All Transactions'}
                                </h2>
                                {cardTransactions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {cardTransactions.map((t) => {
                                            const Icon = t.icon;
                                            return (
                                                <div key={t.id} className="trans-item flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                                            t.type.toLowerCase() === 'income' 
                                                                ? "bg-green-100 text-green-600" 
                                                                : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {t.type.toLowerCase() === 'income' 
                                                                ? <TrendingUp className="w-6 h-6" />
                                                                : <Icon className="w-6 h-6" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-[#00001c]">{t.title}</p>
                                                            <p className="text-xs text-muted-foreground">{t.category} • {t.date}</p>
                                                        </div>
                                                    </div>
                                                    <span className={cn(
                                                        "font-bold",
                                                        t.amount > 0 ? "text-green-600" : "text-[#00001c]"
                                                    )}>
                                                        {t.amount > 0 ? '+' : '-'}RM {Math.abs(t.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Spending Analysis */}
                        {activeTab === 'spending' && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-[#00001c]">Spending by Category</h2>
                                    <span className="text-sm text-muted-foreground">Based on your transactions</span>
                                </div>
                                
                                {spendingCategories.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No expense data yet</p>
                                ) : (
                                    <>
                                        <div className="mb-6">
                                            <div className="flex h-4 rounded-full overflow-hidden gap-1">
                                                {spendingCategories.map((cat, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={cn("transition-all", cat.color)}
                                                        style={{ width: `${cat.percentage}%` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {spendingCategories.map((cat, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                                                        <span className="font-medium text-[#00001c]">{cat.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-[#00001c]">RM {cat.amount.toFixed(2)}</span>
                                                        <span className="text-sm text-muted-foreground ml-2">({cat.percentage}%)</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-[#00001c]">Total Expenses</span>
                                                <span className="text-xl font-bold text-[#00001c]">RM {totalSpending.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Card Details */}
                    <div className="cards-sidebar lg:col-span-1">
                        <div className="bg-[#00001c] text-white rounded-2xl p-6 sticky top-24">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[#00ff7f]" />
                                {selectedCard ? 'Card Settings' : 'Quick Actions'}
                            </h3>

                            {selectedCard ? (
                                <div className="space-y-4">
                                    {/* Card Details */}
                                    <div className="bg-white/10 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm">Card Number</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono">{showDetails ? '4532 1234 5678 4242' : selectedCard.number}</span>
                                                <button 
                                                    onClick={() => handleCopyNumber(selectedCard.number)}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm">Expiry</span>
                                            <span>{selectedCard.expiry}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm">CVV</span>
                                            <span>{showDetails ? '123' : '***'}</span>
                                        </div>
                                    </div>

                                    {/* Toggle Details */}
                                    <button 
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        {showDetails ? 'Hide Details' : 'Show Details'}
                                    </button>

                                    {/* Freeze Card */}
                                    <button 
                                        onClick={() => toggleFreeze(selectedCard.id)}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                                            selectedCard.frozen 
                                                ? "bg-[#00ff7f] text-[#00001c]" 
                                                : "bg-red-500 text-white hover:bg-red-600"
                                        )}
                                    >
                                        {selectedCard.frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        {selectedCard.frozen ? 'Unfreeze Card' : 'Freeze Card'}
                                    </button>

                                    {/* Spending Limit */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/60">Spending Limit</span>
                                            <span className="text-[#00ff7f]">{((selectedCard.balance / selectedCard.limit) * 100).toFixed(0)}% used</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#00ff7f] rounded-full transition-all"
                                                style={{ width: `${Math.min((selectedCard.balance / selectedCard.limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/40">
                                            RM {selectedCard.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} / RM {selectedCard.limit.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* More Options */}
                                    <button className="w-full py-3 border border-white/20 hover:bg-white/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                                        <Settings className="w-4 h-4" /> Card Settings
                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm">Select a card to view settings and manage your spending.</p>
                                    
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <TrendingDown className="w-5 h-5 text-red-400" />
                                            <span className="font-medium">Total Expenses</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-400">RM {totalSpending.toFixed(2)}</p>
                                        <p className="text-xs text-white/40 mt-1">From all transactions</p>
                                    </div>

                                    {summary && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <TrendingUp className="w-5 h-5 text-[#00ff7f]" />
                                                <span className="font-medium">Total Income</span>
                                            </div>
                                            <p className="text-2xl font-bold text-[#00ff7f]">RM {summary.total_income.toFixed(2)}</p>
                                            <p className="text-xs text-white/40 mt-1">From all transactions</p>
                                        </div>
                                    )}

                                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-amber-400 mb-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-medium text-sm">Tip</span>
                                        </div>
                                        <p className="text-sm text-white/70">
                                            Freeze your card instantly if you suspect unauthorized activity.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
