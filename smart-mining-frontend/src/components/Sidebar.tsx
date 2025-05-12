import React from "react";
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
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

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
      icon: FileText,
      label: "Reports",
      href: "/reports",
      permission: "view_reports" as const,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-8">Mining Monitor</h1>
        <nav className="space-y-2">
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
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive ? "bg-blue-500 text-white" : "hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            }
            return null;
          })}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
