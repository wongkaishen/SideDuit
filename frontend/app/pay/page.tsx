"use client";

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Scan, Zap, Smartphone, Wifi, Droplets, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/ui/navbar';

const billers = [
    { name: "Electric Co.", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Mobile Plan", icon: Smartphone, color: "bg-blue-100 text-blue-600" },
    { name: "Internet", icon: Wifi, color: "bg-purple-100 text-purple-600" },
    { name: "Water Utils", icon: Droplets, color: "bg-cyan-100 text-cyan-600" },
];

export default function PayPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);

    useGSAP(() => {
        const scanBox = '.scan-box';
        const scanLine = '.scan-line';
        const billerItems = gsap.utils.toArray('.biller-item');
        const header = '.pay-header';

        // Initial States
        gsap.set(header, { autoAlpha: 0, y: -20 });
        gsap.set(scanBox, {
            autoAlpha: 0,
            scale: 0.8,
            rotationX: 10,
            y: 50,
            filter: 'blur(5px)'
        });
        gsap.set(billerItems, {
            autoAlpha: 0,
            x: -20,
            filter: 'blur(5px)'
        });

        // Header
        gsap.to(header, { duration: 0.8, autoAlpha: 1, y: 0, ease: "power2.out" });

        // Scan Box Animation
        const tl = gsap.timeline();
        tl.to(scanBox, {
            duration: 1,
            autoAlpha: 1,
            scale: 1,
            rotationX: 0,
            y: 0,
            filter: 'blur(0px)',
            ease: "expo.out"
        })
            .to(scanLine, { // Continuous scanning animation
                y: 200,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });

        // Billers Stagger
        gsap.to(billerItems, {
            delay: 0.4,
            duration: 0.8,
            autoAlpha: 1,
            x: 0,
            filter: 'blur(0px)',
            ease: "back.out(1.5)",
            stagger: 0.1
        });

    }, { scope: containerRef });

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

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background p-4 pt-20 md:pt-24 perspective-1000">
            <div className="max-w-md mx-auto">
                <div className="pay-header text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#00001c]">Pay Bills</h1>
                    <p className="text-muted-foreground">Scan QR or select a biller</p>
                </div>

                {/* QR Scanner Visual */}
                <div
                    className="scan-box relative aspect-square bg-[#00001c] rounded-3xl overflow-hidden shadow-2xl mb-10 flex items-center justify-center group cursor-pointer"
                    onClick={isScanning ? undefined : startScanner}
                >
                    {/* Camera Video Stream */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn("absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500", isScanning ? "opacity-100" : "opacity-0")}
                    />

                    {/* Placeholder Logic */}
                    {!isScanning && (
                        <>
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#00001c] via-transparent to-[#00001c]/50" />

                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-full">
                                    <Scan className="w-8 h-8 text-[#00ff7f]" />
                                </div>
                                <p className="text-white font-medium text-sm">Tap to Activate Camera</p>
                                {streamError && <p className="text-red-500 text-xs bg-black/50 px-2 py-1 rounded">{streamError}</p>}
                            </div>
                        </>
                    )}

                    {/* Scanner Overlay Frame (Always Visible) */}
                    <div className="absolute inset-10 border-2 border-[#00ff7f]/50 rounded-2xl z-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#00ff7f] -mt-1 -ml-1" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00ff7f] -mt-1 -mr-1" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#00ff7f] -mb-1 -ml-1" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#00ff7f] -mb-1 -mr-1" />
                    </div>

                    {/* Scanning Laser Line */}
                    <div className="scan-line absolute top-10 left-10 right-10 h-0.5 bg-[#00ff7f] shadow-[0_0_20px_#00ff7f] z-20 pointer-events-none" />
                </div>

                {/* Biller List */}
                <div className="space-y-4">
                    <h3 className="pay-header text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 opacity-0">Quick Pay Billers</h3>
                    {billers.map((biller, i) => {
                        const Icon = biller.icon;
                        return (
                            <div key={i} className="biller-item flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted cursor-pointer transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", biller.color)}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-[#00001c]">{biller.name}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-[#00ff7f] transition-all" />
                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    );
}
