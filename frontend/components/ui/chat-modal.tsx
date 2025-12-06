"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, FileText, Trash2, Plus, MessageSquare, Menu, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    transaction_id: number;
    merchant: string;
    amount: number;
    date: string;
    category: string;
    similarity: number;
  }>;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const API_BASE = 'http://127.0.0.1:8000/finance/api';

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuerySentRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/conversations/?user_id=0&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch(`${API_BASE}/conversations/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '0',
          title: 'New Chat'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newConvId = data.conversation_id;
        setCurrentConversationId(newConvId);
        setMessages([]);
        await loadConversations();
        return newConvId;
      } else {
        console.error('Failed to create conversation:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages/`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          sources: msg.sources || []
        }));
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessageToDb = async (role: 'user' | 'assistant', content: string, sources: any[] = []) => {
    if (!currentConversationId) return;
    
    try {
      await fetch(`${API_BASE}/messages/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: currentConversationId,
          role,
          content,
          sources
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      await fetch(`${API_BASE}/conversations/${conversationId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      await loadConversations();
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}/delete/`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
        }
        await loadConversations();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Animate new messages
    if (messages.length > 0 && messagesContainerRef.current) {
      const lastMessage = messagesContainerRef.current.querySelector('.chat-message:last-of-type');
      if (lastMessage) {
        gsap.fromTo(lastMessage,
          {
            opacity: 0,
            y: 20,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.5)"
          }
        );
      }
    }
  }, [messages]);

  // Focus input when modal opens and handle initial query
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      
      // Send initial query if provided and not already sent
      if (initialQuery && !initialQuerySentRef.current) {
        setInput(initialQuery);
        // Wait a bit for the modal to render before sending
        setTimeout(() => {
          handleSend(initialQuery);
          initialQuerySentRef.current = true;
        }, 100);
      }
    } else {
      // Reset the ref when modal closes
      initialQuerySentRef.current = false;
    }
  }, [isOpen, initialQuery]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input.trim();
    
    if (!query || isLoading) return;

    // Create conversation if doesn't exist
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation();
      if (!convId) {
        // Show error but don't return - still try to get AI response
        console.error('Failed to create conversation, messages will not be saved');
      }
    }

    // Add user message with timestamp
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: query,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to DB (only if we have a conversation ID)
    if (convId) {
      await saveMessageToDb('user', query);

      // Auto-generate title from first message
      if (messages.length === 0) {
        const title = query.slice(0, 50) + (query.length > 50 ? '...' : '');
        await updateConversationTitle(convId, title);
      }
    }

    try {
      // Call RAG API
      const response = await fetch(`${API_BASE}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          user_id: '0', // Default user for demo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Add assistant message with timestamp
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to DB (only if we have a conversation ID)
      if (convId) {
        await saveMessageToDb('assistant', data.response, data.sources);
        await loadConversations(); // Refresh conversation list
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      // Add error message with timestamp
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the current chat?')) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  };

  const handleNewChat = async () => {
    const convId = await createNewConversation();
    if (convId) {
      setMessages([]);
      // Only hide sidebar on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowSidebar(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // GSAP animations for modal open/close
  useGSAP(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      // Reset initial state
      gsap.set(modalRef.current, {
        scale: 0.7,
        opacity: 0,
        rotationX: 15,
        y: 100,
        transformPerspective: 1000,
      });
      
      gsap.set(backdropRef.current, {
        opacity: 0,
      });

      // Create timeline for entrance animation
      const tl = gsap.timeline();
      
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(modalRef.current, {
        scale: 1,
        opacity: 1,
        rotationX: 0,
        y: 0,
        duration: 0.6,
        ease: "expo.out"
      }, "-=0.1")
      .from('.modal-header', {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "back.out(1.5)"
      }, "-=0.3")
      .from('.modal-content-area', {
        opacity: 0,
        duration: 0.4,
      }, "-=0.2")
      .from('.modal-input-area', {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "back.out(1.5)"
      }, "-=0.2");
    }
  }, { dependencies: [isOpen], scope: modalRef });

  // Handle close with animation
  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose
      });
      
      tl.to(modalRef.current, {
        scale: 0.7,
        opacity: 0,
        rotationX: -15,
        y: 100,
        duration: 0.4,
        ease: "expo.in"
      })
      .to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
      }, "-=0.2");
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Container - Glassmorphism */}
      <div ref={modalRef} className="relative w-full max-w-6xl h-[600px] flex rounded-3xl overflow-hidden shadow-2xl">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl" />
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 blur-xl animate-pulse" />
        
        {/* Sidebar - Chat History */}
        <div className={cn(
          "relative z-10 w-72 border-r border-white/20 bg-white/40 flex-col transition-all duration-300",
          showSidebar ? "flex" : "hidden lg:flex"
        )}>
          <div className="p-4 border-b border-white/20">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-semibold text-[#00001c]/60 mb-2 px-2">Recent Conversations</h3>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group p-3 rounded-xl cursor-pointer transition-all hover:bg-white/60",
                  currentConversationId === conv.id ? "bg-white/80 shadow-md" : "bg-white/40"
                )}
                onClick={() => {
                  loadConversationMessages(conv.id);
                  // Only hide sidebar on mobile
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setShowSidebar(false);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#00001c] truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-[#00001c]/60 mt-1">
                      {conv.message_count} messages
                    </p>
                    {conv.last_message_at && (
                      <p className="text-xs text-[#00001c]/40 mt-1">
                        {formatTimestamp(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-sm text-[#00001c]/40 text-center py-8">
                No conversations yet
              </p>
            )}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Header */}
          <div className="modal-header flex items-center justify-between p-6 border-b border-white/20 bg-white/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden"
              >
                {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#00001c]">SideDuit AI Assistant</h2>
                <p className="text-sm text-[#00001c]/60">
                  {messages.length > 0 ? `${messages.length} messages` : 'Ask me anything about your finances'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-green-100 rounded-full transition-colors group hidden lg:block"
                title="New chat"
              >
                <Plus className="w-4 h-4 text-[#00001c]/60 group-hover:text-green-600" />
              </button>
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                  title="Clear current chat"
                >
                  <Trash2 className="w-4 h-4 text-[#00001c]/60 group-hover:text-red-600" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#00001c]" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="modal-content-area flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#00001c] mb-2">
                  Welcome to SideDuit AI!
                </h3>
                <p className="text-[#00001c]/60 max-w-md mb-2">
                  I can help you understand your spending patterns, income trends, and financial insights.
                  Try asking me about your expenses or income!
                </p>
                <p className="text-xs text-[#00001c]/40 max-w-md">
                  💾 Your conversations are saved and can be accessed from the sidebar
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
                  {[
                    "How much did I spend this month?",
                    "What are my top expense categories?",
                    "Show me my income trends",
                    "What's my average daily spending?",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="p-3 text-left bg-white/60 hover:bg-white/80 rounded-xl border border-white/40 transition-all hover:shadow-md text-sm text-[#00001c]/80 hover:text-[#00001c]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "chat-message flex gap-3",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-4 shadow-md",
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                          : 'bg-white/80 backdrop-blur-sm text-[#00001c] border border-white/40'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.timestamp && (
                        <p className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === 'user' ? 'text-white' : 'text-[#00001c]'
                        )}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      )}
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-black/10">
                          <p className="text-xs font-semibold text-[#00001c]/60 mb-2 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Sources ({message.sources.length})
                          </p>
                          <div className="space-y-2">
                            {message.sources.slice(0, 3).map((source, sidx) => (
                              <div
                                key={sidx}
                                className="text-xs p-2 bg-white/60 rounded-lg border border-black/10"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-[#00001c]">
                                    {source.merchant}
                                  </span>
                                  <span className="text-[#00001c]/60">
                                    {source.similarity}% match
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[#00001c]/70">
                                  <span>{source.category}</span>
                                  <span className="font-mono">
                                    RM {source.amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-[#00001c]/50 mt-1">
                                  {source.date}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        U
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/40">
                      <div className="flex items-center gap-2 text-[#00001c]/60">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="modal-input-area p-6 border-t border-white/20 bg-white/40">
            <div className="relative flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your expenses, income, or trends..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-[#00001c] placeholder:text-[#00001c]/40 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#00001c]/40 mt-2 text-center">
              Press Enter to send • AI responses are based on your uploaded transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

