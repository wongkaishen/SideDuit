"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';

// Mock Contacts Data
const contacts = [
    { name: "Alice M.", initials: "AM", color: "bg-purple-100 text-purple-600" },
    { name: "Bob D.", initials: "BD", color: "bg-blue-100 text-blue-600" },
    { name: "Charlie", initials: "C", color: "bg-green-100 text-green-600" },
    { name: "Diana P.", initials: "DP", color: "bg-pink-100 text-pink-600" },
    { name: "Ethan H.", initials: "EH", color: "bg-yellow-100 text-yellow-600" },
];

export default function TransferPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Elements to animate
        const leftPanel = '.transfer-left';
        const rightPanel = '.transfer-right';
        const contactItems = gsap.utils.toArray('.contact-item');

        // Initial States
        gsap.set([leftPanel, rightPanel], {
            autoAlpha: 0,
            y: 50,
            rotationX: 10,
            z: -50,
            filter: 'blur(10px)',
            transformPerspective: 1000
        });

        gsap.set(contactItems, {
            autoAlpha: 0,
            x: -20,
            filter: 'blur(5px)'
        });

        // Panel Animations
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

        // Contacts Stagger
        gsap.to(contactItems, {
            delay: 0.4,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.7)",
            stagger: 0.1
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            {/* Navbar is global in layout, but ensuring we have context */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

                {/* LEFT PANEL: Contacts */}
                <div className="transfer-left bg-card border rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#00001c] mb-2">Transfer Money</h1>
                        <p className="text-muted-foreground text-sm mb-6">Select a contact or search for a new recipient.</p>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search name, email, or phone"
                                className="w-full bg-muted/50 border rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00ff7f]"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Contacts</p>
                            {contacts.map((contact, i) => (
                                <div key={i} className="contact-item flex items-center justify-between p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", contact.color)}>
                                            {contact.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#00001c]">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground">User • Free Transfer</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00ff7f] transition-colors opacity-0 group-hover:opacity-100 px-0 transform group-hover:translate-x-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Input */}
                <div className="transfer-right bg-[#00001c] text-white rounded-2xl p-8 shadow-xl flex flex-col justify-center items-center relative overflow-hidden">
                    {/* Background Decorative Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff7f] opacity-5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="w-full max-w-sm text-center z-10">
                        <p className="text-white/60 text-sm mb-2 font-medium">Enter Amount</p>
                        <div className="relative flex items-center justify-center mb-8">
                            <span className="text-4xl font-bold text-[#00ff7f] mr-2">$</span>
                            <input
                                type="number"
                                placeholder="0"
                                className="bg-transparent text-6xl font-bold text-white placeholder-white/20 outline-none w-full text-center appearance-none"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-8">
                            {[10, 50, 100].map(amt => (
                                <button key={amt} className="py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                                    +${amt}
                                </button>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-[#00ff7f] text-[#00001c] font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(0,255,127,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            Send Money
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
