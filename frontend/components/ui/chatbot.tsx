"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageSquare } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hello! I'm your AI Financial Assistant. How can I help you optimize your wealth today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useGSAP(() => {
        const fab = '.chat-fab';
        const window = '.chat-window';
        const content = '.chat-content';

        if (isOpen) {
            // Open Animation
            const tl = gsap.timeline();

            tl.to(fab, {
                scale: 0,
                duration: 0.3,
                ease: "back.in(1.7)"
            })
                .set(window, { display: 'flex' })
                .fromTo(window,
                    { scale: 0.5, opacity: 0, y: 100 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }
                )
                .fromTo(content,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }
                );
        } else {
            // Close Animation logic handled by state unmounting usually, 
            // but for smooth exit we might need to strictly control it. 
            // For simplicity in this demo, we'll just animate the FAB in.
            gsap.fromTo(fab,
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }
            );
        }

    }, { scope: containerRef, dependencies: [isOpen] });

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText("");
        setIsTyping(true);

        // Mock AI Response with delay
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I've analyzed your request. Based on your current spending on 'Grab Food', I suggest reallocating 15% to your investment portfolio. Would you like me to simulate that?",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);

            // Animate new message in
            gsap.fromTo(`.msg-${aiMsg.id}`,
                { opacity: 0, x: -20, scale: 0.9 },
                { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
            );

        }, 1500);
    };

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-50 font-sans">

            {/* Chat Window */}
            <div className={cn(
                "chat-window hidden flex-col w-[350px] md:w-[400px] h-[500px] bg-[#00001c]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden origin-bottom-right transition-all"
            )}>
                {/* Header */}
                <div className="chat-content p-4 bg-gradient-to-r from-[#00001c] to-[#1a1a4a] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00ff7f]/20 flex items-center justify-center border border-[#00ff7f]/30">
                            <Bot className="w-5 h-5 text-[#00ff7f]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">FinAI Assistant</h3>
                            <p className="text-[10px] text-[#00ff7f] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff7f] animate-pulse" /> Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="chat-content flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                `msg-${msg.id} flex w-full`,
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                msg.sender === 'user'
                                    ? "bg-[#00ff7f] text-[#00001c] rounded-br-none"
                                    : "bg-white/10 text-white rounded-bl-none border border-white/5"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 text-white p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-[#00ff7f] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-[#00ff7f] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-[#00ff7f] rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-content p-4 bg-[#00001c] border-t border-white/10">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            className="w-full bg-white border border-white/10 rounded-full px-4 py-3 pr-12 text-sm text-[#00001c] focus:outline-none focus:border-[#00ff7f]/50 transition-colors placeholder:text-black/30"
                            placeholder="Ask about your finances..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-2 p-2 bg-[#00ff7f] rounded-full text-[#00001c] hover:scale-110 transition-transform shadow-[0_0_15px_#00ff7f40]"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "chat-fab absolute bottom-0 right-0 w-16 h-16 bg-[#00ff7f] rounded-full flex items-center justify-center text-[#00001c] shadow-[0_0_30px_#00ff7f60] hover:scale-110 transition-transform z-50",
                    isOpen ? "hidden" : "flex"
                )}
            >
                <MessageSquare className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#00001c]" />
            </button>

        </div>
    );
};
