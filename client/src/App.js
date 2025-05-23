import React, { useState, useEffect } from 'react';
import UserApp from './components/UserApp';
import AgentApp from './components/AgentApp';
import io from 'socket.io-client';
import './components/chat.css';

const socket = io('http://localhost:5001');

function App() {
  const [activeTab, setActiveTab] = useState('user');
  const [chatState, setChatState] = useState({
    status: 'idle',
    messages: [],
    showRequest: false
  });

  useEffect(() => {
    const handleNewMessage = (data) => {
      setChatState(prev => {
        const messageExists = prev.messages.some(
          msg => msg.text === data.text && msg.time === data.time
        );
        if (!messageExists) {
          return { ...prev, messages: [...prev.messages, data] };
        }
        return prev;
      });
    };

    socket.on('newChatRequest', () => {
      setChatState(prev => ({ ...prev, showRequest: true }));
    });

    socket.on('chatStarted', () => {
      setChatState(prev => ({ ...prev, status: 'chatting', showRequest: false }));
    });

    socket.on('receiveMessage', handleNewMessage);
    socket.on('chatEnded', () => {
      setChatState({ status: 'idle', messages: [], showRequest: false });
    });

    return () => {
      socket.off('newChatRequest');
      socket.off('chatStarted');
      socket.off('receiveMessage', handleNewMessage);
      socket.off('chatEnded');
    };
  }, []);

  return (
    <div className="app-container">
      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User
        </button>
        <button 
          className={`tab-button ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          Agent
        </button>
      </div>
      
      {activeTab === 'user' ? (
        <UserApp 
          socket={socket} 
          chatState={chatState} 
          setChatState={setChatState} 
        />
      ) : (
        <AgentApp 
          socket={socket} 
          chatState={chatState} 
          setChatState={setChatState} 
        />
      )}
    </div>
  );
}

export default App;