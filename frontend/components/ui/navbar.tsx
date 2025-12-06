"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, Settings, PieChart } from "lucide-react";
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
        name: "Settings",
        href: "/settings", // Placeholder
        icon: Settings,
    },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Top Navigation */}
            <nav className="hidden md:flex fixed top-0 w-full bg-background border-b z-50 px-6 py-3 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        S
                    </div>
                    <span className="font-bold text-lg">SideDuit</span>
                </div>
                <div className="flex gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 pb-safe">
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
                                    isActive ? "text-primary" : "text-muted-foreground"
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
