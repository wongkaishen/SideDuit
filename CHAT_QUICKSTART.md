# Chat Conversation Quick Start 🚀

Follow these steps to get the chat conversation feature up and running.

## Prerequisites

- ✅ Supabase project created
- ✅ Django backend running
- ✅ Next.js frontend running
- ✅ Database connection configured in `backend/SideDuit/finance/db_pool.py`

## Step-by-Step Setup

### Step 1: Create Database Tables (2 minutes)

1. Open your **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `backend/schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. ✅ You should see "Success. No rows returned" message

**Verify:**
```sql
-- Run this query to verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');
```

### Step 2: Restart Backend (1 minute)

```bash
# Navigate to backend directory
cd "d:/Wong Kai Shen/Github/SideDuit/backend"

# Activate virtual environment
source env/Scripts/activate  # Windows Git Bash
# OR
env\Scripts\activate.bat     # Windows CMD

# Navigate to Django project
cd SideDuit

# Run server
python manage.py runserver
```

**Verify:**
- Server starts on http://127.0.0.1:8000
- No errors in console
- Visit http://127.0.0.1:8000/finance/api/conversations/ to test endpoint

### Step 3: Test Frontend (2 minutes)

The frontend should already be updated. If not running:

```bash
# Navigate to frontend directory
cd "d:/Wong Kai Shen/Github/SideDuit/frontend"

# Install dependencies (if needed)
npm install

# Run development server
npm run dev
```

**Verify:**
- Server starts on http://localhost:3000
- No build errors

### Step 4: Test the Feature (3 minutes)

1. **Open the app** in your browser: http://localhost:3000

2. **Click the floating chat button** (purple circle, bottom-right)

3. **You should see:**
   - Chat modal opens
   - Sidebar on the left (or menu icon on mobile)
   - "Welcome to SideDuit AI!" message
   - Suggested questions

4. **Create your first chat:**
   - Click "How much did I spend this month?" or type any message
   - Click Send or press Enter
   - ✅ Message should appear on the right (blue bubble)
   - ✅ AI response should appear on the left (white bubble)

5. **Verify persistence:**
   - Close the chat modal (X button)
   - Reopen the chat
   - ✅ Your conversation should be listed in the sidebar
   - ✅ Click on it to reload the messages

6. **Test new chat:**
   - Click the "+ New Chat" button
   - ✅ Messages should clear
   - Send a different message
   - ✅ New conversation created

7. **Test deletion:**
   - Hover over a conversation in the sidebar
   - Click the trash icon
   - Confirm deletion
   - ✅ Conversation removed from list

## Troubleshooting

### ❌ Sidebar not showing

**Problem:** Sidebar is hidden or not visible

**Solution:**
```typescript
// In chat-modal.tsx, check this line:
const [showSidebar, setShowSidebar] = useState(false);

// For desktop, you might want to default to true:
const [showSidebar, setShowSidebar] = useState(true);
```

### ❌ "Failed to create conversation"

**Problem:** API returns error when creating conversation

**Checklist:**
1. Backend server running? → Check http://127.0.0.1:8000
2. Database tables created? → Run Step 1 verification query
3. Database connection working? → Check `db_pool.py` settings
4. CORS enabled? → Check Django `settings.py` for CORS_ALLOWED_ORIGINS

**Debug:**
```python
# In backend terminal, check for errors
# You should see POST requests to /finance/api/conversations/create/
```

### ❌ Messages not loading

**Problem:** Old conversation loads but shows no messages

**Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on a conversation
4. Look for request to `/api/conversations/{id}/messages/`
5. Check response - should have `messages` array

**Fix:**
```bash
# Test API directly
curl http://127.0.0.1:8000/finance/api/conversations/
```

### ❌ CORS errors in browser console

**Problem:** "Access to fetch has been blocked by CORS policy"

**Solution:**
```python
# In backend/SideDuit/SideDuit/settings.py
# Make sure CORS is configured:

INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be early
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Or for development only:
CORS_ALLOW_ALL_ORIGINS = True
```

### ❌ Database connection errors

**Problem:** "could not connect to server" or "connection refused"

**Solution:**
```python
# Check backend/SideDuit/finance/db_pool.py
# Verify your Supabase credentials:

conn = psycopg2.connect(
    host="your-project.supabase.co",
    port="5432",
    database="postgres",
    user="postgres",
    password="your-password"
)
```

**Get credentials from Supabase:**
1. Supabase Dashboard → Settings → Database
2. Copy Connection String
3. Extract host, password, etc.

## Quick Testing Commands

### Test Backend APIs

```bash
# List conversations
curl http://127.0.0.1:8000/finance/api/conversations/?user_id=0

# Create conversation
curl -X POST http://127.0.0.1:8000/finance/api/conversations/create/ \
  -H "Content-Type: application/json" \
  -d '{"user_id":"0","title":"Test Chat"}'

# Get messages (replace {id} with actual conversation ID)
curl http://127.0.0.1:8000/finance/api/conversations/{id}/messages/
```

### Check Database

```sql
-- In Supabase SQL Editor:

-- Count conversations
SELECT COUNT(*) FROM conversations;

-- View recent conversations
SELECT id, title, created_at, updated_at 
FROM conversations 
ORDER BY updated_at DESC 
LIMIT 10;

-- Count messages
SELECT COUNT(*) FROM messages;

-- View conversation with messages
SELECT 
    c.title,
    m.role,
    m.content,
    m.created_at
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
ORDER BY m.created_at DESC
LIMIT 20;
```

## Success Checklist ✅

After setup, you should be able to:

- [ ] Open chat modal by clicking floating button
- [ ] See sidebar with "New Chat" button
- [ ] Send a message and get AI response
- [ ] See conversation appear in sidebar
- [ ] Close and reopen modal - conversation persists
- [ ] Click conversation in sidebar to reload it
- [ ] Create new chat and start fresh conversation
- [ ] Delete conversation from sidebar
- [ ] See message count and timestamps
- [ ] View RAG sources in AI responses (if applicable)

## What's Next?

Now that the feature is working, you can:

1. **Customize the UI**
   - Change colors, animations, or layout
   - Add more features to conversation cards
   - Customize welcome message and suggestions

2. **Add Features**
   - User authentication integration
   - Conversation search/filter
   - Export conversations
   - Share via link

3. **Configure for Production**
   - Set up proper user_id from auth system
   - Configure RLS policies in Supabase
   - Add rate limiting
   - Optimize database queries

## Need Help?

- 📖 Read `CHAT_HISTORY_SETUP.md` for detailed documentation
- 🏗️ See `CHAT_ARCHITECTURE.md` for system architecture
- 📝 Check `CHAT_IMPLEMENTATION_SUMMARY.md` for code changes
- 🐛 Check browser console and backend logs for errors

---

**Setup Time:** ~10 minutes total
**Difficulty:** 🟢 Easy (copy-paste SQL and restart servers)
**Status:** Ready to use! 🎉
