import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatRoom, Message, ViewMode } from '../shared/types';

interface ChatContextType {
  // Chat state
  chatRooms: ChatRoom[];
  currentChatId: string | null;
  viewMode: ViewMode;

  // Actions
  setCurrentChatId: (chatId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  createChatRoom: (title?: string) => string;
  deleteChatRoom: (chatId: string) => void;
  addChatMessage: (chatId: string, message: Message) => void;
  updateChatTitle: (chatId: string, title: string) => void;

  // Current chat helper
  currentChatRoom: ChatRoom | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('minimized');

  const currentChatRoom = chatRooms.find(room => room.id === currentChatId);

  const createChatRoom = (title?: string): string => {
    const newId = `chat-${Date.now()}`;
    const newRoom: ChatRoom = {
      id: newId,
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setChatRooms(prev => [...prev, newRoom]);
    setCurrentChatId(newId);
    return newId;
  };

  const deleteChatRoom = (chatId: string) => {
    setChatRooms(prev => prev.filter(room => room.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const addChatMessage = (chatId: string, message: Message) => {
    setChatRooms(prev =>
      prev.map(room => {
        if (room.id !== chatId) return room;
        return { ...room, messages: [...room.messages, message] };
      })
    );
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChatRooms(prev =>
      prev.map(room => {
        if (room.id !== chatId) return room;
        return { ...room, title };
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        currentChatId,
        viewMode,
        currentChatRoom,
        setCurrentChatId,
        setViewMode,
        createChatRoom,
        deleteChatRoom,
        addChatMessage,
        updateChatTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
