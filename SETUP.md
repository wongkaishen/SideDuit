# SideDuit - Setup Guide

## Overview
SideDuit is a financial dashboard for gig economy workers with AI-powered document processing and real-time analytics.

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (Supabase account)
- Google Gemini API Key

---

## Backend Setup (Django)

### 1. Navigate to backend directory
```bash
cd backend/SideDuit
```

### 2. Create and activate virtual environment
```bash
# Windows
python -m venv env
env\Scripts\activate

# Mac/Linux
python3 -m venv env
source env/bin/activate
```

### 3. Install dependencies
```bash
pip install -r SideDuit/requirements.txt
```

### 4. Create `.env` file in `backend/SideDuit/` directory
```env
# Gemini API for OCR
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Database Connection
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_supabase_password
SUPABASE_DB_PORT=5432
```

### 5. Run migrations
```bash
python manage.py migrate
```

### 6. (Optional) Seed test data
```bash
python manage.py seed_data
```

### 7. Run the development server
```bash
python manage.py runserver
```

Backend should now be running at `http://127.0.0.1:8000`

---

## Frontend Setup (Next.js)

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local` file in `frontend/` directory
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 4. Run the development server
```bash
npm run dev
```

Frontend should now be running at `http://localhost:3000`

---

## Database Schema (Supabase)

The backend expects the following tables in your Supabase database:

### `transactions` table
```sql
CREATE TABLE public.transactions (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME,
  transaction_type VARCHAR(50) NOT NULL,
  transaction_amount DECIMAL(10, 2) NOT NULL,
  upload_id BIGINT,
  user_id VARCHAR(255) DEFAULT '0',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `update_logs` table
```sql
CREATE TABLE public.update_logs (
  upload_id BIGSERIAL PRIMARY KEY,
  upload_user VARCHAR(255),
  upload_document_name VARCHAR(255),
  uploaded_document BYTEA,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Dashboard Summary
- **GET** `/finance/api/dashboard-summary/`
- Returns: total income, expenses, net income, projected monthly income, estimated tax

### Recent Activities
- **GET** `/finance/api/recent-activities/?limit=5`
- Returns: List of recent transactions

### Upload Documents
- **POST** `/finance/upload/`
- Accepts: multipart/form-data with 'documents' field
- Processes documents with Gemini AI and extracts transactions

---

## Features Implemented

✅ **Real Data Integration**
- All mock data removed
- Dashboard fetches real data from Supabase via Django API
- Analytics page shows actual transaction history

✅ **Financial Calculations**
- Total Income calculation
- Total Expenses calculation
- Net profit/loss
- Malaysian tax estimation (progressive brackets)
- Gig Health Score (based on income stability, expense ratio, tax readiness)

✅ **Loading & Error States**
- Skeleton loaders while fetching data
- Error handling with retry options
- Graceful fallbacks for missing data

✅ **Dynamic Analytics**
- Transactions grouped by month
- 7-day trend sparklines
- Real-time calculations
- Transaction history viewer

---

## Troubleshooting

### Backend Issues

**"GEMINI_API_KEY environment variable not set"**
- Make sure you created the `.env` file in `backend/SideDuit/`
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Database connection errors**
- Verify your Supabase credentials
- Make sure the database tables are created
- Check that your IP is allowed in Supabase settings

### Frontend Issues

**"Failed to fetch dashboard summary"**
- Make sure the backend is running on port 8000
- Check CORS settings in Django `settings.py`
- Verify `.env.local` has the correct API URL

**No data showing in dashboard**
- Upload some documents first via `/upload` page
- Or seed test data in the backend with `python manage.py seed_data`

---

## Next Steps

1. Upload receipts/invoices via the Upload page
2. View real-time dashboard with your financial data
3. Explore analytics to see monthly breakdowns
4. Use the AI chatbot for financial insights (coming soon)

---

## Support

For issues or questions, please check:
- Backend logs in terminal
- Browser console for frontend errors
- Network tab to see API responses

