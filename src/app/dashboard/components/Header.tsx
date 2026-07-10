import React from "react";
import Link from "next/link";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
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
  // Restored props
  tokens: number;
  role: string;
}

export default function Header({
  setSidebarOpen,
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
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs sm:text-sm">
          <Link href="/huong-dan" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">📖 Hướng dẫn</Link>
          <Link href="/blog" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">📰 Blog</Link>
          <span className="text-slate-300 mx-0.5">|</span>
          <Link href="/about" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">Giới thiệu</Link>
          <Link href="/privacy" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">Bảo mật</Link>
          <Link href="/terms" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">Điều khoản</Link>
          <Link href="/contact" className="px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-600 font-semibold rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap">Liên hệ</Link>
        </nav>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Token Count */}
        <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-200">
          <span className="text-amber-500 text-sm">⚡</span>
          <span className="font-bold text-slate-700 text-[11px] whitespace-nowrap">
            {(tokens ?? 0).toLocaleString()} tokens
          </span>
        </div>

        {/* Admin portal shortcut */}
        {role === "admin" && (
          <a
            href="http://localhost:8000/admin"
            className="hidden sm:inline-flex px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full font-semibold text-[10px] hover:bg-red-100"
          >
            ⚙️ Admin
          </a>
        )}

        {/* Language Selection */}
        <div className="bg-slate-100 rounded-full border border-slate-200 p-0.5 flex text-[10px] font-semibold">
          <button className="px-2 py-0.5 rounded-full text-slate-400 hover:text-slate-600">EN</button>
          <button className="px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">VI</button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Thông báo</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-height-[240px] overflow-y-auto">
                {notifLoading ? (
                  <p className="text-[10px] text-center text-slate-400 py-4">Đang tải...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-[10px] text-center text-slate-400 py-4">Không có thông báo mới</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleReadNotif(n.id, n.link)}
                      className={`px-3.5 py-2 border-b border-slate-50 cursor-pointer hover:bg-slate-50 text-[11px] ${
                        !n.is_read ? "bg-blue-50/30 font-semibold" : "text-slate-600"
                      }`}
                    >
                      <div>{n.title}</div>
                      {n.body && <div className="text-[9px] text-slate-400 font-normal mt-0.5">{n.body}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100"
          >
            <div className="w-7.5 h-7.5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {userInitial}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{userFullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-slate-50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
