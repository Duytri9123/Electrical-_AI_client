"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";

// Import split components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DeviceTable from "./components/DeviceTable";
import ReviewModal from "./components/ReviewModal";

type TabKey = "sld" | "library" | "export" | "panel";

interface Device {
  id: string;
  circuit: string;
  type: string;
  pole: number;
  current: number;
  icu: string;
  brand: string;
  model: string;
  status: string;
}

interface UploadedFile {
  id: number;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  project_id: number;
  version_id: number;
}

interface NotificationItem {
  id: number;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const api = axios.create({ baseURL: "/api/proxy" });

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState<TabKey>("sld");
  const [selectedBrand, setSelectedBrand] = useState("LS (standard)");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Device[] | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  // Review Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [confirmedMap, setConfirmedMap] = useState<Record<string, boolean>>({});

  const [dragOver, setDragOver] = useState(false);
  const [systemSettings, setSystemSettings] = useState<{ image_upload_enabled: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User menu & Notifications state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data && res.data.success) {
          setSystemSettings(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.data && res.data.success) {
        setNotifications(res.data.data.items);
        setUnreadCount(res.data.data.unread_count);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifMenu) fetchNotifications();
  }, [showNotifMenu]);

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleReadNotif = async (id: number, link: string | null) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
      if (link && link !== "#") {
        window.location.href = link;
      }
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Chỉ chấp nhận file JPG, PNG, PDF.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File tối đa 50MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setResponseTime(null);
    setModelUsed(null);
    setConfirmedMap({});

    try {
      const projRes = await api.post("/projects", { name: file.name.replace(/\.[^/.]+$/, "") });
      const pid = projRes.data.data.id;
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await api.post(`/projects/${pid}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setUploadProgress(100);
      setUploadedFile(uploadRes.data.data.file);
    } catch {
      setUploadError("Tải file thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);
  const handleClickUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
    e.target.value = "";
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setUploadError(null);
    setResponseTime(null);
    try {
      const res = await api.post(`/projects/${uploadedFile.project_id}/analyze`);
      setAnalysisResult(res.data.data.devices);
      setResponseTime(res.data.data.response_time);
      setModelUsed(res.data.data.model_used);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Phân tích thất bại.");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Add a new row to devices list
  const handleAddRow = () => {
    const newDevice: Device = {
      id: "new_" + Date.now(),
      circuit: "New branch",
      type: "MCB",
      pole: 3,
      current: 16,
      icu: "6kA",
      brand: "LS",
      model: "LA63N 3P 16A 6kA",
      status: "matched"
    };
    setAnalysisResult((prev) => (prev ? [...prev, newDevice] : [newDevice]));
  };

  const handleUpdateDevice = (index: number, field: keyof Device, value: any) => {
    setAnalysisResult((prev) => {
      if (!prev) return null;
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveDevice = (index: number) => {
    setAnalysisResult((prev) => {
      if (!prev) return null;
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleToggleConfirmDevice = (id: string) => {
    setConfirmedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "sld":
        const isImageEnabled = systemSettings === null || systemSettings.image_upload_enabled;
        return (
          <div className="space-y-3">
            {!isImageEnabled && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 text-xs flex items-start space-x-2">
                <span className="mt-0.5">⚠️</span>
                <span>The IMAGE upload zone has been temporarily disabled by the administrator. Please use the PDF zone below.</span>
              </div>
            )}

            {isImageEnabled ? (
              <div
                onClick={handleClickUpload}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-4 text-center bg-white cursor-pointer transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"}`}
              >
                <div className="text-2xl mb-1">📄</div>
                <div className="text-xs font-semibold text-slate-600">Click or drag-drop Image / PDF</div>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF (max 50MB)</p>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <>
                <div className="border border-slate-200 bg-slate-100/50 rounded-xl p-4 text-center opacity-60 cursor-not-allowed">
                  <div className="text-2xl mb-1">🖼️</div>
                  <div className="text-xs font-bold text-slate-500">IMAGE zone — drag-drop / click</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Diagram image (photo / export)</p>
                  <div className="flex justify-center space-x-1.5 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold">JPG</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold">PNG</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold">DXF</span>
                  </div>
                </div>

                <div
                  onClick={handleClickUpload}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-4 text-center bg-white cursor-pointer transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"}`}
                >
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-xs font-bold text-slate-700">PDF zone — drag-drop / click</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF diagram file</p>
                  <div className="flex justify-center space-x-1.5 mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-bold">PDF</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </div>
              </>
            )}

            {/* Upload progress indicator */}
            {uploading && (
              <div className="space-y-1.5 p-2 bg-blue-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between text-[10px] font-bold text-blue-700">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Uploaded File Info Card */}
            {uploadedFile && !uploading && (
              <div className="bg-yellow-50 border border-slate-200 rounded-lg relative p-2 flex items-center">
                <div className="flex-shrink-0 text-3xl text-slate-400">
                  {uploadedFile.file_type === "page_image" ? "🖼" : "📄"}
                </div>
                <div className="flex-1 text-[11px] text-slate-500 space-y-0.5 ">
                  <div className="truncate font-medium text-slate-700">{uploadedFile.file_name}</div>
                  <div>{formatSize(uploadedFile.file_size)}</div>
                </div>
                <button onClick={() => setUploadedFile(null)}
                  className="absolute -top-3 -right-1 w-5 h-5 px-2 flex items-center justify-center rounded-full bg-slate-300 hover:bg-red-400 hover:text-white text-slate-500 text-[11px] font-bold transition-colors z-10 cursor-pointer shadow-sm">
                  ✕
                </button>
              </div>
            )}

            {/* Upload Error Alert */}
            {uploadError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] font-semibold">
                {uploadError}
              </div>
            )}

            {/* Brand / Agent select zone */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chọn hãng đối chiếu</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option>LS (standard)</option>
                <option>Schneider</option>
                <option>Chint</option>
                <option>ABB</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!uploadedFile || analyzing}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
            >
              {analyzing ? "⏳ Đang phân tích..." : "🔍 Analyze"}
            </button>
          </div>
        );
      case "library":
        return (
          <div className="space-y-2 text-sm text-slate-600">
            {[{ icon: "🏷", label: "Nhãn hiệu", detail: "4 brands" },
            { icon: "🗂", label: "Danh mục", detail: "5 categories" },
            { icon: "📦", label: "Dòng SP", detail: "8 series" },
            { icon: "🔧", label: "Model", detail: "12 models" },
            ].map((it, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <span>{it.icon} <b>{it.label}</b></span>
                <span className="text-xs text-slate-400">{it.detail}</span>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">📤</div>
            <p className="text-xs text-slate-500">Đang phát triển</p>
          </div>
        );
    }
  };

  const deviceCount = analysisResult?.length ?? 0;
  const matchCount = analysisResult?.filter((d) => d.status === "matched").length ?? 0;
  const userFullName = user?.profile?.full_name || user?.name || "User";
  const userEmail = user?.email || "";
  const userInitial = userFullName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderTabContent={renderTabContent}
        uploading={uploading}
        handleClickUpload={handleClickUpload}
      />

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          setSidebarOpen={setSidebarOpen}
          userInitial={userInitial}
          userFullName={userFullName}
          userEmail={userEmail}
          showUserMenu={showUserMenu}
          toggleUserMenu={() => setShowUserMenu(!showUserMenu)}
          handleLogout={handleLogout}
          unreadCount={unreadCount}
          showNotifMenu={showNotifMenu}
          setShowNotifMenu={setShowNotifMenu}
          notifications={notifications}
          notifLoading={notifLoading}
          handleMarkAllRead={handleMarkAllRead}
          handleReadNotif={handleReadNotif}
          userMenuRef={userMenuRef}
          notifMenuRef={notifMenuRef}
          tokens={user?.tokens ?? 1000000}
          role={user?.role || "user"}
        />

        {/* TABS */}
        <section className="bg-white border-b border-slate-200 px-4 py-0 flex space-x-1 overflow-x-auto shadow-sm">
          {(["sld", "library", "export", "panel"] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
            >
              {{ sld: "📄 SLD Reader", library: "📂 Library", export: "📤 Export", panel: "🧩 Panel Design" }[key]}
            </button>
          ))}
        </section>

        {/* MAIN BODY */}
        <main className="flex-1 bg-slate-50 p-3 sm:p-5 flex flex-col space-y-4 overflow-y-auto">

          {/* Status widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="dashboard-card p-3 flex items-center space-x-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h6v6H9z" />
                <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
              </svg>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">DEVICES</div>
                <div className="text-sm font-bold">{deviceCount} devices</div>
              </div>
            </div>

            <div className="dashboard-card p-3 flex items-center space-x-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="12" cy="18" r="2.5" />
                <path d="M6 8.5v3a2 2 0 002 2h8a2 2 0 002-2v-3M12 13.5v2" />
              </svg>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">BRANCHES</div>
                <div className="text-sm font-bold">{deviceCount > 0 ? Math.ceil(deviceCount / 2) : 0} branches</div>
              </div>
            </div>

            <div className="dashboard-card p-3 flex items-center space-x-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-purple-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 8l6 4-6 4" />
              </svg>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">MAIN CB</div>
                <div className="text-sm font-bold">{deviceCount > 0 ? "1 Main" : "0"}</div>
              </div>
            </div>

            <div className="dashboard-card p-3 flex items-center space-x-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 8h13l-3-3M21 16H8l3 3" />
              </svg>
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">DB MATCH</div>
                <div className="text-sm font-bold">{matchCount} matches</div>
              </div>
            </div>
          </div>

          {/* Action buttons (Aligned bottom left, no border border/padding wrapper) */}
          <div className="flex items-center gap-2 justify-start">
            <button
              onClick={handleAddRow}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
            >
              <span>+ Row</span>
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-600 shadow-sm transition-all cursor-pointer"
            >
              <span>🔍 Review</span>
            </button>
            <button
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-600 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span>→ Layout ↗</span>
            </button>
          </div>

          {/* Response time info */}
          {responseTime !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs flex justify-between items-center shadow-sm">
              <span>🤖 AI Model used: <b className="font-mono">{modelUsed}</b></span>
              <span>⚡ API Execution latency: <b>{responseTime}ms</b></span>
            </div>
          )}

          {/* Interactive Device Table */}
          {analyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="animate-spin w-20 h-20 text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="absolute text-2xl animate-pulse">📋</div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-sm font-bold text-slate-700 tracking-wider">SERVER is analyzing...</h3>
                <div className="w-56 bg-slate-200 h-1.5 rounded-full overflow-hidden mx-auto mt-1 relative">
                  <div className="bg-emerald-650 h-full rounded-full absolute left-0 top-0 animate-[pulse_1s_infinite] w-3/4" style={{ backgroundColor: '#10b981' }}></div>
                </div>
                <p className="text-xs text-slate-500 font-medium">Matching to database...</p>
              </div>
            </div>
          ) : analysisResult ? (
            <DeviceTable
              devices={analysisResult}
              onUpdateDevice={handleUpdateDevice}
              onRemoveDevice={handleRemoveDevice}
              onAddDevice={handleAddRow}
            />
          ) : (
            <div className="flex-1 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center space-y-2">
              <div className="text-3xl text-slate-300">📋</div>
              <h3 className="text-sm font-bold text-slate-400">Bắt đầu bằng cách tải lên bản vẽ</h3>
              <p className="text-[12px] text-slate-400">Upload Image/PDF để bắt đầu nhận dạng và bóc tách thiết bị.</p>
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
      {analysisResult && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          devices={analysisResult}
          currentIndex={currentReviewIndex}
          onNavigate={setCurrentReviewIndex}
          onUpdateDevice={handleUpdateDevice}
          confirmedMap={confirmedMap}
          onToggleConfirm={handleToggleConfirmDevice}
        />
      )}
    </div>
  );
}
