import React from "react";
import { Conversation } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelect,
  selectedId,
}) => {
  // Helper function to format date as time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <div
          key={conversation.user.id}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors
            ${selectedId === conversation.user.id ? "bg-blue-50" : ""}`}
          onClick={() => onSelect(conversation)}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {conversation.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">
                  {conversation.user.name}
                </h3>
                {conversation.latest_message && (
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(conversation.latest_message.sent_at)}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conversation.latest_message ? (
                  <>
                    {conversation.latest_message.is_sender && (
                      <span>You: </span>
                    )}
                    {truncateText(conversation.latest_message.content)}
                  </>
                ) : (
                  <span className="text-gray-400 italic">No messages yet</span>
                )}
              </p>
              {conversation.unread_count > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                    {conversation.unread_count}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
