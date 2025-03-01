import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { getUserChatSessions, deleteChatSession } from '../services/firebase/chatHistory';
import { useTheme } from '../contexts/ThemeContext';

const ChatSidebar = ({ isOpen, onToggle, onNewChat, onNewQuestionnaire, currentChatId }) => {
  const [user] = useAuthState(auth);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { chatId: paramChatId } = useParams();
  const { profileTheme, getThemeGradient } = useTheme();
  
  // Use either the provided currentChatId or the one from URL params
  const activeChatId = currentChatId || paramChatId;

  // Fetch chat history whenever the user or activeChat changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) {
        setChatSessions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching chat sessions for user:', user.uid);
        const sessions = await getUserChatSessions(user.uid);
        console.log('Fetched sessions:', sessions);
        
        // Ensure chats are sorted by updatedAt in descending order (most recent first)
        const sortedSessions = sessions.sort((a, b) => {
          const dateA = new Date(a.updatedAt);
          const dateB = new Date(b.updatedAt);
          return dateB - dateA;
        });
        
        setChatSessions(sortedSessions || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        // Just show a message but don't treat it as an error as we're using local storage fallback
        setError(null); 
        setChatSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
    
    // Add event listener for local storage changes to update sidebar
    const handleStorageChange = (e) => {
      if (e.key === 'swallow_hero_chats' || e.type === 'storage') {
        fetchChatHistory();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, activeChatId]); // Re-fetch when these change

  const handleChatSelect = (id) => {
    if (id !== activeChatId) {
      console.log('Selecting chat:', id);
      // Force a reload of the chat data
      setLoading(true);
      navigate(`/chat/${id}`, { replace: true });
      
      // Dispatch storage event to ensure chat data is refreshed
      window.dispatchEvent(new Event('storage'));
      
      if (onToggle && window.innerWidth < 768) { // Close sidebar on mobile
        onToggle();
      }
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    // Add confirmation before deletion
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }
    
    try {
      await deleteChatSession(id);
      
      // Remove from local state immediately
      setChatSessions(prev => prev.filter(chat => chat.id !== id));
      
      // If the deleted chat is currently active, redirect to the main chat page
      if (id === activeChatId) {
        navigate('/chat', { replace: true });
      }
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Sidebar with integrated toggle button */}
      <aside 
        className={`fixed top-16 left-0 pt-0 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col z-30 border-r border-gray-200 dark:border-gray-700
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Chat History</h2>
        </div>
        
        <div className="p-3 space-y-2">
          {/* New Chat button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-white transition-colors bg-gradient-to-r hover:opacity-90 active:opacity-95 shadow-sm"
            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`, 
                   '--tw-gradient-from': '#0ea5e9', 
                   '--tw-gradient-to': '#10b981', 
                   '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
          
          {/* New Questionnaire button */}
          <button
            onClick={onNewQuestionnaire}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>New Questionnaire</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : chatSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No chat history found
            </div>
          ) : (
            <ul className="space-y-1 p-2">
              {chatSessions.map((chat) => (
                <li 
                  key={chat.id}
                  className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-colors ${
                    chat.id === activeChatId 
                      ? 'bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 dark:border-sky-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <span className="mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-gray-800 dark:text-gray-200">
                      {chat.title || 'New Chat'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(chat.updatedAt)}
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    aria-label="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Toggle tab integrated with the sidebar */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[100%]"
        >
          <button
            onClick={onToggle}
            aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
            className="w-5 h-24 rounded-r-md bg-white dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center"
          >
            <div className="w-[2px] h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar; 