import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Mountain,
  Users,
  Activity,
  Bell,
  FileText,
  LogOut,
  Brain,
  LineChart,
  MessageCircle,
  User,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getUnreadCount } from "../api/messaging";

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.permissions.includes("access_messaging")) {
        try {
          const response = await getUnreadCount();
          if (response.success) {
            setUnreadCount(response.data.count);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      }
    };

    fetchUnreadCount();

    // Set up polling for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      permission: null,
    },
    {
      icon: Mountain,
      label: "Mine Sites",
      href: "/mines",
      permission: "view_all_mines" as const,
    },
    {
      icon: Users,
      label: "User Management",
      href: "/users",
      permission: "manage_users" as const,
    },
    {
      icon: Activity,
      label: "Sensors Monitor",
      href: "/monitoring",
      permission: "view_sensors" as const,
    },
    {
      icon: Brain,
      label: "Predictive Data",
      href: "/predictive",
      permission: "view_predective_data" as const,
    },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/messages",
      permission: "access_messaging" as const,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/reports",
      permission: "view_reports" as const,
    },
  ];

  const handleLogout = async () => {
    try {
      // Call logout from authStore
      await logout();

      // Additional cleanup
      localStorage.removeItem("token");

      // Clear any auth-related data from localStorage
      localStorage.removeItem("auth-storage");

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Ensure we navigate to login even if there's an error
      navigate("/login");
    }
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col overflow-y-auto">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-4">Mining Monitor</h1>

        {/* User Profile Section */}
        {user && (
          <div className="mb-6 pt-2 pb-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials(user.name)}
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <div className="flex items-center mt-1">
                  <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-600 text-white capitalize shadow-sm">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            // Show item if no permission required or user has permission
            if (
              !item.permission ||
              user?.permissions.includes(item.permission)
            ) {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive ? "bg-blue-500 text-white" : "hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            }
            return null;
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full mt-4 text-gray-300 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
