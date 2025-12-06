# SideDuit ���

**SideDuit** is an intelligent financial management platform designed specifically for **Malaysian gig economy workers**. It serves as an all-in-one solution for managing irregular income, tracking expenses, planning for taxes, and securing retirement through EPF savings.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-6.0-green)](https://www.djangoproject.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_2.0-blue)](https://ai.google.dev/)

---

## ��� The Problem

The gig economy in Malaysia has grown exponentially, but gig workers face unique financial challenges:

- **Irregular Income Streams**: Fluctuating monthly earnings make budgeting difficult
- **No Automatic Tax Deductions**: Unlike salaried workers, gig workers must calculate taxes manually
- **Absence of EPF Contributions**: Retirement planning becomes entirely self-directed
- **Manual Expense Tracking**: Receipts and invoices pile up, making it tedious to track spending

**SideDuit** was built to empower Malaysian gig workers with intelligent financial tools that understand their unique needs.

---

## ✨ Key Features

### 1. ��� AI-Powered Document Processing
- **Intelligent Upload System**: Accepts receipts, invoices, bills, and payslips (PDF, PNG, JPG)
- **Gemini Vision Integration**: Uses **Google Gemini 2.0 Flash** to extract:
  - Merchant names and business details
  - Transaction dates (with smart DD/MM/YYYY to YYYY-MM-DD conversion)
  - Amounts with precision
  - Categories (Food, Transport, Income, etc.)
- **Auto-Categorization**: Classifies transactions as Income or Expense with granular categories

### 2. ��� RAG-Powered Financial Chatbot
- **Natural Language Queries**: Ask questions like:
  - *"How much did I spend on Grab last month?"*
  - *"Show me my freelance income this quarter"*
  - *"What are my biggest expenses?"*
- **Semantic Search**: Powered by **Supabase pgvector** and **Gemini Text-Embedding-004**
  - Understands context even when exact keywords don't match
- **Citation System**: Every AI response includes source references with transaction IDs, amounts, and dates
- **Conversation Management**: Create, browse, and resume previous chat sessions

### 3. ��� Retirement Planning & EPF Calculator
- **Interactive Compound Interest Visualization**: Real-time projection of retirement savings
- **Customizable Parameters**: Current age, retirement age, savings, monthly contribution, and expected returns
- **AI Retirement Advisor**: Personalized advice based on your unique financial profile

### 4. ��� Interactive Financial Dashboard
- **Gig Health Score**: A proprietary metric (0-100) rating financial stability based on:
  - Income consistency
  - Expense ratio
  - Savings rate
  - Tax preparedness
- **Real-time Metrics**: Total income, expenses, net income, and projected monthly income
- **Malaysian Tax Estimation**: Progressive tax calculator with automatic relief deductions
- **Visual Charts**: Area charts, sparklines, and gauge visualizations

### 5. ��� Monthly Analytics
- **Trend Analysis**: 7-day sparklines for income and expense patterns
- **Month-over-Month Comparison**: Track financial performance across periods
- **Category Breakdown**: Pie charts and summaries of spending by category

---

## ���️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 14 + React + TypeScript + TailwindCSS + GSAP      │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────────────────────┐
│                       Backend Layer                          │
│  Django 6.0 + Django REST Framework                         │
│  - File processing with Gemini Vision API                   │
│  - RAG implementation for semantic search                   │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL Queries
┌──────────────────▼──────────────────────────────────────────┐
│                      Database Layer                          │
│  Supabase (PostgreSQL + pgvector)                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      AI/ML Layer                             │
│  Google Gemini 2.0 Flash + text-embedding-004               │
└─────────────────────────────────────────────────────────────┘
```

---

## ���️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, GSAP, Framer Motion, Recharts |
| **Backend** | Django 6.0, Django REST Framework, Gunicorn, WhiteNoise |
| **Database** | Supabase (PostgreSQL), pgvector |
| **AI/ML** | Google Gemini 2.0 Flash, text-embedding-004 |
| **Deployment** | Render.com (backend), Vercel (frontend) |

---

## ��� Project Structure

```
SideDuit/
├── backend/
│   ├── SideDuit/
│   │   ├── finance/              # Main Django app
│   │   │   ├── views.py          # API endpoints
│   │   │   ├── services.py       # Gemini integration & embeddings
│   │   │   ├── rag.py            # RAG implementation
│   │   │   ├── supabase_utils.py # Financial calculations
│   │   │   ├── db_pool.py        # Connection pooling
│   │   │   └── urls.py           # Route definitions
│   │   └── SideDuit/             # Django settings
│   │       ├── settings.py
│   │       └── requirements.txt
│   ├── schema.sql                # Supabase database schema
│   ├── build.sh                  # Render build script
│   └── render.yaml               # Deployment config
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── analytics/            # Analytics page
│   │   ├── retirement/           # Retirement planner
│   │   └── upload/               # Document upload
│   ├── components/ui/
│   │   ├── chat-modal.tsx        # RAG chatbot
│   │   ├── financial-dashboard.tsx
│   │   └── navbar.tsx
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   └── utils.ts
│   └── package.json
└── README.md
```

---

## ��� Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **Supabase** account with pgvector enabled
- **Google AI** API key (Gemini)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv env
source env/Scripts/activate  # Windows
# source env/bin/activate    # Linux/Mac

# Install dependencies
pip install -r SideDuit/SideDuit/requirements.txt

# Create .env file in backend/SideDuit/
cat > SideDuit/.env << EOF
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:pass@host:5432/db
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:3000
EOF

# Run migrations
cd SideDuit
python manage.py migrate

# Start development server
python manage.py runserver 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### Database Setup

Run the `schema.sql` file in your Supabase SQL editor to create the required tables:
- `transactions` - Core financial records
- `transaction_embeddings` - Vector embeddings for RAG
- `conversations` - Chat session management
- `messages` - Individual chat messages with sources
- `upload_logs` - Document upload tracking

---

## ��� Environment Variables

### Backend (`backend/SideDuit/.env`)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI API key for Gemini |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anonymous key |
| `DATABASE_URL` | PostgreSQL connection string |
| `DEBUG` | Set to `False` in production |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## ��� Deployment

### Backend (Render.com)

The project includes `render.yaml` for automated deployment:

```bash
# On git push to main:
# 1. Install dependencies
# 2. Collect static files
# 3. Run migrations
# 4. Start Gunicorn server
```

### Frontend (Vercel)

```bash
npm run build
# Deploy via Vercel Git integration
# Configure environment variables in Vercel dashboard
```

---

## ��� Roadmap

### Short-Term (Next 3 Months)
- [ ] User-defined categories and bulk editing
- [ ] Multi-currency support (USD, SGD, EUR)
- [ ] PDF/CSV export for reports
- [ ] Mobile app (React Native)

### Medium-Term (3-6 Months)
- [ ] Budgeting and savings goals
- [ ] Malaysian bank integration via open banking APIs
- [ ] Advanced tax optimization recommendations
- [ ] Collaborative features for accountants

### Long-Term (6-12 Months)
- [ ] AI Financial Coach with personalized advice
- [ ] Predictive analytics for income forecasting
- [ ] Investment recommendations
- [ ] Gamification (streaks, achievements, challenges)

---

## ��� Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## ��� License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ��� Contact & Support

- **Issues**: [GitHub Issues](https://github.com/wongkaishen/SideDuit/issues)
- **Documentation**: See `PROJECT_OVERVIEW.md` for detailed technical documentation

---

**Built with ❤️ for the gig economy workers of Malaysia.**
