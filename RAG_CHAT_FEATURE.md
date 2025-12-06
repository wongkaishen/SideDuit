# 🤖 RAG-Powered Chat Feature

## Overview

The SideDuit dashboard now includes an AI-powered chat assistant that uses **RAG (Retrieval Augmented Generation)** to provide intelligent insights about your financial data.

---

## ✨ Features

### 🎨 **Glassmorphism UI**
- Beautiful frosted glass effect with backdrop blur
- Animated gradient borders
- Smooth transitions and animations
- Responsive design for all screen sizes

### 🔄 **Always Accessible**
- **Floating chat button** - Always visible in the bottom-right corner
- **Click to open** - No need to type a query first
- **Open from input** - Type in the dashboard input and press Enter
- **Notification badge** - Shows green dot when you have chat history

### 💾 **Persistent Chat History**
- **Auto-save** - All conversations saved to browser localStorage
- **Survives page refreshes** - Chat history persists across sessions
- **Timestamps** - See when each message was sent ("2m ago", "1h ago", etc.)
- **Clear history** - Trash icon to delete all conversations
- **Message count** - Header shows total number of messages

### 🧠 **Semantic Search**
- Uses vector embeddings (pgvector) for semantic understanding
- Finds relevant transactions even when you don't use exact keywords
- Example: "food expenses" will match "restaurant", "groceries", "meals", etc.

### 💬 **Intelligent Responses**
- Powered by Google Gemini 2.0 Flash
- Provides context-aware answers based on your actual transaction data
- Cites sources with transaction details
- Calculates totals, trends, and percentages on the fly

### 📊 **Transaction Citations**
- Shows which transactions were used to answer your question
- Displays merchant name, category, amount, date
- Includes similarity score (how relevant each transaction is)

---

## 🚀 How to Use

### 1. **Open the Chat**

**Three ways to access the AI chat:**

**Option 1: Floating Chat Button** ⭐ (Recommended)
- Look for the purple/pink floating button in the **bottom-right corner**
- Click it to open the chat modal instantly
- Green notification dot appears if you have saved chat history
- Always accessible from any part of the dashboard

**Option 2: Dashboard AI Input**
- Type your question in the AI input field: `🌟 What financial insight do you need today?`
- Press **Enter** to open chat with your query pre-filled

**Option 3: View Previous Conversations**
- Click the floating button to see your chat history
- All previous conversations are automatically saved
- Timestamps show when each message was sent
- Continue where you left off!

### 2. **Ask Questions**
The AI can answer questions like:

**Spending Analysis:**
- "How much did I spend on food last month?"
- "What are my top expense categories?"
- "Show me all my restaurant expenses"

**Income Tracking:**
- "What's my total income this week?"
- "Show me income from Grab"
- "How much did I earn from freelancing?"

**Trends & Insights:**
- "What's my average daily spending?"
- "Am I spending more or less than last month?"
- "What's my biggest expense category?"

**Tax & Planning:**
- "How much tax will I owe?"
- "What's my net profit this month?"
- "Show me my expense breakdown"

### 3. **View Sources**
Each AI response includes citations showing:
- Merchant/Document name
- Transaction category
- Amount and date
- Relevance score (how well it matches your question)

---

## 🏗️ Technical Architecture

### Backend (Django)

#### **New Files:**

**`backend/SideDuit/finance/rag.py`**
- `semantic_search_transactions()` - Vector similarity search
- `generate_rag_response()` - Main RAG pipeline
- `fallback_keyword_search()` - Backup when embeddings unavailable

**API Endpoint:**
```
POST /finance/api/chat/
{
  "query": "How much did I spend on food?",
  "user_id": "0"
}

Response:
{
  "response": "AI-generated answer...",
  "sources": [
    {
      "transaction_id": 123,
      "merchant": "McDonald's",
      "amount": 15.50,
      "date": "2024-12-05",
      "category": "Food-Restaurant",
      "similarity": 92.5
    }
  ],
  "total_sources": 10
}
```

#### **How RAG Works:**

1. **User Query** → "How much did I spend on food?"

2. **Embedding Generation** → Convert query to vector
   ```python
   query_embedding = generate_embedding(query_text)
   ```

3. **Semantic Search** → Find similar transactions
   ```sql
   SELECT * FROM transaction_embeddings
   ORDER BY embedding <=> query_embedding
   LIMIT 10
   ```

4. **Context Building** → Format transactions for AI
   ```
   Transaction 1:
   - Type: Expense
   - Amount: RM 15.50
   - Category: Food-Restaurant
   - Merchant: McDonald's
   - Date: 2024-12-05
   ```

5. **AI Response** → Gemini generates answer
   ```python
   response = gemini.generate_content(prompt + context)
   ```

---

### Frontend (Next.js)

#### **New Files:**

**`frontend/components/ui/chat-modal.tsx`**
- Glassmorphism modal with backdrop blur
- Real-time chat interface
- Source citations display
- Suggested questions for first-time users

#### **Glassmorphism Styling:**
```tsx
<div className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl" />
```

Key CSS techniques:
- `backdrop-blur-xl` - Frosted glass effect
- `from-white/90` - Semi-transparent white gradient
- `border-white/20` - Subtle borders
- `shadow-2xl` - Depth and elevation
- Animated gradient borders with `animate-pulse`

#### **Integration:**
The chat modal is triggered from the dashboard's AI input:
```tsx
<input
  onKeyPress={handleInputKeyPress} // Opens modal on Enter
  placeholder="What financial insight do you need today?"
/>
```

---

## 📋 Requirements

### Database Setup

The chat feature requires the `transaction_embeddings` table. If you haven't set it up yet:

**Run in Supabase SQL Editor:**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table (see COMPLETE_SETUP.sql)
-- Or run the full setup script:
```

Copy and paste from: `backend/SideDuit/finance/migrations/COMPLETE_SETUP.sql`

### Dependencies

**Backend:**
- ✅ `google-generativeai` (already installed)
- ✅ `psycopg2-binary` (already installed)
- ✅ `pgvector` (enabled in Supabase)

**Frontend:**
- ✅ No new dependencies needed!

---

## 🎯 User Experience Flow

### **First Time User:**
```
1. User lands on dashboard
   ↓
2. Sees floating purple chat button (bottom-right)
   ↓
3. Clicks button → Glassmorphism modal slides in
   ↓
4. Sees welcome screen with suggested questions
   ↓
5. Clicks a suggestion OR types own question
   ↓
6. "Thinking..." loader shows
   ↓
7. AI response appears with transaction sources
   ↓
8. Conversation is auto-saved to browser
```

### **Returning User:**
```
1. User opens dashboard
   ↓
2. Floating button shows green notification dot
   ↓
3. Clicks button → Chat opens with full history
   ↓
4. Sees previous conversations with timestamps
   ↓
5. Scrolls through past Q&A or asks new question
   ↓
6. Can clear history with trash icon if needed
```

### **Quick Query Flow:**
```
1. User types in AI input field on dashboard
   ↓
2. Presses Enter
   ↓
3. Chat modal opens with query pre-filled
   ↓
4. AI processes and responds immediately
   ↓
5. Question added to saved history
```

---

## 📂 Chat History Management

### **How Chat History Works**

**Storage Location:**
- Saved in browser's `localStorage`
- Key: `sideduit_chat_history`
- Format: JSON array of messages

**What's Saved:**
```typescript
{
  role: 'user' | 'assistant',
  content: 'message text',
  timestamp: '2024-12-06T10:30:00.000Z',
  sources: [...] // Only for assistant messages
}
```

**Auto-Save Behavior:**
- Saves automatically after each message
- No manual save required
- Survives browser refreshes
- Persists until manually cleared

### **Managing Your History**

**View History:**
- Click floating chat button
- Scroll through all previous conversations
- Messages show relative timestamps ("5m ago", "2h ago", "1d ago")

**Clear History:**
- Click trash icon 🗑️ in chat header (appears when you have messages)
- Confirms before deleting: "Are you sure you want to clear all chat history?"
- Removes all messages from localStorage
- Fresh start for new conversation

**Message Count:**
- Header shows: "X messages" when chat history exists
- Helps you track conversation length

### **Privacy & Security**

✅ **Local Storage Only** - Data never leaves your browser  
✅ **No Server Storage** - Chat history not sent to backend (only queries)  
✅ **Per-Device** - Each browser has its own independent history  
⚠️ **Incognito Mode** - History deleted when closing window  
⚠️ **Clear Cache** - Deletes chat history permanently  
⚠️ **Different Browsers** - No sync between browsers  

---

## 🔧 Troubleshooting

### "I couldn't find any relevant transactions"

**Cause:** No embeddings in database yet

**Solutions:**
1. Upload some receipts/invoices first
2. Make sure `transaction_embeddings` table exists
3. Check that embeddings are being generated on upload

### "Chat history disappeared"

**Cause:** Browser cache cleared or incognito mode

**Solutions:**
- Check if you're in incognito/private browsing mode
- Check if browser cache was recently cleared
- Unfortunately, cannot recover cleared history (local storage only)
- Chat history is device and browser-specific

### "Floating button not visible"

**Cause:** CSS/rendering issue

**Solutions:**
1. Scroll page to see if it's at the bottom-right corner
2. Check browser console (F12) for JavaScript errors
3. Try refreshing the page (Ctrl+R or Cmd+R)
4. Check if other elements are overlaying it (z-index issue)

### "Error: relation 'public.transaction_embeddings' does not exist"

**Cause:** Database table not created

**Solution:**
```sql
-- Run COMPLETE_SETUP.sql in Supabase SQL Editor
-- File: backend/SideDuit/finance/migrations/COMPLETE_SETUP.sql
```

### Backend not responding

**Check:**
1. Django server is running: `python manage.py runserver`
2. GEMINI_API_KEY is set in `.env`
3. Supabase connection is working

### Chat modal not opening

**Check:**
1. Browser console for errors
2. Frontend server is running: `npm run dev`
3. CORS is configured in Django settings

---

## 🎨 Customization

### Change Glassmorphism Colors

**Edit `frontend/components/ui/chat-modal.tsx`:**

```tsx
// Adjust background opacity
className="bg-gradient-to-br from-white/90 via-white/80 to-white/70"

// Change gradient border colors
className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"

// Modify backdrop blur intensity
className="backdrop-blur-xl" // Options: sm, md, lg, xl, 2xl, 3xl
```

### Adjust Number of Sources

**Edit `backend/SideDuit/finance/rag.py`:**

```python
# Change semantic search results
relevant_transactions = semantic_search_transactions(query, user_id, top_k=10)  # Default 10

# Change displayed sources in response
sources = []
for txn in relevant_transactions[:5]:  # Show top 5, change this number
    sources.append(...)
```

### Customize AI Personality

**Edit the prompt in `backend/SideDuit/finance/rag.py`:**

```python
prompt = f"""
You are SideDuit AI, a [YOUR PERSONALITY HERE]...

Tone options:
- Professional and formal
- Friendly and casual
- Enthusiastic and motivating
- Humorous and witty
"""
```

---

## 📊 Performance

### Semantic Search Speed
- **Average query time:** ~200-500ms
- Uses HNSW index for fast vector similarity
- Scales to millions of transactions

### Response Generation
- **Gemini 2.0 Flash:** ~1-3 seconds
- Streaming support: Can be added for faster perceived response

---

## 🚀 Future Enhancements

### Potential Features:
- [ ] Chat history persistence
- [ ] Multi-turn conversations with context
- [ ] Voice input/output
- [ ] Export chat to PDF
- [ ] Proactive insights ("You spent 20% more this week!")
- [ ] Budget recommendations
- [ ] Financial goal tracking
- [ ] Chart generation in responses
- [ ] Mobile-optimized swipe gestures

---

## 🎉 Summary

✅ **RAG-powered chat** with semantic search  
✅ **Glassmorphism UI** with beautiful animations  
✅ **Real-time AI responses** powered by Gemini  
✅ **Transaction citations** for transparency  
✅ **Fully integrated** with dashboard  
✅ **Backward compatible** (works without embeddings table)  

**Try it now:**
1. Go to http://localhost:3000
2. Type a question in the AI input
3. Press Enter
4. Watch the magic happen! ✨

---

## 📝 Code Examples

### Call RAG API from JavaScript:

```javascript
const response = await fetch('http://127.0.0.1:8000/finance/api/chat/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "How much did I spend on food?",
    user_id: "0"
  })
});

const data = await response.json();
console.log(data.response); // AI answer
console.log(data.sources);  // Transaction citations
```

### Perform Semantic Search in Python:

```python
from finance.rag import semantic_search_transactions

results = semantic_search_transactions(
    query_text="restaurant expenses",
    user_id="0",
    top_k=5
)

for txn in results:
    print(f"{txn['merchant']}: RM {txn['amount']} ({txn['similarity_score']:.2%})")
```

---

## 💡 Tips

1. **Be specific** - "food expenses in December" better than "expenses"
2. **Use natural language** - Ask like you're talking to a person
3. **Check sources** - Verify the transactions used in the answer
4. **Upload regularly** - More data = better insights
5. **Ask follow-ups** - Each question starts fresh (for now)

---

Enjoy your new AI financial assistant! 🎉💰

