"use client";

import React from 'react';
import { FinancialDashboard } from '@/components/ui/financial-dashboard';

// Import Lucide icons for the demo
import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  LineChart,
  ShieldCheck,
  SwitchCamera,
  Target,
  TrendingUp,
  Users,
  FileText,
  Zap,
} from 'lucide-react';

// --- Fallback Icon for Logo ---
const LogoIcon = ({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) => (
  <div
    className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-white text-sm ${className}`}
  >
    {letter}
  </div>
);

// --- DEMO DATA ---
const quickActionsData = [
  { icon: ArrowLeftRight, title: 'Transfer', description: 'Send Money', href: '/transfer' },
  { icon: Landmark, title: 'Pay', description: 'Bills & Payments', href: '/pay' },
  { icon: TrendingUp, title: 'Invest', description: 'Grow Wealth', href: '/invest' },
  { icon: CreditCard, title: 'Cards', description: 'Manage Cards', href: '/cards' },
];

const recentActivityData = [
  {
    icon: FileText,
    title: 'Upwork Freelance Payout',
    time: 'Processed 5 mins ago',
    amount: 850.00,
  },
  {
    icon: Zap,
    title: 'AWS Server Hosting',
    time: 'Yesterday, 8:30 PM',
    amount: -84.20,
  },
  {
    icon: <LogoIcon letter="A" className="bg-[#FF0000]" />, // Adobe Red
    title: 'Adobe Creative Cloud',
    time: '2 hours ago',
    amount: -54.99,
  },
  {
    icon: <LogoIcon letter="G" className="bg-[#00b14f]" />,
    title: 'Grab Driver Cashout',
    time: '1 day ago',
    amount: 120.50,
  },
  {
    icon: <LogoIcon letter="C" className="bg-blue-600" />,
    title: 'Consulting Invoice #402',
    time: '2 days ago',
    amount: 2500.00,
  },
];

const financialServicesData = [
  {
    icon: ShieldCheck,
    title: 'Wealth Management',
    description: 'Investment portfolios & advisory',
    isPremium: true,
    href: '/invest',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set & track financial goals',
    hasAction: true,
  },
  {
    icon: SwitchCamera,
    title: 'Cash Flow',
    description: 'Income & expense analysis',
  },
  {
    icon: Users,
    title: 'Joint Accounts',
    description: 'Family & business accounts',
  },
];

const summaryData = {
  totalIncome: 5450.00,
  totalExpenses: 2315.99,
  estimatedTaxes: 1245.00,
}

// --- DEMO COMPONENT ---
export default function FinancialDashboardDemo() {
  return (
    <div className="bg-background min-h-screen p-4 md:p-8 pt-20 md:pt-24 flex flex-col items-center">
      <FinancialDashboard
        quickActions={quickActionsData}
        recentActivity={recentActivityData}
        financialServices={financialServicesData}
        summary={summaryData}
      />
    </div>
  );
}