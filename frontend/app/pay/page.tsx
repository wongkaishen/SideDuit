"use client";

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    Scan, 
    Zap, 
    Smartphone, 
    Wifi, 
    Droplets, 
    ArrowRight,
    X,
    CheckCircle,
    Clock,
    Calendar,
    CreditCard,
    Building2,
    Car,
    Tv,
    FileText,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAllTransactions, type Activity } from '@/lib/api';

type Biller = {
    id: number;
    name: string;
    icon: React.ElementType;
    color: string;
    category: string;
    accountNumber?: string;
    lastPaid?: string;
};

const billers: Biller[] = [
    { id: 1, name: "TNB Electric", icon: Zap, color: "bg-yellow-100 text-yellow-600", category: "Utilities", accountNumber: "1234-5678-90" },
    { id: 2, name: "Maxis Mobile", icon: Smartphone, color: "bg-blue-100 text-blue-600", category: "Telco", accountNumber: "012-345-6789" },
    { id: 3, name: "Unifi Internet", icon: Wifi, color: "bg-purple-100 text-purple-600", category: "Telco", accountNumber: "UN-8765432" },
    { id: 4, name: "Air Selangor", icon: Droplets, color: "bg-cyan-100 text-cyan-600", category: "Utilities", accountNumber: "AS-9876543" },
    { id: 5, name: "Astro", icon: Tv, color: "bg-red-100 text-red-600", category: "Entertainment", accountNumber: "AST-1234567" },
    { id: 6, name: "Touch n Go", icon: Car, color: "bg-indigo-100 text-indigo-600", category: "Transport", accountNumber: "TNG-9999888" },
    { id: 7, name: "Maybank Loan", icon: Building2, color: "bg-amber-100 text-amber-600", category: "Finance", accountNumber: "LN-5555666" },
];

type Step = 'select' | 'amount' | 'confirm' | 'success';

export default function PayPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('select');
    const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'billers' | 'scheduled' | 'history'>('billers');
    const [transactions, setTransactions] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch real transactions from API
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const txData = await fetchAllTransactions();
                setTransactions(txData);
            } catch (error) {
                console.error('Error loading transactions:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Get expense transactions as "payment history"
    const paymentHistory = transactions
        .filter(tx => tx.transaction_type.toLowerCase() === 'expense')
        .slice(0, 10)
        .map(tx => ({
            name: tx.document_name?.replace(/\.[^/.]+$/, '') || 'Payment',
            amount: Math.abs(tx.amount),
            date: new Date(tx.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }),
            status: 'completed' as const
        }));

    // Create scheduled payments from last expense amounts (simulated)
    const scheduledPayments = paymentHistory.slice(0, 3).map((payment, idx) => ({
        name: billers[idx % billers.length].name,
        amount: payment.amount,
        dueDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }),
        status: 'upcoming' as const
    }));

    useGSAP(() => {
        if (loading) return;

        const scanBox = '.scan-box';
        const scanLine = '.scan-line';
        const billerItems = gsap.utils.toArray('.biller-item');
        const header = '.pay-header';
        const sidebar = '.pay-sidebar';

        gsap.set(header, { autoAlpha: 0, y: -20 });
        gsap.set(scanBox, {
            autoAlpha: 0,
            scale: 0.9,
            y: 30,
            filter: 'blur(5px)'
        });
        gsap.set(sidebar, { autoAlpha: 0, x: 30 });
        gsap.set(billerItems, { autoAlpha: 0, x: -20, filter: 'blur(5px)' });

        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "power2.out" });
        gsap.to(scanBox, {
            delay: 0.2,
            duration: 1,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out"
        });
        gsap.to(sidebar, { delay: 0.3, duration: 0.8, autoAlpha: 1, x: 0, ease: "expo.out" });

        gsap.to(scanLine, {
            y: 180,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        gsap.to(billerItems, {
            delay: 0.5,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.5)",
            stagger: 0.08
        });

    }, { scope: containerRef, dependencies: [loading, activeTab] });

    const startScanner = async () => {
        if (isScanning) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsScanning(true);
                setStreamError(null);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setStreamError("Camera access denied or unavailable.");
        }
    };

    const stopScanner = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsScanning(false);
        }
    };

    React.useEffect(() => {
        return () => { stopScanner(); };
    }, []);

    const handleSelectBiller = (biller: Biller) => {
        // Find last payment amount for this category
        const lastPayment = paymentHistory.find(p => 
            p.name.toLowerCase().includes(biller.category.toLowerCase()) ||
            p.name.toLowerCase().includes(biller.name.split(' ')[0].toLowerCase())
        );
        
        setSelectedBiller({
            ...biller,
            lastPaid: lastPayment ? `RM ${lastPayment.amount.toFixed(2)}` : undefined
        });
        setStep('amount');
    };

    const handleAmountSubmit = () => {
        if (parseFloat(amount) > 0) {
            setStep('confirm');
        }
    };

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setStep('success');
    };

    const handleNewPayment = () => {
        setStep('select');
        setSelectedBiller(null);
        setAmount('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-4 pt-20 md:pt-24 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading payment history...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-6xl mx-auto">
                <div className="pay-header text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#00001c]">Pay Bills</h1>
                    <p className="text-muted-foreground">Scan QR code or select a biller to pay</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* QR Scanner */}
                        <div
                            className="scan-box relative aspect-video bg-[#00001c] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center group cursor-pointer"
                            onClick={isScanning ? stopScanner : startScanner}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={cn("absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500", isScanning ? "opacity-100" : "opacity-0")}
                            />

                            {!isScanning && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00001c] via-[#1a1a4a] to-[#00001c]" />
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <div className="p-4 bg-[#00ff7f]/20 backdrop-blur-md rounded-full">
                                            <Scan className="w-10 h-10 text-[#00ff7f]" />
                                        </div>
                                        <p className="text-white font-bold text-lg">Tap to Scan QR Code</p>
                                        <p className="text-white/60 text-sm">Point camera at any payment QR</p>
                                        {streamError && <p className="text-red-400 text-xs bg-black/50 px-3 py-1 rounded-full">{streamError}</p>}
                                    </div>
                                </>
                            )}

                            {isScanning && (
                                <div className="absolute top-4 right-4 z-30">
                                    <button className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors">
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            )}

                            <div className="absolute inset-8 border-2 border-[#00ff7f]/50 rounded-2xl z-20 pointer-events-none">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#00ff7f] -mt-1 -ml-1 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#00ff7f] -mt-1 -mr-1 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#00ff7f] -mb-1 -ml-1 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#00ff7f] -mb-1 -mr-1 rounded-br-lg" />
                            </div>
                            <div className="scan-line absolute top-8 left-8 right-8 h-1 bg-[#00ff7f] shadow-[0_0_20px_#00ff7f] rounded-full z-20 pointer-events-none" />
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                            {(['billers', 'scheduled', 'history'] as const).map((tab) => (
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
                                    {tab === 'scheduled' ? 'Scheduled' : tab}
                                </button>
                            ))}
                        </div>

                        {/* Billers List */}
                        {activeTab === 'billers' && (
                            <div className="grid sm:grid-cols-2 gap-3">
                                {billers.map((biller) => {
                                    const Icon = biller.icon;
                                    return (
                                        <div 
                                            key={biller.id} 
                                            onClick={() => handleSelectBiller(biller)}
                                            className="biller-item flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted cursor-pointer transition-all group hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", biller.color)}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#00001c]">{biller.name}</p>
                                                    <p className="text-xs text-muted-foreground">{biller.category}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-[#00b14f] transition-all" />
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Scheduled Payments */}
                        {activeTab === 'scheduled' && (
                            <div className="space-y-3">
                                {scheduledPayments.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No scheduled payments</p>
                                ) : (
                                    scheduledPayments.map((payment, idx) => (
                                        <div key={idx} className="biller-item flex items-center justify-between p-4 bg-card border rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#00001c]">{payment.name}</p>
                                                    <p className="text-xs text-muted-foreground">Due: {payment.dueDate}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#00001c]">RM {payment.amount.toFixed(2)}</p>
                                                <button className="text-xs text-[#00b14f] font-medium hover:underline">Pay Now</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Payment History - Using Real Data */}
                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                {paymentHistory.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No payment history yet</p>
                                ) : (
                                    paymentHistory.map((payment, idx) => (
                                        <div key={idx} className="biller-item flex items-center justify-between p-4 bg-card border rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#00001c]">{payment.name}</p>
                                                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-[#00001c]">RM {payment.amount.toFixed(2)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Payment Flow */}
                    <div className="pay-sidebar lg:col-span-1">
                        <div className="bg-[#00001c] rounded-2xl p-6 text-white sticky top-24 min-h-[400px] flex flex-col">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff7f] opacity-10 blur-[60px] rounded-full pointer-events-none" />

                            {/* Amount Entry */}
                            {step === 'amount' && selectedBiller && (
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <button onClick={() => setStep('select')} className="p-2 hover:bg-white/10 rounded-full">
                                            <X className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm text-white/60">Pay Bill</span>
                                    </div>

                                    <div className="text-center mb-6">
                                        <p className="font-bold text-lg">{selectedBiller.name}</p>
                                        <p className="text-sm text-white/60">{selectedBiller.accountNumber}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="relative flex items-center justify-center mb-6">
                                            <span className="text-2xl font-bold text-[#00ff7f] mr-2">RM</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0"
                                                className="bg-transparent text-5xl font-bold text-white placeholder-white/20 outline-none w-32 text-center"
                                                autoFocus
                                            />
                                        </div>

                                        {selectedBiller.lastPaid && (
                                            <button 
                                                onClick={() => setAmount(selectedBiller.lastPaid!.replace('RM ', ''))}
                                                className="text-sm text-[#00ff7f] mb-6 hover:underline"
                                            >
                                                Use last amount: {selectedBiller.lastPaid}
                                            </button>
                                        )}

                                        <button 
                                            onClick={handleAmountSubmit}
                                            disabled={!amount || parseFloat(amount) <= 0}
                                            className={cn(
                                                "w-full py-3 rounded-xl font-bold transition-all",
                                                amount && parseFloat(amount) > 0
                                                    ? "bg-[#00ff7f] text-[#00001c]"
                                                    : "bg-white/10 text-white/40 cursor-not-allowed"
                                            )}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Confirm */}
                            {step === 'confirm' && selectedBiller && (
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                                    <p className="text-4xl font-bold text-[#00ff7f] mb-2">RM {parseFloat(amount).toFixed(2)}</p>
                                    <p className="text-white/60 mb-6">to {selectedBiller.name}</p>

                                    <div className="w-full bg-white/10 rounded-xl p-4 mb-6 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Account</span>
                                            <span>{selectedBiller.accountNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Fee</span>
                                            <span className="text-green-400">FREE</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => setStep('amount')} className="flex-1 py-3 border border-white/20 rounded-xl">
                                            Back
                                        </button>
                                        <button 
                                            onClick={handleConfirmPayment}
                                            disabled={isProcessing}
                                            className="flex-1 py-3 bg-[#00ff7f] text-[#00001c] rounded-xl font-bold"
                                        >
                                            {isProcessing ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Success */}
                            {step === 'success' && selectedBiller && (
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#00ff7f] flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-[#00001c]" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                                    <p className="text-white/60 text-sm mb-6">
                                        RM {parseFloat(amount).toFixed(2)} paid to {selectedBiller.name}
                                    </p>
                                    <button onClick={handleNewPayment} className="py-3 px-6 bg-white/10 rounded-xl font-medium">
                                        Make Another Payment
                                    </button>
                                </div>
                            )}

                            {/* Default State */}
                            {step === 'select' && (
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                        <CreditCard className="w-8 h-8 text-[#00ff7f]" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Quick Pay</h3>
                                    <p className="text-white/60 text-sm mb-4">
                                        Scan a QR code or select a biller from the list to start
                                    </p>
                                    {paymentHistory.length > 0 && (
                                        <div className="w-full bg-white/10 rounded-xl p-4 text-left">
                                            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Last Payment</p>
                                            <p className="font-bold">{paymentHistory[0].name}</p>
                                            <p className="text-[#00ff7f] font-bold">RM {paymentHistory[0].amount.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
