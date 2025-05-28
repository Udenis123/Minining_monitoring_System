import React, { useState } from "react";
import { sendMessage } from "../../api/messaging";
import { Send, Search } from "lucide-react";

interface NewMessageFormProps {
  availableUsers: any[];
  onMessageSent: () => void;
}

const NewMessageForm: React.FC<NewMessageFormProps> = ({
  availableUsers,
  onMessageSent,
}) => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedUser(null);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !message.trim() || sending || messageSent) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await sendMessage(selectedUser.id, message);

      if (response.success) {
        setMessage("");
        setMessageSent(true);

        setTimeout(() => {
          setMessageSent(false);
        }, 2000);

        onMessageSent();
      }

      setSending(false);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
      setSending(false);
      setMessageSent(false);
    }
  };

  const filteredUsers = searchTerm
    ? availableUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      {!selectedUser ? (
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for a user..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute top-3 left-3 text-gray-400 w-4 h-4" />
          </div>

          {searchTerm && (
            <div className="border border-gray-200 rounded-md overflow-hidden max-h-72 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="border border-gray-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">All Users</h3>
              </div>
              {availableUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users available
                </div>
              ) : (
                availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                Change
              </button>
            </div>
          </div>

          <div className="flex-1 p-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              This will start a new conversation with {selectedUser.name}.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center items-center space-x-2 p-2 rounded-md ${
                    !message.trim() || sending
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  disabled={!message.trim() || sending}
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMessageForm;
