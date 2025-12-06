# Chat Conversation Management - Setup Guide

This guide will help you set up the chat conversation management feature with Supabase.

## Features

✅ **New Chat Creation** - Start fresh conversations with one click
✅ **Chat History Sidebar** - View and navigate between previous conversations
✅ **Persistent Storage** - All messages and conversations stored in Supabase
✅ **Auto-Title Generation** - Conversations automatically titled from first message
✅ **Delete Conversations** - Remove unwanted chat history
✅ **Message Count & Timestamps** - Track conversation activity
✅ **Responsive Design** - Works on desktop and mobile devices

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy and paste the contents of `backend/schema.sql`
5. Click **Run** to execute the SQL

This will create:
- `conversations` table - stores chat sessions
- `messages` table - stores individual messages
- Indexes for optimized queries
- Triggers for automatic timestamp updates
- Row Level Security policies (configured for public access)

### 2. Backend Setup

The backend API endpoints are already configured in `backend/SideDuit/finance/views.py` and `backend/SideDuit/finance/urls.py`.

**Available Endpoints:**

```
POST   /finance/api/conversations/create/
GET    /finance/api/conversations/
GET    /finance/api/conversations/<id>/messages/
POST   /finance/api/messages/save/
PUT    /finance/api/conversations/<id>/
DELETE /finance/api/conversations/<id>/delete/
```

### 3. Frontend Setup

The chat modal has been updated to include:
- Chat history sidebar (toggleable)
- New chat button
- Conversation selection
- Message persistence to Supabase
- Auto-title generation from first user message

**Updated Files:**
- `frontend/components/ui/chat-modal.tsx` - Main chat interface with sidebar
- `frontend/components/ui/global-chatbot.tsx` - Global chat button

## Usage

### Creating a New Chat

1. Click the **floating chat button** (bottom-right corner)
2. Click the **"+ New Chat"** button in the header or sidebar
3. Start typing your message

A new conversation will be automatically created when you send your first message.

### Viewing Chat History

1. Open the chat modal
2. On desktop: The sidebar is visible on the left
3. On mobile: Click the **menu icon** (☰) to toggle the sidebar
4. Click any conversation to load its messages

### Managing Conversations

- **Rename**: Conversations are automatically titled from the first message
- **Delete**: Hover over a conversation and click the trash icon
- **Clear Current**: Click the trash icon in the header to clear the current chat

### API Parameters

**Creating a Conversation:**
```json
POST /finance/api/conversations/create/
{
  "user_id": "0",  // optional
  "title": "New Chat"  // optional
}
```

**Saving a Message:**
```json
POST /finance/api/messages/save/
{
  "conversation_id": "uuid",
  "role": "user",  // or "assistant"
  "content": "message text",
  "sources": []  // optional RAG sources
}
```

**Loading Conversations:**
```
GET /finance/api/conversations/?user_id=0&limit=50
```

## Database Schema Overview

### conversations table
- `id` (UUID, primary key)
- `user_id` (TEXT, nullable)
- `title` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `is_archived` (BOOLEAN)
- `metadata` (JSONB)

### messages table
- `id` (UUID, primary key)
- `conversation_id` (UUID, foreign key)
- `role` (TEXT: 'user' or 'assistant')
- `content` (TEXT)
- `created_at` (TIMESTAMP)
- `sources` (JSONB, for RAG sources)
- `metadata` (JSONB)

## Customization

### Change User ID
Update the `user_id` parameter in the API calls (currently set to `"0"` for demo):
```typescript
// In chat-modal.tsx
const response = await fetch(`${API_BASE}/conversations/?user_id=YOUR_USER_ID`);
```

### Modify Sidebar Behavior
```typescript
// In chat-modal.tsx
const [showSidebar, setShowSidebar] = useState(true); // Show by default
```

### Adjust Conversation Limit
```typescript
// In chat-modal.tsx
const response = await fetch(`${API_BASE}/conversations/?limit=100`); // Get more conversations
```

## Troubleshooting

### Sidebar not showing on desktop
The sidebar uses responsive classes. Check the `lg:hidden` class is applied only to the mobile menu button.

### Conversations not loading
1. Verify the backend server is running on `http://127.0.0.1:8000`
2. Check browser console for API errors
3. Verify the Supabase schema was created correctly

### Messages not saving
1. Ensure a conversation is created before sending messages
2. Check that `currentConversationId` is set
3. Verify the database connection in `db_pool.py`

### CORS issues
Add CORS headers in Django settings if accessing from a different origin:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

## Future Enhancements

Potential features to add:
- [ ] User authentication integration
- [ ] Conversation search/filter
- [ ] Export conversation to PDF/text
- [ ] Share conversation via link
- [ ] Pin important conversations
- [ ] Conversation tags/categories
- [ ] Message editing
- [ ] Voice input support

## Support

For issues or questions, check:
1. Browser console for errors
2. Backend logs for API issues
3. Supabase dashboard for database queries
4. Network tab for API request/response details
