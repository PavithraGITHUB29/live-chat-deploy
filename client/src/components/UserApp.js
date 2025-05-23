import React, { useState } from 'react';
import './chat.css';

function UserApp({ socket, chatState, setChatState }) {
  const [message, setMessage] = useState('');

  const requestChat = () => {
    socket.emit('requestChat');
    setChatState(prev => ({ ...prev, status: 'waiting' }));
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const endChat = () => {
    socket.emit('endChat');
  };

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="chat-title">Live Support Chat</div>
        <div className="status-indicator">
          <div className={`status-dot ${chatState.status === 'chatting' ? 'online' : 'offline'}`}></div>
          <span>
            {chatState.status === 'idle' && 'Not connected'}
            {chatState.status === 'waiting' && 'Waiting for agent...'}
            {chatState.status === 'chatting' && 'Connected with agent'}
          </span>
        </div>
      </header>

      <main className="chat-area">
        {chatState.status === 'idle' && (
          <button className="request-button" onClick={requestChat}>
            Request Live Chat
          </button>
        )}

        {chatState.status === 'waiting' && (
          <div className="waiting-indicator">
            <div className="spinner"></div>
            <p>Waiting for an agent to respond...</p>
          </div>
        )}

        {chatState.status === 'chatting' && (
          <div className="message-container">
            {chatState.messages.map((msg, i) => (
              <div 
                key={i} 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'agent-message'}`}
              >
                {msg.text}
                <span className="message-time">{msg.time}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {chatState.status === 'chatting' && (
        <div className="input-area">
          <input
            type="text"
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
          <button className="end-button" onClick={endChat}>
            End Chat
          </button>
        </div>
      )}
    </div>
  );
}

export default UserApp;