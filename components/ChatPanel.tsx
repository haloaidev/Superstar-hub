import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import styles from '../styles/chat.module.css';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

interface ChatPanelProps {
  channelId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ channelId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('Viewer');
  const [connected, setConnected] = useState(false);
  const [usernameSet, setUsernameSet] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_channel', { channelId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('chat_message', (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    });

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [channelId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socketRef.current) return;

    const message: ChatMessage = {
      id: `${Date.now()}`,
      user: usernameSet ? username : 'Viewer',
      message: inputValue,
      timestamp: Date.now(),
    };

    socketRef.current.emit('send_message', {
      channelId,
      ...message,
    });

    setInputValue('');
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      setUsernameSet(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!usernameSet) {
    return (
      <div className={styles.usernameSetup}>
        <h3>Enter Your Username</h3>
        <div className={styles.usernameInput}>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            maxLength={30}
            onKeyPress={e => e.key === 'Enter' && handleSetUsername()}
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.header}>
        <h3>Live Chat</h3>
        <div className={styles.connectionStatus}>
          <span className={`${styles.indicator} ${connected ? styles.connected : ''}`}></span>
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>No messages yet. Be the first to chat!</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={styles.message}>
              <div className={styles.messageUser}>
                <strong>{msg.user}</strong>
                <span className={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={styles.messageText}>{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputSection}>
        <textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={!connected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!connected || !inputValue.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
};
