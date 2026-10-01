import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bell } from 'lucide-react';

export function Chat({ messages = [], onSendMessage, currentUserId }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-panel">
      <div className="panel-header">
        <div className="panel-title">
          <MessageSquare size={15} />
          <span>Session Chat</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <MessageSquare size={24} className="empty-chat-icon" />
            <p>No messages yet. Say hello to your collaborators!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (msg.type === 'SYSTEM' || msg.type === 'JOIN' || msg.type === 'LEAVE') {
              return (
                <div key={msg.id || index} className="chat-system-message">
                  <Bell size={12} />
                  <span>{msg.content}</span>
                </div>
              );
            }

            const isMe = msg.userId === currentUserId;
            return (
              <div
                key={msg.id || index}
                className={`chat-bubble-container ${isMe ? 'chat-me' : 'chat-other'}`}
              >
                {!isMe && <span className="chat-author">{msg.username}</span>}
                <div className="chat-bubble">
                  <span className="chat-text">{msg.content}</span>
                  <span className="chat-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message... (Enter to send)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={!inputText.trim()}
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
