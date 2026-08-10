"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Building2, Users, FileText, Settings, LogOut, Mail, Telescope, Menu, X, Sun, Moon, Bell, CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Avoid hydration mismatch by only rendering theme toggle after mount
  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Companies", href: "/dashboard/companies", icon: Building2 },
    { name: "Hiring Managers", href: "/dashboard/hiring-managers", icon: Users },
    { name: "Email Outreach", href: "/dashboard/emails", icon: Mail },
    { name: "Resume", href: "/dashboard/resume", icon: FileText },
    { name: "Job Scout", href: "/dashboard/scout", icon: Telescope },
  ];

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("auth-storage");
      // Clear token cookie from frontend domain
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
      console.error(err);
    }
  };


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 overflow-hidden">
      
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 z-40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Personal Manager
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 dark:backdrop-blur-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Personal Manager
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 space-y-2 relative" ref={notifRef}>
          {/* Notifications Dropdown for Sidebar (Desktop) */}
          <div className="hidden md:block relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="flex items-center justify-between px-4 py-3 w-full rounded-xl text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3 relative">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {isNotifOpen && (
              <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-80 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden z-[60]">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                  <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-neutral-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`p-4 border-b border-gray-100 dark:border-neutral-800/50 last:border-0 ${notif.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">{notif.description}</p>
                          </div>
                          {!notif.isRead && (
                            <button 
                              onClick={() => markAsRead(notif._id)}
                              className="text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded shrink-0"
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-between px-4 py-3 w-full rounded-xl text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50 dark:bg-neutral-950 pt-16 md:pt-0 relative">
        {/* Mobile Notifications Dropdown overlay */}
        {isNotifOpen && (
          <div className="md:hidden absolute top-16 right-2 w-80 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-neutral-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 border-b border-gray-100 dark:border-neutral-800/50 last:border-0 ${notif.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{notif.description}</p>
                      </div>
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif._id)}
                          className="text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
