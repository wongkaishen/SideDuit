# Chat Conversation Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           GlobalChatbot Component                        │   │
│  │  • Floating chat button (bottom-right)                   │   │
│  │  • Listens for 'openChatbot' events                      │   │
│  │  • Opens ChatModal with optional initial query           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ChatModal Component                         │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌─────────────────────────────────┐  │   │
│  │  │   SIDEBAR    │  │      MAIN CHAT AREA             │  │   │
│  │  ├──────────────┤  ├─────────────────────────────────┤  │   │
│  │  │              │  │  Header (title, new chat, etc)  │  │   │
│  │  │ + New Chat   │  │                                  │  │   │
│  │  │              │  │  ┌────────────────────────────┐  │  │   │
│  │  │ Recent Chats:│  │  │   Messages Container        │  │   │
│  │  │ • Chat 1     │  │  │   • User messages (right)   │  │   │
│  │  │ • Chat 2     │  │  │   • AI messages (left)      │  │   │
│  │  │ • Chat 3     │  │  │   • RAG sources             │  │   │
│  │  │ • ...        │  │  │   • Timestamps              │  │   │
│  │  │              │  │  └────────────────────────────┘  │  │   │
│  │  │ [Delete]     │  │                                  │  │   │
│  │  │              │  │  Input Area (send message)       │  │   │
│  │  └──────────────┘  └─────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  State Management:                                        │   │
│  │  • messages: ChatMessage[]                                │   │
│  │  • conversations: Conversation[]                          │   │
│  │  • currentConversationId: string | null                   │   │
│  │  • showSidebar: boolean                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Django)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  API Endpoints (finance/views.py):                              │
│                                                                   │
│  POST   /api/conversations/create/                              │
│         → create_conversation()                                  │
│         Creates new conversation, returns ID                     │
│                                                                   │
│  GET    /api/conversations/?user_id=X&limit=Y                   │
│         → get_conversations()                                    │
│         Returns list of conversations with metadata              │
│                                                                   │
│  GET    /api/conversations/{id}/messages/                       │
│         → get_conversation_messages()                            │
│         Returns all messages for conversation                    │
│                                                                   │
│  POST   /api/messages/save/                                     │
│         → save_message()                                         │
│         Saves user/assistant message to DB                       │
│                                                                   │
│  PUT    /api/conversations/{id}/                                │
│         → update_conversation()                                  │
│         Updates title, archive status                            │
│                                                                   │
│  DELETE /api/conversations/{id}/delete/                         │
│         → delete_conversation()                                  │
│         Removes conversation and all messages                    │
│                                                                   │
│  POST   /api/chat/                                              │
│         → chat_rag()                                             │
│         RAG-powered AI response with sources                     │
│                                                                   │
└────────────────────────────────────────────────────────────────┘
                             │
                             │ PostgreSQL Connection
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (PostgreSQL)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  conversations                                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  id (UUID, PK)                                           │   │
│  │  user_id (TEXT, nullable)                                │   │
│  │  title (TEXT)                                            │   │
│  │  created_at (TIMESTAMP)                                  │   │
│  │  updated_at (TIMESTAMP) ← auto-updated via trigger       │   │
│  │  is_archived (BOOLEAN)                                   │   │
│  │  metadata (JSONB)                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            │ 1:N relationship                    │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  messages                                                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  id (UUID, PK)                                           │   │
│  │  conversation_id (UUID, FK) ──────┐                      │   │
│  │  role (TEXT: 'user'|'assistant')  │ ON DELETE CASCADE    │   │
│  │  content (TEXT)                    │                      │   │
│  │  created_at (TIMESTAMP)           │                      │   │
│  │  sources (JSONB) ← RAG data       │                      │   │
│  │  metadata (JSONB)                  │                      │   │
│  └────────────────────────────────────┘                      │   │
│                                                                   │
│  Indexes:                                                        │
│  • idx_conversations_user_id                                     │
│  • idx_conversations_created_at                                  │
│  • idx_conversations_updated_at                                  │
│  • idx_messages_conversation_id                                  │
│  • idx_messages_created_at                                       │
│                                                                   │
│  Triggers:                                                       │
│  • update_updated_at_column() on conversations.updated_at        │
│  • update_conversation_timestamp() when message inserted         │
│                                                                   │
│  Views:                                                          │
│  • conversation_summaries (with message counts)                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Creating a New Chat

```
User clicks "New Chat"
        │
        ▼
Frontend: createNewConversation()
        │
        ▼
POST /api/conversations/create/
  body: { user_id: "0", title: "New Chat" }
        │
        ▼
Backend: create_conversation()
        │
        ▼
Supabase: INSERT INTO conversations
  RETURNING id, created_at
        │
        ▼
Backend: Return { conversation_id, created_at }
        │
        ▼
Frontend: setCurrentConversationId(id)
          setMessages([])
          loadConversations() // refresh list
```

### 2. Sending a Message

```
User types message & clicks Send
        │
        ▼
Frontend: handleSend()
        │
        ├─> Add user message to UI
        │   setMessages([...messages, userMessage])
        │
        ├─> Save to database
        │   saveMessageToDb('user', content)
        │       │
        │       ▼
        │   POST /api/messages/save/
        │     body: { conversation_id, role: 'user', content }
        │       │
        │       ▼
        │   Supabase: INSERT INTO messages
        │              Trigger: UPDATE conversations.updated_at
        │
        ├─> Get AI response
        │   POST /api/chat/
        │     body: { query, user_id }
        │       │
        │       ▼
        │   Backend: chat_rag() → RAG processing
        │       │
        │       ▼
        │   Return { response, sources }
        │
        ├─> Add AI message to UI
        │   setMessages([...messages, assistantMessage])
        │
        └─> Save AI response to database
            saveMessageToDb('assistant', response, sources)
                │
                ▼
            POST /api/messages/save/
              body: { conversation_id, role: 'assistant', content, sources }
                │
                ▼
            Supabase: INSERT INTO messages
```

### 3. Loading Previous Conversation

```
User clicks conversation in sidebar
        │
        ▼
Frontend: loadConversationMessages(conversationId)
        │
        ▼
GET /api/conversations/{id}/messages/
        │
        ▼
Backend: get_conversation_messages()
        │
        ▼
Supabase: SELECT * FROM messages 
          WHERE conversation_id = ? 
          ORDER BY created_at ASC
        │
        ▼
Backend: Return { messages: [...] }
        │
        ▼
Frontend: setMessages(loadedMessages)
          setCurrentConversationId(id)
          setShowSidebar(false) // close on mobile
```

### 4. Deleting Conversation

```
User clicks delete icon → confirm dialog
        │
        ▼
Frontend: deleteConversation(id)
        │
        ▼
DELETE /api/conversations/{id}/delete/
        │
        ▼
Backend: delete_conversation()
        │
        ▼
Supabase: DELETE FROM conversations WHERE id = ?
          (CASCADE deletes all messages)
        │
        ▼
Frontend: if (currentConversationId === id)
            setCurrentConversationId(null)
            setMessages([])
          loadConversations() // refresh list
```

## Component Hierarchy

```
App Layout
  └─ GlobalChatbot
       ├─ Floating Action Button
       │    └─ onClick: setIsChatOpen(true)
       │
       └─ ChatModal (when isOpen)
            ├─ Backdrop (blur overlay)
            │
            └─ Modal Container
                 ├─ Sidebar (responsive)
                 │    ├─ New Chat Button
                 │    └─ Conversation List
                 │         └─ Conversation Card (map)
                 │              ├─ Title
                 │              ├─ Message Count
                 │              ├─ Last Message Time
                 │              └─ Delete Button
                 │
                 └─ Main Chat Area
                      ├─ Header
                      │    ├─ Menu Toggle (mobile)
                      │    ├─ Title & Icon
                      │    ├─ New Chat Button (desktop)
                      │    ├─ Clear Chat Button
                      │    └─ Close Button
                      │
                      ├─ Messages Container
                      │    ├─ Empty State (if no messages)
                      │    │    ├─ Welcome Message
                      │    │    └─ Suggested Questions
                      │    │
                      │    └─ Message List (if messages)
                      │         └─ ChatMessage (map)
                      │              ├─ Avatar Icon
                      │              ├─ Content Bubble
                      │              │    ├─ Message Text
                      │              │    ├─ Timestamp
                      │              │    └─ Sources (if RAG)
                      │              └─ User Avatar
                      │
                      └─ Input Area
                           ├─ Text Input
                           ├─ Send Button
                           └─ Helper Text
```

## State Management Flow

```
Component Mount (isOpen = true)
  │
  ├─> useEffect: loadConversations()
  │     └─> GET /api/conversations/
  │           └─> setConversations(data)
  │
  └─> useEffect: focus input
        if initialQuery exists
          └─> handleSend(initialQuery)

User Interaction
  │
  ├─> New Chat Button
  │     └─> createNewConversation()
  │           └─> setCurrentConversationId(id)
  │           └─> setMessages([])
  │
  ├─> Select Conversation
  │     └─> loadConversationMessages(id)
  │           └─> setMessages(loaded)
  │           └─> setCurrentConversationId(id)
  │
  ├─> Send Message
  │     └─> handleSend()
  │           └─> Update UI immediately
  │           └─> Save to DB asynchronously
  │           └─> Get AI response
  │           └─> Update UI with response
  │           └─> Save response to DB
  │
  └─> Delete Conversation
        └─> deleteConversation(id)
              └─> API call
              └─> Update local state
              └─> Refresh conversation list
```

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, GSAP
- **Backend**: Django 6.0, Django REST Framework
- **Database**: Supabase (PostgreSQL)
- **Connection**: psycopg2 connection pooling
- **AI**: Google Generative AI (Gemini) for RAG responses
