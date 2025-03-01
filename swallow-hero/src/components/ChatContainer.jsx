import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { getChatSession, createChatSession } from '../services/firebase/chatHistory';
import ChatInterface from './ChatInterface';
import ChatSidebar from './ChatSidebar';

const ChatContainer = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldCreateNewChat, setShouldCreateNewChat] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(!chatId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const fetchChatData = async () => {
      if (chatId && user) {
        try {
          setLoading(true);
          console.log("Fetching chat data for chatId:", chatId);
          const chatData = await getChatSession(chatId);
          
          if (chatData.userId === user.uid) {
            console.log("Chat data found:", chatData);
            setCurrentChat(chatData);
            setShowQuestionnaire(false);
            setShouldCreateNewChat(false);
            // Ensure sidebar is visible when viewing a chat
            setSidebarVisible(true);
          } else {
            console.error("Chat not found or permission denied");
            setError("Chat not found or you don't have permission to view it");
            navigate('/chat', { replace: true });
          }
        } catch (err) {
          console.error("Error fetching chat:", err);
          
          // Remove the error message as we're using local storage fallback
          // Just redirect to the main chat page
          navigate('/chat', { replace: true });
        } finally {
          setLoading(false);
        }
      } else if (!chatId) {
        // No chat ID in URL, reset state for new chat or questionnaire
        setCurrentChat(null);
        setLoading(false);
        
        if (user) {
          if (showQuestionnaire) {
            // Keep questionnaire visible if it's active
            setSidebarVisible(false);
          } else {
            // Otherwise, prepare for a new chat
            setShouldCreateNewChat(true);
            setSidebarVisible(true);
          }
        }
      }
    };

    fetchChatData();
    
    // Listen for local storage changes to update chat data
    const handleStorageChange = (e) => {
      console.log("Storage event detected:", e);
      if (chatId && user) {
        fetchChatData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [chatId, user, navigate, showQuestionnaire]);

  // Update sidebar visibility based on questionnaire state
  useEffect(() => {
    console.log("Questionnaire state changed:", showQuestionnaire);
    // Hide sidebar during questionnaire
    if (showQuestionnaire) {
      setSidebarVisible(false);
    } else {
      // Show sidebar after questionnaire is completed
      setSidebarVisible(true);
    }
  }, [showQuestionnaire]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleNewChat = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Create a new chat directly without showing questionnaire
      setShouldCreateNewChat(true);
      setShowQuestionnaire(false);
      setSidebarVisible(true);
      setCurrentChat(null);
      
      // Create a new chat with default welcome message
      if (user) {
        const initialMessages = [
          {
            role: "system",
            content: "You are a helpful AI assistant focused on providing supplement recommendations and health advice based on the user's profile. Remember that all advice should be general in nature and users should consult healthcare professionals before making changes to their health regimen."
          },
          {
            role: "assistant",
            content: "Hello! I'm Swallow Hero AI. How can I help you with your supplement needs today?"
          }
        ];
        
        const chatId = await createChatSession(
          user.uid,
          'New Chat',
          initialMessages
        );
        
        setCurrentChat({ id: chatId, messages: initialMessages });
        setShouldCreateNewChat(false);
        
        // Navigate to the new chat
        navigate(`/chat/${chatId}`, { replace: true });
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
      }
      
      // Don't auto-close sidebar on desktop
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat');
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = () => {
    setError(null);
    // Clear any existing chat data
    setCurrentChat(null);
    // Set questionnaire mode
    setShowQuestionnaire(true);
    setShouldCreateNewChat(true);
    // Hide sidebar during questionnaire
    setSidebarVisible(false);
    
    // Remove chat ID from URL to avoid confusion
    if (chatId) {
      navigate('/chat', { replace: true });
    }

    // Make sure loading is not active
    setLoading(false);
  };

  const handleChatCreated = (newChatId) => {
    if (newChatId) {
      setCurrentChat({ id: newChatId });
      setShouldCreateNewChat(false);
      setSidebarVisible(true);
      navigate(`/chat/${newChatId}`, { replace: true });
      
      // Manually trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    // Make sidebar visible again after questionnaire is complete
    setSidebarVisible(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-full relative">
      {/* Sidebar component - only show when sidebarVisible is true */}
      {sidebarVisible && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onNewQuestionnaire={handleStartQuestionnaire}
          currentChatId={currentChat?.id}
        />
      )}
      
      {/* Main content - Improved positioning to prevent overlap */}
      <div 
        className={`w-full h-full transition-all duration-300 ${
          sidebarVisible && sidebarOpen ? 'md:pl-72' : ''
        }`}
        style={{ 
          position: 'relative',
          overflowX: 'hidden'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md">
              <h3 className="text-red-500 text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-700 dark:text-gray-300">{error}</p>
              <button 
                onClick={handleNewChat}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Start New Chat
              </button>
            </div>
          </div>
        ) : (
          <ChatInterface
            currentChatId={currentChat?.id}
            initialMessages={currentChat?.messages || []}
            shouldStartNewChat={shouldCreateNewChat}
            onChatCreated={handleChatCreated}
            showQuestionnaire={showQuestionnaire}
            onQuestionnaireComplete={handleQuestionnaireComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 