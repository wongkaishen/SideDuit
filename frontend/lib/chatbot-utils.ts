/**
 * Utility functions for interacting with the global chatbot
 */

/**
 * Opens the global chatbot modal
 * @param query - Optional initial query to send to the chatbot
 */
export const openChatbot = (query?: string) => {
  const event = new CustomEvent('openChatbot', {
    detail: { query: query || '' }
  });
  window.dispatchEvent(event);
};

