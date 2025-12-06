"use client";

import React, { useEffect, useState } from 'react';
import { FinancialDashboard } from '@/components/ui/financial-dashboard';
import { 
  fetchDashboardSummary, 
  fetchRecentActivities, 
  formatActivityForDisplay,
  calculateGigHealthScore,
  type DashboardSummary,
  type Activity 
} from '@/lib/api';

// Import Lucide icons
import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  ShieldCheck,
  SwitchCamera,
  Target,
  TrendingUp,
  Users,
  FileText,
  Loader2,
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

// --- STATIC DATA (Quick Actions & Services) ---
const quickActionsData = [
  { icon: ArrowLeftRight, title: 'Transfer', description: 'Send Money', href: '/transfer' },
  { icon: Landmark, title: 'Pay', description: 'Bills & Payments', href: '/pay' },
  { icon: TrendingUp, title: 'Invest', description: 'Grow Wealth', href: '/invest' },
  { icon: CreditCard, title: 'Cards', description: 'Manage Cards', href: '/cards' },
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
    href: '/analytics',
  },
  {
    icon: Users,
    title: 'Joint Accounts',
    description: 'Family & business accounts',
  },
];

export default function FinancialDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gigHealthScore, setGigHealthScore] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from backend API
        const [summaryData, activitiesData] = await Promise.all([
          fetchDashboardSummary(),
          fetchRecentActivities(undefined, 5),
        ]);

        setSummary(summaryData);
        setActivities(activitiesData);
        
        // Calculate Gig Health Score
        const healthScore = calculateGigHealthScore(summaryData);
        setGigHealthScore(healthScore);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-background min-h-screen p-4 md:p-8 pt-20 md:pt-24 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !summary) {
    return (
      <div className="bg-background min-h-screen p-4 md:p-8 pt-20 md:pt-24 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error || 'No data available'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Format recent activities for display
  const recentActivityData = activities.map((activity) => {
    const formatted = formatActivityForDisplay(activity);
    return {
      icon: FileText,
      title: formatted.title,
      time: formatted.time,
      amount: formatted.amount,
    };
  });

  // Map summary data to expected format
  const summaryData = {
    totalIncome: summary.total_income,
    totalExpenses: summary.total_expenses,
    estimatedTaxes: summary.estimated_annual_tax / 12, // Monthly estimate
    gigHealthScore: gigHealthScore,
  };

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