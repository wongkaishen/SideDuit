"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        name: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        name: "Upload",
        href: "/upload",
        icon: Upload,
    },
    {
        name: "Analytics",
        href: "/analytics", // Placeholder
        icon: PieChart,
    },
    {
        name: "Retirement",
        href: "/retirement",
        icon: PieChart, // Reusing PieChart for now, or could use another icon if available
    },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Top Navigation */}
            <nav className="hidden md:flex fixed top-0 w-full bg-[#00001c] border-b border-white/10 z-50 px-6 py-3 items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="SideDuit Logo" className="h-8 w-auto object-contain" />
                </div>
                <div className="flex gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-[#00ff7f]",
                                pathname === item.href
                                    ? "text-[#00ff7f]"
                                    : "text-white/70"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#00001c] border-t border-white/10 z-50 pb-safe text-white">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive ? "text-[#00ff7f]" : "text-white/70"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
