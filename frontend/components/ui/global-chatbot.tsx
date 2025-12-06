"use client";

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatModal } from './chat-modal';

/**
 * Global chatbot component that appears on all pages
 * Includes floating action button and modal
 * Listens for custom 'openChatbot' events to open with queries
 */
export const GlobalChatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  // Listen for custom event to open chatbot with a query
  useEffect(() => {
    const handleOpenChatbot = (event: CustomEvent) => {
      const query = event.detail?.query || '';
      setInitialQuery(query);
      setIsChatOpen(true);
    };

    window.addEventListener('openChatbot', handleOpenChatbot as EventListener);
    
    return () => {
      window.removeEventListener('openChatbot', handleOpenChatbot as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsChatOpen(false);
    setInitialQuery('');
  };

  return (
    <>
      {/* Floating Chat Button - Always visible on all pages */}
      <button
        onClick={() => {
          setInitialQuery('');
          setIsChatOpen(true);
        }}
        className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 group animate-bounce"
        title="Open AI Chat"
        style={{ animationDuration: '3s' }}
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        {/* Notification badge if there's chat history */}
        {typeof window !== 'undefined' && localStorage.getItem('sideduit_chat_history') && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-20"></span>
      </button>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleClose}
        initialQuery={initialQuery}
      />
    </>
  );
};

