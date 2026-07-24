"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { UnifiedDeviceProvider } from "./context/UnifiedDeviceContext";

import lsCatalogData from "@/data/ls_catalog.json";
import abbCatalogData from "@/data/abb_catalog.json";
import schneiderCatalogData from "@/data/schneider_catalog.json";
import chintCatalogData from "@/data/chint_catalog.json";
import mitsubishiCatalogData from "@/data/mitsubishi_catalog.json";
import emicCatalogData from "@/data/emic_catalog.json";
import samwhaCatalogData from "@/data/samwha_catalog.json";
import accessoriesCatalogData from "@/data/accessories_catalog.json";

import { Image as ImageIcon, Sparkles, FileText, Plus, Search, LayoutGrid, FileSpreadsheet, Cpu, Zap, UploadCloud, RefreshCw, BookOpen, FolderOpen, CheckCircle, Clock, Trash2, Eye } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DeviceTable from "./components/DeviceTable";
import ReviewModal from "./components/ReviewModal";
import DwgCadStudio from "./components/DwgCadStudio";
import BoqQuotationTable from "./components/BoqQuotationTable";

type TabKey = "sld" | "boq" | "history" | "library" | "panel";

interface Device {
  id: string;
  level?: number;
  circuit: string;
  type: string;
  pole: number;
  current: number;
  icu: string;
  leakage?: string;
  cable?: string;
  power?: number;
  brand?: string;
  model: string;
  status: string;
}

interface UploadedFile {
  id: number;
  file_url: string;
  file_path?: string;
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

// Unified API client — single instance for all backend calls
const api = axios.create({ baseURL: "/api/proxy" });
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && (error.response?.status === 503 || error.response?.status === 504)) {
      console.warn("Proxy endpoint unavailable (503/504). Returning fallback empty result.");
      return Promise.resolve({
        data: { success: false, message: "Dịch vụ máy chủ tạm thời không khả dụng (503/504)", data: [] },
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config || {},
      });
    }
    return Promise.reject(error);
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState<TabKey>("sld");
  const [selectedBrand, setSelectedBrand] = useState("LS (standard)");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Device[] | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [layoutData, setLayoutData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  // Engineering analysis results from BE
  const [coordinationResult, setCoordinationResult] = useState<any>(null);
  const [thermalResult, setThermalResult] = useState<any>(null);
  const [busbarSpec, setBusbarSpec] = useState<any>(null);
  const [doorInstruments, setDoorInstruments] = useState<any[]>([]);

  // Review Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [confirmedMap, setConfirmedMap] = useState<Record<string, boolean>>({});

  const [dragOver, setDragOver] = useState(false);
  const [panelSearchTerm, setPanelSearchTerm] = useState("");
  const [showBomModal, setShowBomModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showAccessoryModal, setShowAccessoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [systemSettings, setSystemSettings] = useState<{ image_upload_enabled: boolean } | null>(null);

  // Library Explorer Filter States
  const [libSearchTerm, setLibSearchTerm] = useState("");
  const [libTypeFilter, setLibTypeFilter] = useState("all");
  const [libPoleFilter, setLibPoleFilter] = useState("all");

  // DWG Studio shared state — Sidebar and DwgCadStudio both use these
  const [dwgLayers, setDwgLayers] = useState<any[]>([]);
  const [dwgStudioData, setDwgStudioData] = useState<any | null>(null);

  const handleDwgLayersChange = useCallback((layers: any[]) => {
    setDwgLayers(layers);
  }, []);

  const handleDwgStudioStateChange = useCallback((data: any) => {
    setDwgStudioData(data);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User menu & Notifications state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingDiagramImage, setViewingDiagramImage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // History Projects states
  const [historyProjects, setHistoryProjects] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | string | null>(null);

  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);

  const currentCatalogData = (() => {
    const brandLower = selectedBrand.toLowerCase();
    if (brandLower.includes("abb")) return abbCatalogData;
    if (brandLower.includes("schneider")) return schneiderCatalogData;
    if (brandLower.includes("chint")) return chintCatalogData;
    if (brandLower.includes("mitsubishi")) return mitsubishiCatalogData;
    if (brandLower.includes("emic")) return emicCatalogData;
    if (brandLower.includes("samwha")) return samwhaCatalogData;
    return lsCatalogData;
  })();

  useEffect(() => {
    setIsMounted(true);
    // Verify session with server
    hydrate().then((ok) => {
      if (!ok) {
        router.replace("/login");
      }
    });
  }, []);

  // Fetch and populate history projects
  const fetchHistory = async (autoLoadLatest = true) => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/projects");
      if (res.data && res.data.success) {
        const projects = res.data.data || [];
        setHistoryProjects(projects);

        // Auto-load latest project only on page mount (not after a new upload)
        if (autoLoadLatest && projects.length > 0) {
          const latestProj = projects[0];
          const latestVer = latestProj.versions?.[0];
          if (latestVer?.devices) {
            setAnalysisResult((prev: Device[] | null) => (prev && prev.length > 0 ? prev : latestVer.devices));
            if (latestVer.layout) setLayoutData((prev: any) => (prev ? prev : latestVer.layout));
            if (latestVer.graph) setGraphData((prev: any) => (prev ? prev : latestVer.graph));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load history projects", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Auto-load history projects on page mount
  useEffect(() => {
    fetchHistory(true);
  }, []);

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch sử bóc tách này không?")) return;
    try {
      const res = await api.delete(`/projects/${projectId}`);
      if (res.data && res.data.success) {
        setHistoryProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (err) {
      console.error("Failed to delete project history", err);
      alert("Xóa lịch sử bóc tách thất bại.");
    }
  };

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
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name);
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!isImage && !isPdf) {
      setUploadError("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP...) hoặc file PDF.");
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

    // Generate instant local preview URL for images
    if (isImage) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    } else {
      setFilePreviewUrl(null);
    }

    try {
      const projName = file.name ? file.name.replace(/\.[^/.]+$/, "") : `Drawing_${Date.now()}`;
      const projRes = await api.post("/projects", { name: projName });
      const pid = projRes.data.data.id;
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await api.post(`/projects/${pid}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      if (uploadRes.data && uploadRes.data.success) {
        setUploadProgress(100);
        const d = uploadRes.data.data;
        // Backend returns: { file_id, file_name, file_url, version }
        setUploadedFile({
          id: d.file_id,
          file_url: d.file_url,
          file_path: d.file_url,
          file_type: d.file_url?.endsWith('.pdf') ? 'pdf' : 'image',
          file_name: d.file_name,
          file_size: file.size,
          project_id: pid,
          version_id: d.version?.id ?? 0,
        });
        setUploadError(null);
      } else {
        setUploadError(uploadRes.data?.message || "Tải file thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Tải file thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // Clipboard Paste Handler (Ctrl + V to paste image)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return; // Don't intercept paste when typing inside input fields
      }

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          e.preventDefault();
          handleFileUpload(file);
        }
      } else if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              e.preventDefault();
              const file = new File([blob], `pasted_diagram_${Date.now()}.png`, {
                type: blob.type || "image/png",
              });
              handleFileUpload(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

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
      if (res.data && res.data.success) {
        setAnalysisResult(res.data.data.devices);
        setLayoutData(res.data.data.layout);
        setGraphData(res.data.data.graph);
        setResponseTime(res.data.data.response_time);
        setModelUsed(res.data.data.model_used);
        // Engineering analysis results
        if (res.data.data.coordination) setCoordinationResult(res.data.data.coordination);
        if (res.data.data.thermal)      setThermalResult(res.data.data.thermal);
        if (res.data.data.busbar_spec)  setBusbarSpec(res.data.data.busbar_spec);
        if (res.data.data.door_instruments) setDoorInstruments(res.data.data.door_instruments || []);
        setUploadError(null);

        // Refresh history list silently (don't auto-load latest, we have fresh results)
        try {
          await fetchHistory(false);
        } catch {
          // ignore silent history fetch error
        }
      } else {
        setUploadError(res.data?.message || "Phân tích thất bại.");
      }
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
    try {
      await logout();
    } catch {
      // ignore errors, always redirect
    }
    window.location.href = "/login";
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
      case "boq":
        return (
          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <div className="font-extrabold text-slate-800 text-xs uppercase flex items-center space-x-1">
                <span>📊</span>
                <span>BẢNG BÁO GIÁ SẢN PHẨM</span>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Phân nhóm tự động: <b>Vỏ tủ + phụ kiện</b>, <b>Đầu vào</b>, <b>Đầu ra</b>, <b>Làm mát</b>.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("boq")}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg text-xs transition-colors shadow-sm cursor-pointer uppercase tracking-wider"
            >
              📊 Mở Bảng Báo Giá Chi Tiết
            </button>
          </div>
        );
      case "history":
        return (
          <div className="space-y-2 text-xs text-slate-600">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              📜 Lịch sử bóc tách ({historyProjects.length})
            </div>
            {loadingHistory ? (
              <div className="py-6 text-center text-slate-400">⏳ Đang tải lịch sử...</div>
            ) : historyProjects.length === 0 ? (
              <div className="py-6 text-center text-slate-400">Chưa có lịch sử bóc tách nào.</div>
            ) : (
              historyProjects.map((proj) => {
                const latestVer = proj.versions?.[0];
                const devCount = latestVer?.devices?.length ?? 0;
                return (
                  <div key={proj.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm space-y-1.5 hover:border-blue-400 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[170px]">{proj.name}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        {latestVer?.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>📦 {devCount} thiết bị</span>
                      <span>⏱ {new Date(proj.updated_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {latestVer?.devices && (
                      <button
                        onClick={() => {
                          setAnalysisResult(latestVer.devices);
                          if (latestVer.layout) setLayoutData(latestVer.layout);
                          if (latestVer.graph) setGraphData(latestVer.graph);
                          setActiveTab("sld");
                        }}
                        className="w-full mt-1 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded text-[10px] border border-blue-200 transition-colors cursor-pointer"
                      >
                        👁️ Xem lại bản vẽ này
                      </button>
                    )}
                  </div>
                );
              })
            )}
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
      case "panel":
        const filteredDevicesForPanel = (analysisResult || []).filter((d) => {
          const term = panelSearchTerm.toLowerCase();
          return (
            d.circuit.toLowerCase().includes(term) ||
            d.type.toLowerCase().includes(term) ||
            (d.brand && d.brand.toLowerCase().includes(term)) ||
            d.model.toLowerCase().includes(term)
          );
        });

        return (
          <div className="flex-1 flex flex-col space-y-3 min-h-0">
            <div className="p-1 border-b border-slate-150 flex justify-between items-center bg-white">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                DEVICES
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100/60 text-blue-700 border border-blue-200 rounded">
                {(analysisResult || []).length} ITEMS
              </span>
            </div>
            
            {/* Customer Project History Quick Link */}
            <button
              onClick={() => setActiveTab("history")}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>📜</span>
              <span>Lịch sử bản vẽ khách hàng ({historyProjects.length})</span>
            </button>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <button
                onClick={() => setShowBomModal(true)}
                className="py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-semibold text-[9.5px] transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>BOM Excel</span>
              </button>
              <button
                onClick={() => setShowBrandModal(true)}
                className="py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-semibold text-[9.5px] transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Brand DB</span>
              </button>
              <button
                onClick={() => setShowAccessoryModal(true)}
                className="py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-semibold text-[9.5px] transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Accessories</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-semibold text-[9.5px] transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
              >
                <span>Import</span>
              </button>
            </div>

            {/* Search Device */}
            <div className="p-2 border border-slate-200 bg-white rounded-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search device..."
                  value={panelSearchTerm}
                  onChange={(e) => setPanelSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 text-slate-800 placeholder-slate-400 text-[11px] py-1.5 pl-2.5 pr-8 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  🔍
                </div>
              </div>
            </div>

            {/* Device Catalog List */}
            <div className="flex-1 overflow-y-auto p-1 space-y-1.5 custom-scrollbar min-h-[220px]">
              {filteredDevicesForPanel.map((dev) => (
                <div
                  key={dev.id}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      {dev.circuit}
                    </span>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${
                      dev.type === "ACB"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : dev.type === "MCCB"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      {dev.type}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">
                    {dev.brand || "LS"} - {dev.model}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-500 font-bold">
                      {dev.current}A <span className="text-[9px] text-slate-400 font-medium">/ {dev.pole}P</span>
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {dev.icu}
                    </span>
                  </div>
                </div>
              ))}
              {filteredDevicesForPanel.length === 0 && (
                <div className="text-center py-6 text-[10px] text-slate-400 font-medium">
                  Không tìm thấy thiết bị
                </div>
              )}
            </div>
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
  const branchesCount = analysisResult?.filter((d) => (d.level ?? 1) > 0).length ?? 0;
  const matchCount = analysisResult?.filter((d) => d.status === "matched").length ?? 0;
  const mainDevice = analysisResult?.find((d) => (d.level ?? 1) === 0);
  const mainCbRating = mainDevice && mainDevice.current ? `${mainDevice.current}A` : "—";
  const userFullName = user?.profile?.full_name || (user as any)?.name || (user as any)?.full_name || (user?.email ? user.email.split('@')[0] : "Tài khoản");
  const userEmail = user?.email || "";
  const userInitial = userFullName.charAt(0).toUpperCase();

  // SSR mount guard
  if (!isMounted) return null;


  return (
    <div className="h-screen max-h-screen bg-slate-50 text-slate-800 flex font-sans overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        filePreviewUrl={filePreviewUrl}
        uploadError={uploadError}
        dragOver={dragOver}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        analyzing={analyzing}
        handleAnalyze={handleAnalyze}
        handleClickUpload={handleClickUpload}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
        systemSettings={systemSettings}
        formatSize={formatSize}
        historyProjects={historyProjects}
        loadingHistory={loadingHistory}
        selectedProjectId={selectedProjectId}
        onSelectHistoryProject={(proj) => {
          if (!proj || selectedProjectId === proj.id) {
            setSelectedProjectId(null);
            setAnalysisResult(null);
            setLayoutData(null);
            setGraphData(null);
            setUploadedFile(null);
            setFilePreviewUrl(null);
            setViewingDiagramImage(false);
            return;
          }
          setSelectedProjectId(proj.id);
          const latestVer = proj.versions?.[0];
          if (latestVer?.devices) {
            setAnalysisResult(latestVer.devices);
            if (latestVer.layout) setLayoutData(latestVer.layout);
            if (latestVer.graph) setGraphData(latestVer.graph);
            if (proj.files && proj.files.length > 0) {
              setUploadedFile(proj.files[0]);
              setFilePreviewUrl(proj.files[0].file_url || proj.files[0].file_path);
            } else {
              setUploadedFile(null);
              setFilePreviewUrl(null);
            }
            setViewingDiagramImage(false);
          }
        }}
        onDeleteHistoryProject={handleDeleteProject}
        analysisResult={analysisResult}
        activeTab={activeTab}
        libSearchTerm={libSearchTerm}
        setLibSearchTerm={setLibSearchTerm}
        libTypeFilter={libTypeFilter}
        setLibTypeFilter={setLibTypeFilter}
        libPoleFilter={libPoleFilter}
        setLibPoleFilter={setLibPoleFilter}
        cadLayers={dwgLayers.length > 0 ? dwgLayers.map((l, i) => ({
          id: l.name || `layer_${i}`,
          name: l.name,
          color: typeof l.color === 'number' ? `hsl(${(l.color * 30) % 360}, 70%, 50%)` : l.color,
          visible: l.visible !== false,
        })) : undefined}
        onToggleLayer={(layerId) => {
          setDwgLayers(prev => prev.map(l => 
            l.name === layerId ? { ...l, visible: !l.visible } : l
          ));
        }}
        dwgStudioData={dwgStudioData}
      />

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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

        {/* Mobile Navigation Tabs Bar (Visible ONLY on Mobile screens < md) */}
        <nav className="md:hidden bg-white border-b border-slate-200 px-3 py-1.5 flex items-center space-x-1.5 overflow-x-auto custom-scrollbar shrink-0 shadow-2xs">
          {(["sld", "boq", "history", "library", "panel"] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 shrink-0 ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 font-semibold"
              }`}
            >
              <span>
                {{
                  sld: "SLD Reader",
                  boq: "Bảng Báo Giá",
                  history: "Lịch sử bóc tách",
                  library: "Thư viện thiết bị",
                  panel: "Studio Bản Vẽ DWG",
                }[key]}
              </span>
            </button>
          ))}
        </nav>

        {/* MAIN BODY */}
        <main className={`flex-1 bg-slate-50 flex flex-col min-w-0 min-h-0 ${activeTab === "panel" ? "p-0 overflow-hidden" : "p-3 sm:p-5 overflow-y-auto space-y-4"}`}>

          {/* Status widgets Grid - ONLY FOR SLD TAB */}
          {activeTab === "sld" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div className="dashboard-card p-3.5 flex items-center space-x-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-200 p-0.5 bg-emerald-50/50 shadow-2xs">
                  <img src="/icons/kpi_device.jpg" alt="Thiết bị bóc tách" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">THIẾT BỊ BÓC TÁCH</div>
                  <div className="text-base font-black text-emerald-600 leading-none mt-1">{deviceCount}</div>
                  <div className="text-[9.5px] text-slate-400 font-medium mt-1">Total {deviceCount} devices</div>
                </div>
              </div>

              <div className="dashboard-card p-3.5 flex items-center space-x-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 border border-sky-200 p-0.5 bg-sky-50/50 shadow-2xs">
                  <img src="/icons/kpi_branch.jpg" alt="Số nhánh mạch" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">SỐ NHÁNH MẠCH</div>
                  <div className="text-base font-black text-sky-600 leading-none mt-1">{branchesCount}</div>
                  <div className="text-[9.5px] text-slate-400 font-medium mt-1">Active: {branchesCount} branches</div>
                </div>
              </div>

              <div className="dashboard-card p-3.5 flex items-center space-x-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 border border-amber-200 p-0.5 bg-amber-50/50 shadow-2xs">
                  <img src="/icons/kpi_maincb.jpg" alt="Aptomat chính" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">APTOMAT CHÍNH (MAIN CB)</div>
                  <div className="text-base font-black text-amber-600 leading-none mt-1">{mainCbRating}</div>
                  <div className="text-[9.5px] text-slate-400 font-medium mt-1">{mainDevice ? "1 Main, 0 Swgr" : "0 Main, 0 Swgr"}</div>
                </div>
              </div>

              <div className="dashboard-card p-3.5 flex items-center space-x-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-shadow">
                <div className="w-13 h-13 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-200 p-0.5 bg-emerald-50/50 shadow-2xs">
                  <img src="/icons/kpi_match.jpg" alt="Khớp thư viện" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">KHỚP THƯ VIỆN</div>
                  <div className="text-base font-black text-emerald-600 leading-none mt-1">{deviceCount > 0 ? `${matchCount}/${deviceCount}` : "—"}</div>
                  <div className="text-[9.5px] text-slate-400 font-medium mt-1">{matchCount} direct matches</div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons - ONLY FOR SLD TAB */}
          {activeTab === "sld" && (
            <div className="flex items-center gap-2 justify-start flex-wrap font-sans">
              <button
                onClick={handleAddRow}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Thêm dòng</span>
              </button>
              {uploadedFile && (
                <button
                  onClick={() => setViewingDiagramImage(!viewingDiagramImage)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{viewingDiagramImage ? "Xem bảng thiết bị" : "Xem bản vẽ gốc"}</span>
                </button>
              )}
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300/80 rounded-xl text-xs font-bold text-amber-800 shadow-2xs transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Duyệt linh kiện</span>
              </button>
              <button
                onClick={() => setActiveTab("panel")}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-white" />
                <span>Studio Bản Vẽ DWG</span>
              </button>
              {(analysisResult && analysisResult.length > 0) && (
                <button
                  onClick={() => setActiveTab("boq")}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
                  title="Báo giá tự động dựa trên các thiết bị đã bóc tách"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                  <span>Tạo Báo Giá</span>
                </button>
              )}
            </div>
          )}

          {/* Response time info - ONLY FOR SLD TAB */}
          {activeTab === "sld" && responseTime !== null && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-800 text-xs flex justify-between items-center shadow-2xs font-sans">
              <span className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Model AI: <b className="font-mono text-blue-900">{modelUsed}</b></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Thời gian phản hồi: <b>{responseTime}ms</b></span>
              </span>
            </div>
          )}

          {/* Interactive Device Table or BOQ or History or Panel Design */}
          {activeTab === "boq" ? (
            <BoqQuotationTable
              devices={analysisResult || []}
              projectName={layoutData?.panel_name || (historyProjects.length > 0 ? historyProjects[0]?.name : "DB FACADE 12F")}
              onUpdateDevice={handleUpdateDevice as (index: number, field: string, value: any) => void}
            />
          ) : activeTab === "history" ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">📜 Lịch sử phân tích & bóc tách báo giá</h2>
                  <p className="text-xs text-slate-500">Danh sách các dự án và bản vẽ bạn đã từng bóc tách trên hệ thống</p>
                </div>
                <button
                  onClick={async () => {
                    setLoadingHistory(true);
                    try {
                      const res = await api.get("/projects");
                      if (res.data?.success) setHistoryProjects(res.data.data);
                    } finally { setLoadingHistory(false); }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Làm mới</span>
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400 font-medium flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Đang tải danh sách lịch sử dự án...</span>
                </div>
              ) : historyProjects.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-sm font-semibold text-slate-700">Chưa có dự án nào được phân tích</div>
                  <p className="text-xs text-slate-400">Hãy nạp file sơ đồ ở thanh bên trái để bắt đầu bóc tách bản vẽ đầu tiên.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="p-3"># ID</th>
                        <th className="p-3">Tên Dự Án / Bản Vẽ</th>
                        <th className="p-3 text-center">Số Thiết Bị Bóc Tách</th>
                        <th className="p-3 text-center">Trạng Thái</th>
                        <th className="p-3">Thời Gian Cập Nhật</th>
                        <th className="p-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700">
                      {historyProjects.map((proj) => {
                        const latestVer = proj.versions?.[0];
                        const devCount = latestVer?.devices?.length ?? 0;
                        return (
                          <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-400">#{proj.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{proj.name}</div>
                              <div className="text-[10px] text-slate-400">Phiên bản: v{latestVer?.version_number ?? 1}</div>
                            </td>
                            <td className="p-3 text-center font-semibold text-emerald-600">
                              {devCount} thiết bị
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center space-x-1">
                                {latestVer?.status === 'completed' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Hoàn thành</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Đang xử lý</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(proj.updated_at).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              {latestVer?.devices && (
                                <button
                                  onClick={() => {
                                    setAnalysisResult(latestVer.devices);
                                    if (latestVer.layout) setLayoutData(latestVer.layout);
                                    if (latestVer.graph) setGraphData(latestVer.graph);
                                    setActiveTab("sld");
                                  }}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Xem Bóc Tách</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="px-2 py-1.5 bg-white border border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 font-bold rounded text-[11px] shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "library" ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 font-sans">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        THƯ VIỆN THIẾT BỊ CHÍNH HÃNG — {selectedBrand}
                      </h2>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {currentCatalogData.devices.filter((dev: any) => {
                          const term = libSearchTerm.toLowerCase();
                          const matchSearch = !term || (dev.ma && dev.ma.toLowerCase().includes(term)) || (dev.n && dev.n.toLowerCase().includes(term)) || (dev.series && dev.series.toLowerCase().includes(term));
                          const matchType = libTypeFilter === "all" || dev.t === libTypeFilter;
                          const matchPole = libPoleFilter === "all" || String(dev.p) === libPoleFilter;
                          return matchSearch && matchType && matchPole;
                        }).length} mã sản phẩm chính hãng
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Cơ sở dữ liệu thông số kỹ thuật 3D (R x C x S mm), số cực (P), dòng định mức (In A) & đơn giá catalog.
                    </p>
                  </div>
                </div>
              </div>

              {/* Devices Catalog Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl max-h-[calc(100vh-230px)] min-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="sticky top-0 z-10 shadow-2xs">
                    <tr className="bg-slate-100/90 backdrop-blur-xs text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-3">MÃ SP (MODEL)</th>
                      <th className="p-3">TÊN SẢN PHẨM MÔ TẢ</th>
                      <th className="p-3 text-center">LOẠI</th>
                      <th className="p-3 text-center">SỐ CỰC</th>
                      <th className="p-3 text-center">IN (AMPERE)</th>
                      <th className="p-3 text-center">ICU (KA)</th>
                      <th className="p-3 text-center">KÍCH THƯỚC W x H x D (MM)</th>
                      <th className="p-3 text-right">ĐƠN GIÁ CATALOG (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 text-[11px]">
                    {currentCatalogData.devices
                      .filter((dev: any) => {
                        const term = libSearchTerm.toLowerCase();
                        const matchSearch = !term || (dev.ma && dev.ma.toLowerCase().includes(term)) || (dev.n && dev.n.toLowerCase().includes(term)) || (dev.series && dev.series.toLowerCase().includes(term));
                        const matchType = libTypeFilter === "all" || dev.t === libTypeFilter;
                        const matchPole = libPoleFilter === "all" || String(dev.p) === libPoleFilter;
                        return matchSearch && matchType && matchPole;
                      })
                      .map((dev: any, idx: number) => (
                        <tr key={idx} className="hover:bg-blue-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-700">{dev.ma}</td>
                          <td className="p-3 font-medium text-slate-800">{dev.n}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9.5px] ${
                              dev.t === "MCCB" ? "bg-amber-50 text-amber-800 border border-amber-200" : dev.t === "ELCB" ? "bg-rose-50 text-rose-800 border border-rose-200" : dev.t === "Contactor" ? "bg-purple-50 text-purple-800 border border-purple-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}>
                              {dev.t}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{dev.p}P</td>
                          <td className="p-3 text-center font-bold text-emerald-600 font-mono">{dev.in}A</td>
                          <td className="p-3 text-center font-bold text-slate-500 font-mono">{dev.icu ? `${dev.icu}kA` : "-"}</td>
                          <td className="p-3 text-center font-bold text-slate-600 font-mono">{dev.w} x {dev.h} x {dev.d}</td>
                          <td className="p-3 text-right font-extrabold text-slate-900 font-mono">
                            {dev.g ? `${dev.g.toLocaleString('vi-VN')} đ` : "Liên hệ"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : analyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 font-sans min-h-[450px]">
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                {/* Glowing Background Accent */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Animated High-Tech Spinner */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
                  <svg className="animate-spin w-24 h-24 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <div className="absolute w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-blue-600 animate-pulse" />
                  </div>
                </div>

                {/* Status Text */}
                <div className="space-y-2 relative z-10">
                  <h3 className="text-base font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                    HỆ THỐNG AI ĐANG PHÂN TÍCH...
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
                    Đang quét cấu trúc sơ đồ, trích xuất mã thiết bị, dòng định mức (A) và đối chiếu bảng giá vật tư...
                  </p>
                </div>

                {/* Shimmer Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200/60 p-0.5">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 h-full rounded-full animate-[pulse_1.5s_infinite] w-4/5 shadow-xs"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Đang xử lý thị giác máy tính</span>
                    <span className="text-blue-600 font-mono">AI Processing...</span>
                  </div>
                </div>

                {/* Processing Steps Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2 text-center">
                    <Cpu className="w-3.5 h-3.5 mx-auto text-blue-600 mb-1 animate-spin" />
                    <span className="text-[9.5px] font-bold text-blue-900 block">Trích xuất sơ đồ</span>
                  </div>
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2 text-center">
                    <Zap className="w-3.5 h-3.5 mx-auto text-indigo-600 mb-1" />
                    <span className="text-[9.5px] font-bold text-indigo-900 block">Bóc tách thông số</span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 text-center">
                    <FileSpreadsheet className="w-3.5 h-3.5 mx-auto text-emerald-600 mb-1" />
                    <span className="text-[9.5px] font-bold text-emerald-900 block">Đối chiếu vật tư</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "panel" ? (
            <div className="w-full h-full flex-1 overflow-hidden">
              <DwgCadStudio
                onSyncDevicesToBoq={async (devs) => {
                  // 1. Set devices immediately for fast UI update
                  setAnalysisResult(devs as any);
                  setActiveTab("boq");
                  
                  // 2. Call backend engineering analysis for catalog match + thermal + protection
                  try {
                    const res = await api.post("/projects/analyze-dwg-devices", {
                      devices: (devs as any[]).map(d => ({
                        type: d.type,
                        brand: d.brand || 'LS',
                        pole: d.pole || 3,
                        current: d.current || 0,
                        name: d.name || '',
                        circuit: d.circuit || '',
                        model: d.model || '',
                        icu: d.icu || null,
                      })),
                    });
                    if (res.data?.success && res.data?.data) {
                      const eng = res.data.data;
                      if (eng.devices) setAnalysisResult(eng.devices as any);
                      if (eng.coordination) setCoordinationResult(eng.coordination);
                      if (eng.thermal) setThermalResult(eng.thermal);
                      if (eng.busbar) setBusbarSpec(eng.busbar);
                    }
                  } catch (err) {
                    console.warn("Backend DWG analysis unavailable, using local data only", err);
                  }
                }}
                onLayersChange={handleDwgLayersChange}
                onStudioStateChange={handleDwgStudioStateChange}
              />
            </div>
          ) : analysisResult && !viewingDiagramImage ? (
            <DeviceTable
              devices={analysisResult}
              onUpdateDevice={handleUpdateDevice}
              onRemoveDevice={handleRemoveDevice}
              onAddDevice={handleAddRow}
              hasUploadedDiagram={!!uploadedFile}
              onToggleDiagramView={() => setViewingDiagramImage(true)}
            />
          ) : uploadedFile ? (
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col space-y-3 overflow-hidden font-sans min-h-[500px]">
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider truncate">
                        SƠ ĐỒ ĐƠN TUYẾN SLD
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate">
                        {uploadedFile.file_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      Bản vẽ đã được nạp thành công. Nhấn "Bắt Đầu Phân Tích AI" để tự động bóc tách danh mục vật tư.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {analysisResult && (
                    <button
                      onClick={() => setViewingDiagramImage(false)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Xem Bảng Bóc Tách ({analysisResult.length})</span>
                    </button>
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-2 uppercase tracking-wider"
                  >
                    {analyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{analyzing ? "ĐANG PHÂN TÍCH..." : "BẮT ĐẦU PHÂN TÍCH AI"}</span>
                  </button>
                </div>
              </div>

              {/* Clean Single Image Viewer Box */}
              <div className="flex-1 w-full bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-hidden relative flex items-center justify-center p-3 shadow-inner">
                {filePreviewUrl || uploadedFile.file_url || uploadedFile.file_path ? (
                  <img
                    src={filePreviewUrl || uploadedFile.file_url || uploadedFile.file_path}
                    alt="Bản vẽ sơ đồ SLD đã tải vào"
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md border border-slate-200/90 bg-white"
                  />
                ) : (
                  <div className="text-center text-slate-400 py-12 space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <div className="text-xs font-bold text-slate-600">{uploadedFile.file_name}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center p-8 text-center space-y-3 font-sans min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs border border-blue-100">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-800">Tải Lên Hoặc Dán Sơ Đồ Điện (Ctrl + V)</h3>
                <p className="text-xs text-slate-400">Hỗ trợ các định dạng file: <b>JPG, PNG, WEBP, PDF</b></p>
              </div>
              <button
                onClick={handleClickUpload}
                className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Chọn File Sơ Đồ Điện</span>
              </button>
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
          diagramImageUrl={filePreviewUrl}
        />
      )}

      {/* BOM Editing Modal */}
      {showBomModal && analysisResult && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">📊 BOM Excel Editor</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Edit device details and save changes.</p>
              </div>
              <button onClick={() => setShowBomModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
            </div>
            <div className="space-y-2 text-xs max-h-[58vh] overflow-y-auto pr-1">
              {analysisResult.map((dev, idx) => (
                <div key={dev.id} className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                  <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 tracking-wider">
                    <span>{dev.circuit}</span>
                    <span className="text-blue-600">{dev.type} {dev.pole}P</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400">Model</label>
                      <input
                        type="text"
                        defaultValue={dev.model}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnalysisResult((prev) => prev ? prev.map((d, i) => i === idx ? { ...d, model: val } : d) : prev);
                        }}
                        className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-slate-800 text-[10px] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400">Brand</label>
                      <input
                        type="text"
                        defaultValue={dev.brand || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnalysisResult((prev) => prev ? prev.map((d, i) => i === idx ? { ...d, brand: val } : d) : prev);
                        }}
                        className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-slate-800 text-[10px] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400">Current (A)</label>
                      <input
                        type="number"
                        defaultValue={dev.current}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAnalysisResult((prev) => prev ? prev.map((d, i) => i === idx ? { ...d, current: val } : d) : prev);
                        }}
                        className="w-full border border-slate-200 bg-white rounded px-2 py-1 text-slate-800 text-[10px] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button onClick={() => setShowBomModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg">Huỷ</button>
              <button
                onClick={() => {
                  alert("✅ BOM changes applied!");
                  setShowBomModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
              >
                ✓ Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Switching Modal */}
      {showBrandModal && analysisResult && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">🏷️ Brand Database</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Apply global brand to all devices.</p>
              </div>
              <button onClick={() => setShowBrandModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {["LS", "ABB", "Schneider", "Mitsubishi", "Siemens", "Fuji"].map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setAnalysisResult((prev) =>
                      prev ? prev.map((d) => ({ ...d, brand })) : prev
                    );
                    setShowBrandModal(false);
                  }}
                  className="border border-slate-200 hover:border-blue-500 bg-white rounded-xl py-3 px-4 font-bold text-sm text-slate-700 hover:text-blue-700 transition-all cursor-pointer shadow-sm"
                >
                  {brand}
                </button>
              ))}
            </div>
            <button onClick={() => setShowBrandModal(false)} className="text-center text-xs text-slate-500 underline cursor-pointer">Đóng</button>
          </div>
        </div>
      )}

      {/* Accessories & Structural Components Modal */}
      {showAccessoryModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl flex flex-col p-5 max-h-[85vh]">
            <div className="flex justify-between items-start mb-3 border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>⚡ Thư viện Phụ kiện & Vật tư cơ khí tủ điện</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Thanh đồng Busbar, Thanh DIN Rail, Máng cáp PVC, Tấm kê AT</p>
              </div>
              <button onClick={() => setShowAccessoryModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100 cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {Object.entries(accessoriesCatalogData.categories).map(([catKey, category]: [string, any]) => (
                <div key={catKey} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {category.items?.length || 0} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {category.items?.map((item: any) => (
                      <div key={item.id} className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all flex flex-col justify-between space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-[11px] truncate flex items-center space-x-1">
                            {item.color && (
                              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                            )}
                            <span className="truncate">{item.name}</span>
                          </span>
                          {item.I_rated && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-mono">
                              {item.I_rated}A
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
                          <span>{item.w_mm}x{item.h_mm} mm</span>
                          <span>{item.len_mm ? `${item.len_mm}mm` : item.d_mm ? `d=${item.d_mm}mm` : ''}</span>
                        </div>

                        <button
                          onClick={() => {
                            const newDevice: Device = {
                              id: "acc_" + item.id + "_" + Date.now(),
                              circuit: item.name,
                              type: item.phase ? "Busbar" : category.name,
                              pole: 1,
                              current: item.I_rated || 0,
                              icu: "-",
                              brand: "Standard",
                              model: item.name,
                              status: "matched"
                            };
                            setAnalysisResult((prev) => (prev ? [...prev, newDevice] : [newDevice]));
                          }}
                          className="w-full py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded text-[10px] transition-colors cursor-pointer text-center"
                        >
                          + Thêm vào tủ & BOQ
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 mt-2 flex justify-end">
              <button
                onClick={() => setShowAccessoryModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Template Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">📥 Import Template</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Load a pre-configured BOM template.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-2.5 mb-4">
              {[
                { name: "MDB Standard (1 ACB + 10 MCB)", type: "standard" },
                { name: "DB Lighting (5 RCBO + 2 MCB)", type: "lighting" },
                { name: "Cap Bank (3 MCCB + 8 MCB)", type: "capbank" }
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => {
                    const sampleDevices: Device[] = tmpl.type === "standard"
                      ? [
                          { id: "acb-01", circuit: "Main ACB", type: "ACB", pole: 3, current: 630, icu: "50kA", model: "AS-630E3", brand: "LS", status: "matched" },
                          ...Array.from({ length: 10 }, (_, i) => ({
                            id: `mcb-${i+1}`, circuit: `C${i+1}-Light`, type: "MCB", pole: 1, current: 32, icu: "10kA", model: "BKN-1P", brand: "LS", status: "matched"
                          }))
                        ]
                      : tmpl.type === "lighting"
                      ? [
                          ...Array.from({ length: 5 }, (_, i) => ({
                            id: `rcbo-${i+1}`, circuit: `RCBO-L${i+1}`, type: "RCBO", pole: 1, current: 16, icu: "6kA", leakage: "30mA", model: "RKN-1P", brand: "LS", status: "matched"
                          })),
                          ...Array.from({ length: 2 }, (_, i) => ({
                            id: `mcb-${i+6}`, circuit: `MCCB-S${i+1}`, type: "MCB", pole: 1, current: 32, icu: "10kA", model: "BKN-1P", brand: "LS", status: "matched"
                          }))
                        ]
                      : [
                          { id: "mccb-01", circuit: "Main Cap", type: "MCCB", pole: 3, current: 125, icu: "36kA", model: "TS-125N", brand: "LS", status: "matched" },
                          { id: "mccb-02", circuit: "Cap Bank 1", type: "MCCB", pole: 3, current: 100, icu: "25kA", model: "TS-100N", brand: "LS", status: "matched" },
                          { id: "mccb-03", circuit: "Cap Bank 2", type: "MCCB", pole: 3, current: 100, icu: "25kA", model: "TS-100N", brand: "LS", status: "matched" },
                          ...Array.from({ length: 8 }, (_, i) => ({
                            id: `mcb-cap-${i+1}`, circuit: `CAP-C${i+1}`, type: "MCB", pole: 1, current: 20, icu: "10kA", model: "BKN-1P", brand: "LS", status: "matched"
                          }))
                        ];

                    setAnalysisResult(sampleDevices as Device[]);
                    setShowImportModal(false);
                    setActiveTab("panel");
                  }}
                  className="border border-slate-200 hover:border-emerald-500 bg-white rounded-xl py-3 px-4 font-bold text-sm text-slate-700 hover:text-emerald-700 transition-all cursor-pointer shadow-sm text-left flex items-center justify-between"
                >
                  <span>{tmpl.name}</span>
                  <span className="text-emerald-500 text-lg">↓</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowImportModal(false)} className="text-center text-xs text-slate-500 underline cursor-pointer">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
