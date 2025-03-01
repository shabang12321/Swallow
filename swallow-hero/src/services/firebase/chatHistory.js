import { db } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  deleteDoc 
} from 'firebase/firestore';

// Collection reference - ensure it matches the name in Firestore rules
const CHAT_COLLECTION = 'chatHistory';
const LOCAL_STORAGE_KEY = 'swallow_hero_chats';

// Helper function to get chats from local storage
const getLocalChats = () => {
  try {
    const chats = localStorage.getItem(LOCAL_STORAGE_KEY);
    return chats ? JSON.parse(chats) : [];
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
};

// Helper function to save chats to local storage
const saveLocalChats = (chats) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

// Generate a unique ID for local storage
const generateLocalId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Save a new chat session
 * @param {string} userId - The user ID
 * @param {string} title - The chat title
 * @param {Array} messages - The initial messages
 * @returns {Promise<string>} - The chat ID
 */
export const createChatSession = async (userId, title, messages = []) => {
  try {
    console.log("Creating chat with userId:", userId, "title:", title);
    // Create a timestamp that will work for both Firebase and local storage
    const timestamp = new Date().toISOString();
    
    const chatData = {
      userId,
      title: title || 'New Chat',
      messages,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    try {
      // First try Firebase
      const docRef = await addDoc(collection(db, CHAT_COLLECTION), {
        ...chatData,
        // Use server timestamp for Firebase
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("Chat created with ID:", docRef.id);
      return docRef.id;
    } catch (firebaseError) {
      console.warn('Firebase error, falling back to local storage:', firebaseError);
      
      // If Firebase fails, use local storage
      const localId = generateLocalId();
      const localChats = getLocalChats();
      
      localChats.push({
        id: localId,
        ...chatData
      });
      
      saveLocalChats(localChats);
      console.log("Chat created locally with ID:", localId);
      return localId;
    }
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

/**
 * Update an existing chat session
 * @param {string} chatId - The chat ID to update
 * @param {Array} messages - The updated messages
 * @param {string} title - The updated title (optional)
 */
export const updateChatSession = async (chatId, messages, title) => {
  try {
    // Create a timestamp that will work for both Firebase and local storage
    const timestamp = new Date().toISOString();
    
    const updateData = {
      messages,
      updatedAt: timestamp,
    };
    
    if (title) {
      updateData.title = title;
    }
    
    try {
      // First try Firebase
      const chatRef = doc(db, CHAT_COLLECTION, chatId);
      await updateDoc(chatRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      console.log(`Chat session ${chatId} updated successfully`);
    } catch (firebaseError) {
      console.warn('Firebase error, falling back to local storage:', firebaseError);
      
      // If Firebase fails, use local storage
      const localChats = getLocalChats();
      const chatIndex = localChats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        localChats[chatIndex] = {
          ...localChats[chatIndex],
          ...updateData
        };
        saveLocalChats(localChats);
        console.log(`Chat session ${chatId} updated in local storage`);
      } else {
        console.error('Chat not found in local storage:', chatId);
      }
    }
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
};

/**
 * Get a specific chat session
 * @param {string} chatId - The chat ID to retrieve
 * @returns {Promise<Object>} - The chat data
 */
export const getChatSession = async (chatId) => {
  try {
    try {
      // First try Firebase
      const chatRef = doc(db, CHAT_COLLECTION, chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        return { id: chatSnap.id, ...chatSnap.data() };
      }
    } catch (firebaseError) {
      console.warn('Firebase error, falling back to local storage:', firebaseError);
    }
    
    // If Firebase fails or chat doesn't exist, try local storage
    const localChats = getLocalChats();
    const chat = localChats.find(chat => chat.id === chatId);
    
    if (chat) {
      return chat;
    } else {
      throw new Error('Chat session not found');
    }
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
};

/**
 * Get all chat sessions for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - List of chat sessions
 */
export const getUserChatSessions = async (userId) => {
  try {
    try {
      // First try Firebase
      const chatQuery = query(
        collection(db, CHAT_COLLECTION),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(chatQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (firebaseError) {
      console.warn('Firebase error, falling back to local storage:', firebaseError);
    }
    
    // If Firebase fails, use local storage
    const localChats = getLocalChats();
    return localChats
      .filter(chat => chat.userId === userId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    console.error('Error getting user chat sessions:', error);
    throw error;
  }
};

/**
 * Delete a chat session
 * @param {string} chatId - The chat ID to delete
 */
export const deleteChatSession = async (chatId) => {
  try {
    try {
      // First try Firebase
      await deleteDoc(doc(db, CHAT_COLLECTION, chatId));
    } catch (firebaseError) {
      console.warn('Firebase error, falling back to local storage:', firebaseError);
      
      // If Firebase fails, use local storage
      const localChats = getLocalChats();
      const filteredChats = localChats.filter(chat => chat.id !== chatId);
      
      if (localChats.length !== filteredChats.length) {
        saveLocalChats(filteredChats);
      } else {
        console.error('Chat not found in local storage:', chatId);
      }
    }
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}; 