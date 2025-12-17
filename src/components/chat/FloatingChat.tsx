import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, X, Send, Plus, Sparkles, ChevronLeft
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function FloatingChat() {
  const {
    chatRooms,
    currentChatId,
    viewMode,
    currentChatRoom,
    setCurrentChatId,
    setViewMode,
    createChatRoom,
    addChatMessage,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleOpen = () => {
    setViewMode('module');
    if (chatRooms.length === 0) {
      createChatRoom('New Chat');
    } else if (!currentChatId) {
      // Select the first chat if none is selected
      setCurrentChatId(chatRooms[0].id);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentChatId) return;

    const messageText = inputValue.trim();
    const chatId = currentChatId;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: [{ type: 'text' as const, text: messageText }],
      timestamp: new Date(),
    };
    addChatMessage(chatId, userMessage);
    setInputValue('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'bot' as const,
        content: [{ type: 'text' as const, text: `Thanks for your message! I'm here to help you with Airbridge integration. You asked: "${messageText}"` }],
        timestamp: new Date(),
      };
      addChatMessage(chatId, botMessage);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setViewMode('minimized');
  };


  // Minimized state - just show floating button
  if (viewMode === 'minimized') {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  // Modal state - fixed size
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed z-50 bottom-6 right-6 rounded-2xl shadow-2xl"
        style={{ width: 600, height: 1000 }}
      >
        <div className="flex h-full bg-white overflow-hidden rounded-2xl border border-gray-200">
          {/* Sidebar */}
          <motion.div
            className={`bg-gray-50 border-r border-gray-200 flex flex-col ${
              isSidebarCollapsed ? 'p-2' : 'p-4'
            }`}
            animate={{
              width: isSidebarCollapsed ? 56 : 200,
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Sidebar Header */}
            <div className={`flex items-center mb-3 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isSidebarCollapsed && (
                <h3 className="font-semibold text-gray-900 text-sm">Chats</h3>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-6 h-6 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-all text-xs"
              >
                <motion.div
                  animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-3 h-3" />
                </motion.div>
              </button>
            </div>

            {/* New Chat Button */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => createChatRoom()}
                className="w-full p-2 mb-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => createChatRoom()}
                className="w-full p-2 mb-2 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 hover:bg-white text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
            )}

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentChatId(room.id)}
                  className={`w-full rounded-lg transition-all ${
                    isSidebarCollapsed ? 'p-2 flex items-center justify-center' : 'p-2 text-left'
                  } ${
                    currentChatId === room.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                  }`}
                  title={isSidebarCollapsed ? room.title : undefined}
                >
                  {isSidebarCollapsed ? (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentChatId === room.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                        currentChatId === room.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <MessageCircle className="w-3 h-3" />
                      </div>
                      <div className={`text-xs truncate ${currentChatId === room.id ? 'font-semibold' : 'font-medium'}`}>
                        {room.title}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {currentChatRoom?.title || 'Airbridge AI'}
                  </h4>
                  <p className="text-xs text-gray-500">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {currentChatRoom?.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Start a conversation</h4>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Ask me anything about Airbridge, SDK integration, or troubleshooting.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentChatRoom?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-tl-md'
                        }`}
                      >
                        {message.content.map((content, idx) => (
                          <span key={idx}>
                            {content.type === 'text' ? content.text : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
