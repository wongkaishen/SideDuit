"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    Users, 
    Plus, 
    UserPlus, 
    Settings, 
    ChevronRight,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Crown,
    X,
    Copy,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Member = {
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    avatar: string;
};

type JointAccount = {
    id: number;
    name: string;
    type: 'family' | 'business';
    balance: number;
    members: Member[];
    color: string;
};

const mockAccounts: JointAccount[] = [
    {
        id: 1,
        name: "Family Savings",
        type: "family",
        balance: 15420.50,
        members: [
            { name: "You", email: "you@email.com", role: "owner", avatar: "Y" },
            { name: "Sarah", email: "sarah@email.com", role: "admin", avatar: "S" },
            { name: "James", email: "james@email.com", role: "member", avatar: "J" },
        ],
        color: "from-purple-500 to-pink-500"
    },
    {
        id: 2,
        name: "SideDuit Business",
        type: "business",
        balance: 45230.00,
        members: [
            { name: "You", email: "you@email.com", role: "owner", avatar: "Y" },
            { name: "Partner A", email: "partnera@business.com", role: "admin", avatar: "A" },
        ],
        color: "from-blue-500 to-cyan-500"
    },
];

const recentActivity = [
    { name: "Sarah", action: "deposited", amount: 500, time: "2h ago" },
    { name: "James", action: "withdrew", amount: 120, time: "5h ago" },
    { name: "You", action: "deposited", amount: 1000, time: "1d ago" },
];

export default function JointAccountsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [accounts, setAccounts] = useState<JointAccount[]>(mockAccounts);
    const [selectedAccount, setSelectedAccount] = useState<JointAccount | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    useGSAP(() => {
        const header = '.joint-header';
        const cards = gsap.utils.toArray('.account-card');
        const activityItems = gsap.utils.toArray('.activity-item');

        gsap.set(header, { autoAlpha: 0, y: -30 });
        gsap.set(cards, { 
            autoAlpha: 0, 
            x: -50,
            rotationY: -15,
            filter: 'blur(5px)',
            transformPerspective: 1000
        });
        gsap.set(activityItems, { autoAlpha: 0, x: 20 });

        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "expo.out" });
        
        gsap.to(cards, {
            delay: 0.3,
            duration: 1,
            autoAlpha: 1,
            x: 0,
            rotationY: 0,
            filter: 'blur(0px)',
            ease: "expo.out",
            stagger: 0.15
        });

        gsap.to(activityItems, {
            delay: 0.6,
            duration: 0.6,
            autoAlpha: 1,
            x: 0,
            ease: "power2.out",
            stagger: 0.1
        });

    }, { scope: containerRef });

    const handleInvite = (account: JointAccount) => {
        setSelectedAccount(account);
        setInviteLink(`https://sideduit.com/join/${account.id}/${Math.random().toString(36).substring(7)}`);
        setShowInviteModal(true);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateAccount = () => {
        const newAccount: JointAccount = {
            id: Date.now(),
            name: "New Joint Account",
            type: "family",
            balance: 0,
            members: [
                { name: "You", email: "you@email.com", role: "owner", avatar: "Y" },
            ],
            color: "from-green-500 to-emerald-500"
        };
        setAccounts(prev => [...prev, newAccount]);
    };

    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="joint-header mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-[#00001c] mb-2 flex items-center gap-3">
                                <Users className="w-10 h-10 text-[#00b14f]" />
                                Joint Accounts
                            </h1>
                            <p className="text-muted-foreground">Manage family & business accounts together</p>
                        </div>
                        
                        {/* Total Balance */}
                        <div className="bg-[#00001c] text-white p-4 rounded-2xl shadow-lg">
                            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Combined Balance</p>
                            <p className="text-2xl font-bold text-[#00ff7f]">
                                RM {totalBalance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Accounts List */}
                    <div className="lg:col-span-2 space-y-6">
                        {accounts.map((account) => (
                            <div 
                                key={account.id}
                                className="account-card bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Card Header */}
                                <div className={cn(
                                    "p-6 text-white bg-gradient-to-r relative",
                                    account.color
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                                    
                                    <div className="flex items-start justify-between relative z-10">
                                        <div>
                                            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                                                {account.type === 'family' ? '👨‍👩‍👧‍👦 Family' : '💼 Business'}
                                            </span>
                                            <h3 className="text-2xl font-bold mt-1">{account.name}</h3>
                                        </div>
                                        <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-sm opacity-80">Balance</p>
                                        <p className="text-3xl font-bold font-mono">
                                            RM {account.balance.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Members */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Members ({account.members.length})
                                        </p>
                                        <button 
                                            onClick={() => handleInvite(account)}
                                            className="flex items-center gap-1 text-sm font-medium text-[#00b14f] hover:underline"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Invite
                                        </button>
                                    </div>

                                    <div className="flex items-center">
                                        {account.members.slice(0, 4).map((member, idx) => (
                                            <div 
                                                key={idx}
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white",
                                                    idx > 0 && "-ml-3",
                                                    member.role === 'owner' ? "bg-amber-500" : 
                                                    member.role === 'admin' ? "bg-purple-500" : "bg-blue-500"
                                                )}
                                                title={`${member.name} (${member.role})`}
                                            >
                                                {member.avatar}
                                                {member.role === 'owner' && (
                                                    <Crown className="w-3 h-3 absolute -top-1 -right-1 text-amber-400" />
                                                )}
                                            </div>
                                        ))}
                                        {account.members.length > 4 && (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm -ml-3 border-2 border-white">
                                                +{account.members.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-6 flex gap-3">
                                        <button className="flex-1 py-3 bg-[#00001c] text-white rounded-xl font-medium hover:bg-[#00001c]/80 transition-colors flex items-center justify-center gap-2">
                                            <Wallet className="w-4 h-4" />
                                            Deposit
                                        </button>
                                        <button className="flex-1 py-3 border-2 border-[#00001c] text-[#00001c] rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                                            <ArrowUpRight className="w-4 h-4" />
                                            Transfer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Create New Account */}
                        <div 
                            onClick={handleCreateAccount}
                            className="account-card border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8" />
                            </div>
                            <p className="font-bold text-lg">Create Joint Account</p>
                            <p className="text-sm">For family or business use</p>
                        </div>
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border sticky top-24">
                            <h3 className="text-lg font-bold text-[#00001c] mb-4 flex items-center gap-2">
                                <ArrowUpRight className="w-5 h-5 text-[#00b14f]" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <div 
                                        key={idx} 
                                        className="activity-item flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                activity.action === 'deposited' 
                                                    ? "bg-green-100 text-green-600" 
                                                    : "bg-red-100 text-red-600"
                                            )}>
                                                {activity.action === 'deposited' 
                                                    ? <ArrowUpRight className="w-4 h-4" />
                                                    : <ArrowDownRight className="w-4 h-4" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#00001c]">
                                                    {activity.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.action} • {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={cn(
                                            "font-bold text-sm",
                                            activity.action === 'deposited' ? "text-green-600" : "text-red-600"
                                        )}>
                                            {activity.action === 'deposited' ? '+' : '-'}RM {activity.amount}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-3 text-sm font-medium text-muted-foreground hover:text-[#00001c] transition-colors flex items-center justify-center gap-1">
                                View All Activity
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && selectedAccount && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#00001c]">Invite Members</h2>
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-muted-foreground mb-6">
                                Share this link to invite people to <strong>{selectedAccount.name}</strong>
                            </p>

                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="flex-1 bg-muted/50 border rounded-xl py-3 px-4 text-sm outline-none"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className={cn(
                                        "px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
                                        copied 
                                            ? "bg-green-500 text-white" 
                                            : "bg-[#00001c] text-white hover:bg-[#00001c]/80"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">
                                    Link expires in 7 days. New members will have limited access until approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

