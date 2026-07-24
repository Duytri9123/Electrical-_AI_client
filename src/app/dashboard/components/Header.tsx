import React from "react";
import Link from "next/link";
import {
  FileText,
  FileSpreadsheet,
  History,
  BookOpen,
  FileCode2,
  Zap,
  Settings,
  Info,
  Lock,
  Phone,
  Bell,
  LogOut,
  User,
  Shield,
} from "lucide-react";

type TabKey = "sld" | "boq" | "history" | "library" | "panel";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  userInitial: string;
  userFullName: string;
  userEmail: string;
  showUserMenu: boolean;
  toggleUserMenu: () => void;
  handleLogout: () => void;
  unreadCount: number;
  showNotifMenu: boolean;
  setShowNotifMenu: (show: boolean) => void;
  notifications: any[];
  notifLoading: boolean;
  handleMarkAllRead: () => void;
  handleReadNotif: (id: number, link: string | null) => void;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  notifMenuRef: React.RefObject<HTMLDivElement | null>;
  tokens?: number;
  role?: string;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  userInitial,
  userFullName,
  userEmail,
  showUserMenu,
  toggleUserMenu,
  handleLogout,
  unreadCount,
  showNotifMenu,
  setShowNotifMenu,
  notifications,
  notifLoading,
  handleMarkAllRead,
  handleReadNotif,
  userMenuRef,
  notifMenuRef,
  tokens,
  role,
}: HeaderProps) {
  const tabIcons: Record<TabKey, React.ReactNode> = {
    sld: <FileText className="w-3.5 h-3.5" />,
    boq: <FileSpreadsheet className="w-3.5 h-3.5" />,
    history: <History className="w-3.5 h-3.5" />,
    library: <BookOpen className="w-3.5 h-3.5" />,
    panel: <FileCode2 className="w-3.5 h-3.5" />,
  };

  const tabLabels: Record<TabKey, string> = {
    sld: "SLD Reader",
    boq: "Bảng Báo Giá",
    history: "Lịch sử bóc tách",
    library: "Thư viện thiết bị",
    panel: "Studio Bản Vẽ DWG",
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-5 flex-shrink-0 shadow-sm gap-3 font-sans">
      {/* LEFT GROUP: Toggle Sidebar Button + Main Feature Navigation Tabs */}
      <div className="flex items-center space-x-2 min-w-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Hiện thanh thông tin bên trái"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main Feature Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 overflow-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {(["sld", "boq", "history", "library", "panel"] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold"
              }`}
            >
              {tabIcons[key]}
              <span>{tabLabels[key]}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Token Count */}
        <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span className="font-bold text-amber-900 text-[11px] whitespace-nowrap">
            {(tokens ?? 0).toLocaleString()} tokens
          </span>
        </div>

        {/* Admin portal shortcut */}
        {role === "admin" && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || ""}/admin`}
            className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full font-bold text-[10px] hover:bg-red-100 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Admin</span>
          </a>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-slate-800">Thông báo</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifLoading ? (
                  <div className="p-4 text-center text-slate-400">Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleReadNotif(n.id, n.link)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read_at ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="font-bold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{n.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-xs"
          >
            {userInitial || "U"}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-xs">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50">
                <div className="font-bold text-slate-900 truncate">{userFullName}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail}</div>
              </div>
              <div className="py-1">
                <Link
                  href="/about"
                  className="px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 font-semibold transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giới thiệu hệ thống</span>
                </Link>
                <Link
                  href="/privacy"
                  className="px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 font-semibold transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chính sách bảo mật</span>
                </Link>
                <Link
                  href="/contact"
                  className="px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Liên hệ hỗ trợ</span>
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center space-x-2 transition-colors cursor-pointer border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
