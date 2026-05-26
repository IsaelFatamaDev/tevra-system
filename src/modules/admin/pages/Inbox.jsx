import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import inboxService from '../services/inbox.service';
import { useAuth } from '../../../core/contexts/AuthContext';

export default function AdminInbox() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activePhone, setActivePhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();

    // Connect to WebSocket using the backend URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(API_URL);

    socket.on('connect', () => {
      
      if (user?.tenantId) {
        socket.emit('join_admin_room', { tenantId: user.tenantId });
      }
    });

    socket.on('whatsapp_message_received', (msg) => {
      
      loadConversations();
      
      
      setActivePhone((currentActive) => {
        if (currentActive === msg.phoneNumber) {
          setMessages((prev) => [...prev, msg]);
          inboxService.markAsRead(msg.phoneNumber);
        }
        return currentActive;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (activePhone) {
      loadMessages(activePhone);
    }
  }, [activePhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await inboxService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (phone) => {
    try {
      const data = await inboxService.getMessages(phone);
      setMessages(data);
      await inboxService.markAsRead(phone);
      
      loadConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePhone) return;

    try {
      await inboxService.sendMessage(activePhone, newMessage);
      setNewMessage('');
      // Message will be appended by the socket event from the backend
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-[#C5D8E8]/30 overflow-hidden">
      {}
      <div className="w-1/3 border-r border-[#C5D8E8]/30 flex flex-col bg-[#FAFAFA]">
        <div className="p-4 border-b border-[#C5D8E8]/30 bg-white">
          <h2 className="text-lg font-bold text-[#134074]">{t('admin.inbox.title', 'Bandeja de Entrada')}</h2>
          <p className="text-sm text-gray-500">WhatsApp Oficial</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conv) => (
            <div 
              key={conv.phoneNumber}
              onClick={() => setActivePhone(conv.phoneNumber)}
              className={`p-4 border-b border-[#C5D8E8]/10 cursor-pointer hover:bg-[#EEF4ED]/50 transition-colors ${activePhone === conv.phoneNumber ? 'bg-[#EEF4ED]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#134074] flex items-center justify-center text-white font-bold">
                  {conv.phoneNumber.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800 truncate">+{conv.phoneNumber}</span>
                    {!conv.isFromAdmin && !conv.isRead && (
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.text}</p>
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              No hay conversaciones recientes
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col bg-[#F5F7FB]">
        {activePhone ? (
          <>
            <div className="p-4 border-b border-[#C5D8E8]/30 bg-white flex items-center gap-3 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-[#134074] flex items-center justify-center text-white font-bold">
                {activePhone.slice(0, 2)}
              </div>
              <h3 className="font-bold text-[#134074]">+{activePhone}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex ${msg.isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${msg.isFromAdmin ? 'bg-[#134074] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.isFromAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-[#C5D8E8]/30">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-50 border border-[#C5D8E8]/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#134074]/20 focus:border-[#134074] transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-[#134074] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#13315C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-[64px] text-gray-200 mb-4">forum</span>
            <p>Selecciona una conversación para empezar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
}
