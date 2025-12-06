// API Configuration and Utility Functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_income: number;
  projected_monthly_income: number;
  estimated_annual_tax: number;
}

export interface Activity {
  id: number;
  date: string;
  time: string | null;
  transaction_type: string;
  amount: number;
  created_at: string;
  document_name: string | null;
  upload_date: string | null;
}

export interface RecentActivitiesResponse {
  activities: Activity[];
}

/**
 * Fetch dashboard summary from backend
 */
export async function fetchDashboardSummary(userId?: string): Promise<DashboardSummary> {
  try {
    const url = new URL(`${API_BASE_URL}/finance/api/dashboard-summary/`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard summary: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
}

/**
 * Fetch recent activities from backend
 */
export async function fetchRecentActivities(userId?: string, limit: number = 5): Promise<Activity[]> {
  try {
    const url = new URL(`${API_BASE_URL}/finance/api/recent-activities/`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recent activities: ${response.statusText}`);
    }

    const data: RecentActivitiesResponse = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}

/**
 * Calculate Gig Health Score based on financial metrics
 * Score is based on:
 * - Income stability (40%)
 * - Expense ratio (30%)
 * - Tax readiness (30%)
 */
export function calculateGigHealthScore(summary: DashboardSummary): number {
  const { total_income, total_expenses, projected_monthly_income, estimated_annual_tax } = summary;

  // Avoid division by zero
  if (total_income === 0) return 0;

  // 1. Income Stability Score (0-40 points)
  // Higher projected income relative to current = better
  const incomeStabilityRatio = Math.min(projected_monthly_income / (total_income || 1), 2);
  const incomeScore = (incomeStabilityRatio / 2) * 40;

  // 2. Expense Ratio Score (0-30 points)
  // Lower expense ratio = better (ideally < 50%)
  const expenseRatio = total_expenses / total_income;
  const expenseScore = Math.max(30 - (expenseRatio * 60), 0);

  // 3. Tax Readiness Score (0-30 points)
  // Having money set aside for tax is good
  const monthlyTaxObligation = estimated_annual_tax / 12;
  let taxScore = 0;
  
  if (monthlyTaxObligation > 0) {
    // Only calculate if there's a tax obligation
    const netIncome = total_income - total_expenses;
    const taxReadiness = Math.min(netIncome / monthlyTaxObligation, 1);
    taxScore = Math.max(taxReadiness * 30, 0);
  } else {
    // No tax obligation means full score (income is below tax threshold)
    taxScore = 30;
  }

  // Total score (0-100)
  const totalScore = Math.round(incomeScore + expenseScore + taxScore);
  
  return Math.min(Math.max(totalScore, 0), 100);
}

/**
 * Format activity data for display
 */
export function formatActivityForDisplay(activity: Activity) {
  const timeAgo = getTimeAgo(new Date(activity.created_at));
  const title = activity.document_name 
    ? `${activity.transaction_type} - ${activity.document_name.replace(/\.[^/.]+$/, '')}`
    : `${activity.transaction_type} Transaction`;

  return {
    title,
    time: timeAgo,
    amount: activity.amount,
    type: activity.transaction_type,
  };
}

/**
 * Get relative time string (e.g., "5 mins ago")
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

/**
 * Fetch all transactions for analytics
 * This provides raw transaction data that can be processed on the frontend
 */
export async function fetchAllTransactions(userId?: string): Promise<Activity[]> {
  try {
    // Fetch a large number of transactions for analytics
    const url = new URL(`${API_BASE_URL}/finance/api/recent-activities/`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }
    url.searchParams.append('limit', '1000'); // Get all transactions

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data: RecentActivitiesResponse = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Group transactions by month and calculate totals
 */
export interface MonthlyData {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
  transactions: Activity[];
  sortKey?: string; // ISO format YYYY-MM for sorting
}

export function groupTransactionsByMonth(transactions: Activity[]): Record<string, MonthlyData> {
  const grouped: Record<string, MonthlyData> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    // Use sortable ISO format (YYYY-MM) as internal key
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sortKey = `${year}-${month}`;
    
    // Create display-friendly key
    const displayKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!grouped[displayKey]) {
      grouped[displayKey] = {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        incomeCount: 0,
        expenseCount: 0,
        transactions: [],
        sortKey, // Add sortKey for proper sorting
      };
    }

    grouped[displayKey].transactions.push(transaction);

    if (transaction.transaction_type.toLowerCase() === 'income') {
      grouped[displayKey].totalIncome += Math.abs(transaction.amount);
      grouped[displayKey].incomeCount++;
    } else {
      grouped[displayKey].totalExpense += Math.abs(transaction.amount);
      grouped[displayKey].expenseCount++;
    }

    grouped[displayKey].netProfit = grouped[displayKey].totalIncome - grouped[displayKey].totalExpense;
  });

  return grouped;
}

