"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    ArrowRight, 
    Search, 
    CheckCircle, 
    X, 
    Clock, 
    ArrowUpRight,
    UserPlus,
    Sparkles,
    MessageSquare,
    Shield,
    Loader2,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAllTransactions, fetchDashboardSummary, type Activity, type DashboardSummary } from '@/lib/api';

type Contact = {
    id: number;
    name: string;
    initials: string;
    color: string;
    email: string;
    phone: string;
    lastTransfer?: string;
};

const contacts: Contact[] = [
    { id: 1, name: "Alice M.", initials: "AM", color: "bg-purple-100 text-purple-600", email: "alice@email.com", phone: "+60 12-345 6789" },
    { id: 2, name: "Bob D.", initials: "BD", color: "bg-blue-100 text-blue-600", email: "bob@email.com", phone: "+60 12-987 6543" },
    { id: 3, name: "Charlie", initials: "C", color: "bg-green-100 text-green-600", email: "charlie@email.com", phone: "+60 11-222 3333" },
    { id: 4, name: "Diana P.", initials: "DP", color: "bg-pink-100 text-pink-600", email: "diana@email.com", phone: "+60 13-444 5555" },
    { id: 5, name: "Ethan H.", initials: "EH", color: "bg-yellow-100 text-yellow-600", email: "ethan@email.com", phone: "+60 14-666 7777" },
];

type Step = 'select' | 'amount' | 'confirm' | 'success';

export default function TransferPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<Step>('select');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactions, setTransactions] = useState<Activity[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Get recent transfers (expenses that could be transfers)
    const recentTransfers = transactions
        .filter(tx => tx.transaction_type.toLowerCase() === 'expense')
        .slice(0, 5)
        .map((tx, idx) => ({
            name: contacts[idx % contacts.length].name,
            amount: Math.abs(tx.amount),
            date: new Date(tx.date).toLocaleDateString('en-MY', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            }),
            status: 'completed' as const
        }));

    // Update contacts with last transfer amounts from real data
    const contactsWithTransfers = contacts.map((contact, idx) => {
        const lastTransfer = recentTransfers[idx];
        return {
            ...contact,
            lastTransfer: lastTransfer ? `RM ${lastTransfer.amount.toFixed(2)}` : undefined
        };
    });

    useGSAP(() => {
        if (loading) return;

        const leftPanel = '.transfer-left';
        const rightPanel = '.transfer-right';
        const contactItems = gsap.utils.toArray('.contact-item');
        const historyItems = gsap.utils.toArray('.history-item');

        gsap.set([leftPanel, rightPanel], {
            autoAlpha: 0,
            y: 50,
            rotationX: 10,
            z: -50,
            filter: 'blur(10px)',
            transformPerspective: 1000
        });

        gsap.set(contactItems, { autoAlpha: 0, x: -20, filter: 'blur(5px)' });
        gsap.set(historyItems, { autoAlpha: 0, y: 20 });

        gsap.to([leftPanel, rightPanel], {
            duration: 1.2,
            autoAlpha: 1,
            y: 0,
            z: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.2,
            clearProps: "all"
        });

        gsap.to(contactItems, {
            delay: 0.4,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.7)",
            stagger: 0.08
        });

        gsap.to(historyItems, {
            delay: 0.6,
            duration: 0.6,
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            stagger: 0.1
        });

    }, { scope: containerRef, dependencies: [loading] });

    const filteredContacts = contactsWithTransfers.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setStep('amount');
    };

    const handleAmountSubmit = () => {
        if (parseFloat(amount) > 0) {
            setStep('confirm');
        }
    };

    const handleConfirmTransfer = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setStep('success');
    };

    const handleNewTransfer = () => {
        setStep('select');
        setSelectedContact(null);
        setAmount('');
        setNote('');
    };

    const addQuickAmount = (amt: number) => {
        setAmount(prev => (parseFloat(prev || '0') + amt).toString());
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading transfer data...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8">

                {/* LEFT PANEL: Contacts & History */}
                <div className="transfer-left md:col-span-2 space-y-6">
                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">Income</span>
                                </div>
                                <p className="text-lg font-bold text-green-700">RM {summary.total_income.toFixed(2)}</p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    <span className="text-xs text-red-600 font-medium">Expenses</span>
                                </div>
                                <p className="text-lg font-bold text-red-700">RM {summary.total_expenses.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    {/* Contacts Section */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-[#00001c]">Transfer Money</h1>
                            <button className="p-2 bg-[#00001c] text-white rounded-full hover:bg-[#00001c]/80 transition-colors">
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">Select a recipient to send money</p>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or email"
                                className="w-full bg-muted/50 border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00ff7f]"
                            />
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</p>
                            {filteredContacts.map((contact) => (
                                <div 
                                    key={contact.id} 
                                    onClick={() => handleSelectContact(contact)}
                                    className={cn(
                                        "contact-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group",
                                        selectedContact?.id === contact.id 
                                            ? "bg-[#00001c] text-white" 
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                            selectedContact?.id === contact.id ? "bg-white/20 text-white" : contact.color
                                        )}>
                                            {contact.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{contact.name}</p>
                                            <p className={cn(
                                                "text-xs",
                                                selectedContact?.id === contact.id ? "text-white/60" : "text-muted-foreground"
                                            )}>
                                                {contact.lastTransfer ? `Last: ${contact.lastTransfer}` : 'No previous transfer'}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className={cn(
                                        "w-4 h-4 transition-all",
                                        selectedContact?.id === contact.id 
                                            ? "text-[#00ff7f] translate-x-0 opacity-100" 
                                            : "text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                                    )} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transfer History - Using Real Data */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recent Transfers
                        </h2>
                        {recentTransfers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4 text-sm">No recent transfers</p>
                        ) : (
                            <div className="space-y-3">
                                {recentTransfers.map((transfer, idx) => (
                                    <div key={idx} className="history-item flex items-center justify-between p-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{transfer.name}</p>
                                                <p className="text-xs text-muted-foreground">{transfer.date}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-[#00001c]">-RM {transfer.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Amount & Confirmation */}
                <div className="transfer-right md:col-span-3 bg-[#00001c] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden min-h-[500px] flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff7f] opacity-5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-5 blur-[80px] rounded-full pointer-events-none" />

                    {/* Step: Amount Entry */}
                    {step === 'amount' && selectedContact && (
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <button onClick={() => setStep('select')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold bg-white/20")}>
                                        {selectedContact.initials}
                                    </div>
                                    <div>
                                        <p className="font-bold">{selectedContact.name}</p>
                                        <p className="text-sm text-white/60">{selectedContact.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <p className="text-white/60 text-sm mb-2 font-medium">Enter Amount</p>
                                <div className="relative flex items-center justify-center mb-6">
                                    <span className="text-4xl font-bold text-[#00ff7f] mr-2">RM</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="bg-transparent text-6xl font-bold text-white placeholder-white/20 outline-none w-48 text-center appearance-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-6 w-full max-w-xs">
                                    {[10, 50, 100].map(amt => (
                                        <button 
                                            key={amt} 
                                            onClick={() => addQuickAmount(amt)}
                                            className="py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                                        >
                                            +RM {amt}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-full max-w-sm mb-6">
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Add a note (optional)"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-[#00ff7f]"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAmountSubmit}
                                    disabled={!amount || parseFloat(amount) <= 0}
                                    className={cn(
                                        "w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all",
                                        amount && parseFloat(amount) > 0
                                            ? "bg-[#00ff7f] text-[#00001c] hover:shadow-[0_0_30px_rgba(0,255,127,0.4)] transform hover:scale-[1.02]"
                                            : "bg-white/10 text-white/40 cursor-not-allowed"
                                    )}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Confirm */}
                    {step === 'confirm' && selectedContact && (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                            <div className="text-center mb-8">
                                <p className="text-white/60 text-sm mb-2">Confirm Transfer</p>
                                <p className="text-5xl font-bold text-[#00ff7f] mb-2">RM {parseFloat(amount).toFixed(2)}</p>
                                <p className="text-white/60">to {selectedContact.name}</p>
                            </div>

                            <div className="w-full max-w-sm bg-white/10 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between py-2 border-b border-white/10">
                                    <span className="text-white/60 text-sm">Recipient</span>
                                    <span className="font-medium">{selectedContact.name}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/10">
                                    <span className="text-white/60 text-sm">Amount</span>
                                    <span className="font-bold text-[#00ff7f]">RM {parseFloat(amount).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/10">
                                    <span className="text-white/60 text-sm">Fee</span>
                                    <span className="font-medium text-green-400">FREE</span>
                                </div>
                                {note && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-white/60 text-sm">Note</span>
                                        <span className="font-medium text-sm">{note}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-white/60 text-xs mb-6">
                                <Shield className="w-4 h-4 text-[#00ff7f]" />
                                Secured with 256-bit encryption
                            </div>

                            <div className="flex gap-3 w-full max-w-sm">
                                <button 
                                    onClick={() => setStep('amount')}
                                    className="flex-1 py-4 border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleConfirmTransfer}
                                    disabled={isProcessing}
                                    className="flex-1 py-4 bg-[#00ff7f] text-[#00001c] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(0,255,127,0.4)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-[#00001c]/30 border-t-[#00001c] rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Transfer'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && selectedContact && (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#00ff7f] flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                                <CheckCircle className="w-10 h-10 text-[#00001c]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
                            <p className="text-white/60 mb-4">
                                RM {parseFloat(amount).toFixed(2)} sent to {selectedContact.name}
                            </p>
                            
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8">
                                <Sparkles className="w-4 h-4 text-[#00ff7f]" />
                                <span className="text-sm">Instant transfer completed</span>
                            </div>

                            <button 
                                onClick={handleNewTransfer}
                                className="py-4 px-8 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
                            >
                                Make Another Transfer
                            </button>
                        </div>
                    )}

                    {/* Step: Select (Default) */}
                    {step === 'select' && (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <ArrowUpRight className="w-12 h-12 text-[#00ff7f]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Send Money Instantly</h2>
                            <p className="text-white/60 max-w-xs mb-6">
                                Select a contact from the list to start a transfer. Zero fees for SideDuit users.
                            </p>
                            {summary && (
                                <div className="bg-white/10 rounded-xl p-4 w-full max-w-xs">
                                    <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Available Balance</p>
                                    <p className="text-2xl font-bold text-[#00ff7f]">
                                        RM {(summary.total_income - summary.total_expenses).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
