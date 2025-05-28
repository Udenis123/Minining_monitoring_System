import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getMessages,
  sendMessage,
  markAllMessagesAsRead,
} from "../../api/messaging";
import { Message } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { Send, ChevronDown } from "lucide-react";

interface MessagesListProps {
  conversationUserId: number;
  onMessageSent: () => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  conversationUserId,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of the chat
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set up a scroll event listener to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when not at bottom (with some threshold)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch messages when the conversation user changes
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);

    // Mark all messages from this user as read
    markAllAsRead();
  }, [conversationUserId]);

  // Set up polling for new messages
  useEffect(() => {
    // Create an interval for polling
    const interval = setInterval(() => {
      if (conversationUserId) {
        refreshMessages();
      }
    }, 10000);

    // Clean up interval on unmount or when conversationUserId changes
    return () => clearInterval(interval);
  }, [conversationUserId]); // Remove messages.length dependency to prevent polling reset

  // Auto-scroll when the number of messages changes
  useEffect(() => {
    // Only auto-scroll if we're near the bottom already, or if we just loaded the first page
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (isNearBottom || page === 1) {
        setTimeout(() => {
          scrollToBottom();
        }, 100); // Small delay to ensure the DOM has updated
      }
    }
  }, [messages.length, scrollToBottom, page]);

  const fetchMessages = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationUserId, pageNum);

      if (response.success) {
        // Sort the messages by created_at timestamp to ensure chronological order
        const sortedMessages = [...response.data].sort(
          (a: Message, b: Message) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        if (pageNum === 1) {
          setMessages(sortedMessages);
        } else {
          // When loading more (older) messages, they should go at the beginning
          setMessages((prev) => [...sortedMessages, ...prev]);
        }

        setTotalMessages(response.meta.total);
        setHasMore(response.meta.current_page < response.meta.last_page);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    try {
      const response = await getMessages(conversationUserId, 1);

      if (response.success && response.data.length > 0) {
        // Create a Map of existing message IDs for faster lookup
        const existingIdsMap = new Map(
          messages.map((m: Message) => [m.id, true])
        );

        // Filter out messages that are already in the state
        const newMessages = response.data.filter(
          (m: Message) => !existingIdsMap.has(m.id)
        );

        if (newMessages.length > 0) {
          // Only update state if there are actual new messages
          setMessages((prev) => {
            // Create a Set of IDs from current messages for deduplication
            const currentIds = new Set(prev.map((m: Message) => m.id));

            // Filter out any duplicates before adding to state
            const uniqueNewMessages = newMessages.filter(
              (m: Message) => !currentIds.has(m.id)
            );

            // If we have new messages, mark them as read
            if (uniqueNewMessages.length > 0) {
              markAllAsRead();
            }

            // Sort all messages by created_at timestamp
            return [...prev, ...uniqueNewMessages].sort(
              (a: Message, b: Message) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing messages:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllMessagesAsRead(conversationUserId);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      const response = await sendMessage(conversationUserId, newMessage);

      if (response.success) {
        setNewMessage("");

        // Check if message already exists in state before adding
        const messageExists = messages.some(
          (m: Message) => m.id === response.data.id
        );

        if (!messageExists) {
          // Add the new message to the list only if it doesn't exist already
          // New messages should be at the end (chronologically later)
          setMessages((prev) =>
            [...prev, response.data].sort(
              (a: Message, b: Message) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
          );
        }

        // Notify parent component but don't trigger additional refreshes
        onMessageSent();
      }

      setSending(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setSending(false);
    }
  };

  // Helper function to format date as time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Group messages by date - make sure each group is sorted chronologically
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};

    // First sort all messages chronologically
    const sortedMessages = [...messages].sort(
      (a: Message, b: Message) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Then group by date
    sortedMessages.forEach((message: Message) => {
      const date = new Date(message.created_at);
      const dateKey = date.toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    // Sort the date keys in chronological order (oldest to newest)
    const sortedKeys = Object.keys(groups).sort(
      (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Create a new ordered object with sorted keys
    const orderedGroups: { [key: string]: Message[] } = {};
    sortedKeys.forEach((key: string) => {
      orderedGroups[key] = groups[key];
    });

    return orderedGroups;
  };

  // Format date for display
  const formatDateHeading = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateKey === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateKey === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 my-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 my-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center my-2">
                <button
                  onClick={handleLoadMore}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load earlier messages"}
                </button>
              </div>
            )}

            {Object.keys(messageGroups).map((dateKey) => (
              <div key={dateKey}>
                <div className="text-center my-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {formatDateHeading(dateKey)}
                  </span>
                </div>

                {messageGroups[dateKey].map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.is_mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!message.is_mine && (
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                        <span className="text-gray-600 text-xs font-medium">
                          {message.sender?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.is_mine
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.is_mine ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTimeAgo(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div ref={messagesEndRef} />

            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-md hover:bg-blue-600 transition-colors"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded-r-md ${
              !newMessage.trim() || sending
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
            disabled={!newMessage.trim() || sending}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesList;
