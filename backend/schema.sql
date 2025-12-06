-- Supabase Schema for Chat Conversations and Messages
-- Run this in Supabase SQL Editor to create the necessary tables

-- Table: conversations
-- Stores individual chat sessions
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,  -- Optional: can be null for anonymous users, or store user identifier
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb  -- Store additional data like tags, categories, etc.
);

-- Table: messages
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sources JSONB DEFAULT '[]'::jsonb,  -- Store RAG sources if applicable
    metadata JSONB DEFAULT '{}'::jsonb  -- Store additional message data
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversations.updated_at when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = NOW() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_update_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (customize based on your auth setup)
-- For anonymous access (no auth)
CREATE POLICY "Allow all operations on conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL USING (true) WITH CHECK (true);

-- If you want to restrict by user_id in the future, replace the above with:
-- CREATE POLICY "Users can view their own conversations" ON conversations
--     FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
-- 
-- CREATE POLICY "Users can insert their own conversations" ON conversations
--     FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
-- 
-- CREATE POLICY "Users can view messages in their conversations" ON messages
--     FOR SELECT USING (
--         conversation_id IN (
--             SELECT id FROM conversations 
--             WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
--         )
--     );

-- Sample data (optional - for testing)
-- INSERT INTO conversations (user_id, title) VALUES ('test_user', 'Sample Chat 1');
-- INSERT INTO messages (conversation_id, role, content) 
-- SELECT id, 'user', 'Hello, what are my expenses?' FROM conversations LIMIT 1;

-- View to get conversation summaries with message counts
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT 
    c.id,
    c.user_id,
    c.title,
    c.created_at,
    c.updated_at,
    c.is_archived,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.user_id, c.title, c.created_at, c.updated_at, c.is_archived
ORDER BY c.updated_at DESC;

COMMENT ON TABLE conversations IS 'Stores chat conversation sessions';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN messages.sources IS 'RAG sources: array of transaction references with similarity scores';
COMMENT ON COLUMN conversations.metadata IS 'Additional metadata like tags, sentiment, or custom fields';
