"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CreditCard, Plus, ShoppingBag, Coffee, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';

const cards = [
    { type: "Visa", number: "**** 4242", balance: 2450.50, color: "from-[#00001c] to-[#1e1e4a]", textColor: "text-white" },
    { type: "Mastercard", number: "**** 8899", balance: 540.20, color: "from-[#00ff7f] to-[#00cc66]", textColor: "text-[#00001c]" },
];

const transactions = [
    { title: "Apple Store", date: "Today, 10:23 AM", amount: -129.00, icon: ShoppingBag },
    { title: "Starbucks", date: "Yesterday, 8:45 AM", amount: -5.40, icon: Coffee },
    { title: "Uber Trip", date: "Yesterday, 6:30 PM", amount: -24.50, icon: Car },
];

export default function CardsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cardElements = gsap.utils.toArray('.card-3d');
        const listItems = gsap.utils.toArray('.trans-item');
        const header = '.cards-header';

        // Initial States
        gsap.set(header, { autoAlpha: 0, y: -20 });
        gsap.set(cardElements, {
            autoAlpha: 0,
            x: 100,
            rotationY: 45,
            z: -100,
            filter: 'blur(5px)'
        });
        gsap.set(listItems, { autoAlpha: 0, y: 20 });

        // Header
        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "power2.out" });

        // Cards Stagger
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

        // Transactions Stagger
        gsap.to(listItems, {
            delay: 0.6,
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            ease: "back.out(1.7)",
            stagger: 0.1
        });

        // Simple Hover Tilt Effect for Cards
        const cards = document.querySelectorAll('.card-3d');
        cards.forEach((card) => {
            card.addEventListener('mousemove', (e: any) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

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

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-4xl mx-auto">
                <div className="cards-header flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-[#00001c]">My Cards</h1>
                    <button className="bg-[#00001c] text-white p-3 rounded-full hover:bg-[#00001c]/80 transition-colors shadow-lg">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Cards Carousel (Grid for now) */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className={cn(
                                "card-3d relative h-56 rounded-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer bg-gradient-to-br",
                                card.color,
                                card.textColor
                            )}
                        >
                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <p className="opacity-70 text-sm font-medium">Current Balance</p>
                                    <p className="text-3xl font-bold font-mono">${card.balance.toLocaleString()}</p>
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
                                    <p className="text-sm opacity-70">Exp: 12/26</p>
                                    <p className="font-bold text-lg">{card.type}</p>
                                </div>
                            </div>

                            {/* Decorative noise/gradient */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-10 transition-opacity" />
                        </div>
                    ))}

                    {/* Add New Card Placeholder */}
                    <div className="card-3d h-56 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="font-medium">Add New Card</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card rounded-2xl p-6 shadow-sm border">
                    <h2 className="text-lg font-bold text-[#00001c] mb-6">Recent Transactions</h2>
                    <div className="space-y-4">
                        {transactions.map((t, i) => {
                            const Icon = t.icon;
                            return (
                                <div key={i} className="trans-item flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#00001c]">{t.title}</p>
                                            <p className="text-xs text-muted-foreground">{t.date}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-[#00001c]">${Math.abs(t.amount).toFixed(2)}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
