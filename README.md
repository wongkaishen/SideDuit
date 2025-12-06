# SideDuit 🚀

**SideDuit** is an intelligent financial management platform designed specifically for **Malaysian gig economy workers**. It serves as a one-stop solution for managing irregular income, tracking expenses, planning for taxes, and securing a financial future through retirement planning.

## 📋 Executive Summary

Gig workers often struggle with financial stability due to fluctuating income, lack of automatic tax deductions, and the absence of employer-contributed retirement savings (EPF). SideDuit bridges this gap by providing:
- **Automated Expense Tracking**: Upload receipts and invoices; our AI extracts data automatically.
- **Smart Financial Insights**: A RAG-powered chatbot that answers questions about your spending habits.
- **Retirement Planning**: An interactive EPF calculator with an AI advisor to help plan for the future.
- **Tax Estimation**: Real-time estimates of tax obligations based on income tiers.

## ✨ Key Features

### 1. 📄 AI Document Processing
- **Upload Anything**: Supports receipts, invoices, bills, and payslips (PDF, PNG, JPG).
- **Gemini Vision Power**: Uses **Google Gemini 2.0 Flash** to extract merchant names, dates, amounts, and categories with high precision.
- **Auto-Categorization**: Automatically classifies transactions as Income or Expense and assigns categories (e.g., "Food", "Transport").

### 2. 💬 RAG-Powered Financial Chat
- **Ask Your Data**: "How much did I spend on Grab last month?" or "Show me my recent freelance income."
- **Semantic Search**: Uses **Supabase pgvector** and **Gemini Embeddings** to find relevant transactions even if keywords don't match exactly.
- **Citations**: Responses include links to the specific source documents/transactions.

### 3. 👴 Retirement Planner
- **EPF Calculator**: Visualize compound interest growth based on current savings, monthly contributions, and retirement age.
- **AI Advisor**: Get personalized advice on how to reach your retirement goals based on your unique financial profile.

### 4. 📊 Interactive Dashboard
- **Financial Health Score**: A "Gig Health Score" that rates your financial stability.
- **Visual Analytics**: Area charts and breakdown summaries of income vs. expenses.

## 🛠️ Tech-Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Lucide Icons
- **Visualization**: [Recharts](https://recharts.org/) for data visualization

### Backend
- **Framework**: [Django](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- **AI Integration**: [Google Generative AI SDK](https://ai.google.dev/) (Gemini)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)

### AI & Data
- **LLM**: Gemini 2.5 Flash
- **Embeddings**: Gemini Text-Embedding-004
- **Vector Store**: pgvector (via Supabase)