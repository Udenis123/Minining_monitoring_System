import axios from "axios";
import { Message, Conversation } from "../types";

// Use a hardcoded API URL or window.location to build a relative URL
const API_URL = "http://localhost:8000/api";

// Helper to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all messages or conversation with a specific user
export const getMessages = async (userId?: number, page = 1, perPage = 15) => {
  try {
    let url = `${API_URL}/messages?page=${page}&per_page=${perPage}`;

    // Add user_id filter if provided
    if (userId) {
      url += `&user_id=${userId}`;
    }

    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Get all conversations
export const getConversations = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/messages/conversations`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (recipientId: number, content: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/messages`,
      { recipient_id: recipientId, content },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId: number) => {
  try {
    const response = await axios.put(
      `${API_URL}/messages/${messageId}/read`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};

// Mark all messages from a user as read
export const markAllMessagesAsRead = async (userId: number) => {
  try {
    const response = await axios.put(
      `${API_URL}/messages/read-all/${userId}`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/messages/${messageId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/messages/unread-count`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Get list of users for messaging
export const getMessagingUsers = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/messages/users`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users for messaging:", error);
    throw error;
  }
};
