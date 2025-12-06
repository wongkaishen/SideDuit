"use client";

import React from 'react';
import { FinancialDashboard } from '@/components/ui/financial-dashboard';
import { TextEffect } from '@/components/ui/text-effect';

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
  { icon: ArrowLeftRight, title: 'Transfer', description: 'Send Money' },
  { icon: Landmark, title: 'Pay', description: 'Bills & Payments' },
  { icon: TrendingUp, title: 'Invest', description: 'Grow Wealth' },
  { icon: CreditCard, title: 'Cards', description: 'Manage Cards' },
];

const recentActivityData = [
  {
    icon: <LogoIcon letter="N" className="bg-red-600" />,
    title: 'Netflix Subscription',
    time: '2 hours ago',
    amount: -15.99,
  },
  {
    icon: <LogoIcon letter="S" className="bg-green-500" />,
    title: 'Salary Deposit',
    time: '1 day ago',
    amount: 3450.0,
  },
  {
    icon: LineChart,
    title: 'Investment Transfer',
    time: '2 days ago',
    amount: -500.0,
  },
];

const financialServicesData = [
  {
    icon: ShieldCheck,
    title: 'Wealth Management',
    description: 'Investment portfolios & advisory',
    isPremium: true,
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
      <div className="mb-8 text-center">
        <TextEffect
          per='char'
          preset='fade'
          className="text-sm font-medium tracking-widest text-[#00ff7f] uppercase"
        >
          AI Powered Financial Tracker
        </TextEffect>
      </div>
      <FinancialDashboard
        quickActions={quickActionsData}
        recentActivity={recentActivityData}
        financialServices={financialServicesData}
        summary={summaryData}
      />
    </div>
  );
}