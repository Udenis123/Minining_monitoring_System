import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { getConversations, getMessagingUsers } from "../api/messaging";
import { Conversation } from "../types";
import { Search, MessageCircle, Users, ArrowLeft } from "lucide-react";
import ConversationList from "./messaging/ConversationList";
import MessagesList from "./messaging/MessagesList";
import NewMessageForm from "./messaging/NewMessageForm";

export function Messaging() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [shouldRefreshConversations, setShouldRefreshConversations] =
    useState(false);

  // Check if user has permission to access messaging
  const hasMessagingPermission = user?.permissions.includes("access_messaging");

  // Fetch conversations on component mount
  useEffect(() => {
    if (hasMessagingPermission) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [hasMessagingPermission]);

  // Use effect to handle conversation refreshes
  useEffect(() => {
    if (shouldRefreshConversations) {
      fetchConversations();
      setShouldRefreshConversations(false);
    }
  }, [shouldRefreshConversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again.");
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await getMessagingUsers();
      if (response.success) {
        setAvailableUsers(response.data);
      }
    } catch (err) {
      console.error("Error fetching available users:", err);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowNewMessage(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.latest_message?.content
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleNewMessageClick = () => {
    setSelectedConversation(null);
    setShowNewMessage(true);
  };

  const handleBackClick = () => {
    setSelectedConversation(null);
    setShowNewMessage(false);
  };

  const handleMessageSent = () => {
    // Only update the flag instead of calling fetchConversations directly
    setShouldRefreshConversations(true);
  };

  if (!hasMessagingPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8 flex items-center justify-center h-[calc(100vh-2rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-500">
              You don't have permission to access the messaging system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 h-screen flex flex-col">
        <div className="flex-grow flex overflow-hidden">
          {/* Left panel - Conversations */}
          <div
            className={`w-1/3 border-r border-gray-200 bg-white overflow-y-auto 
            ${
              selectedConversation || showNewMessage
                ? "hidden md:block"
                : "block"
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Search className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
              </div>
              <div className="flex mt-4 space-x-2">
                <button
                  onClick={handleNewMessageClick}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>New Message</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Contacts</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-2 text-gray-500">Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "No conversations matching your search"
                  : "No conversations yet. Start a new message!"}
              </div>
            ) : (
              <ConversationList
                conversations={filteredConversations}
                onSelect={handleConversationSelect}
                selectedId={selectedConversation?.user.id}
              />
            )}
          </div>

          {/* Right panel - Messages or New Message */}
          <div
            className={`${
              selectedConversation || showNewMessage
                ? "block w-full md:w-2/3"
                : "hidden md:block md:w-2/3"
            } bg-white overflow-y-auto`}
          >
            {selectedConversation ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={handleBackClick}
                    className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="font-semibold text-lg">
                      {selectedConversation.user.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.user.email}
                    </p>
                  </div>
                </div>

                <MessagesList
                  conversationUserId={selectedConversation.user.id}
                  onMessageSent={handleMessageSent}
                />
              </div>
            ) : showNewMessage ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={handleBackClick}
                    className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-semibold text-lg">New Message</h2>
                </div>

                <NewMessageForm
                  availableUsers={availableUsers}
                  onMessageSent={() => {
                    fetchConversations();
                    setShowNewMessage(false);
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">
                    Your Messages
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select a conversation or start a new message to begin
                    chatting with other users.
                  </p>
                  <button
                    onClick={handleNewMessageClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Start a Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
