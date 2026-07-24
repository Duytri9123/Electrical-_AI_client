"use client";

import React, { useState, useRef } from "react";
import {
  Zap,
  UploadCloud,
  FileText,
  FileCode2,
  Layers,
  Cpu,
  BarChart3,
  Download,
  History,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  FileSpreadsheet,
  FolderOpen,
  Filter,
  ShieldCheck,
  Thermometer,
  Play,
  ChevronLeft,
  X,
  FileOutput,
  Box,
} from "lucide-react";
import type { DwgStudioStateData } from "./DwgCadStudio";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  uploading: boolean;
  uploadProgress: number;
  uploadedFile: any;
  setUploadedFile: (file: any) => void;
  filePreviewUrl?: string | null;
  uploadError: string | null;
  dragOver: boolean;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  analyzing: boolean;
  handleAnalyze: () => void;
  handleClickUpload: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  systemSettings: any;
  formatSize: (bytes: number) => string;
  historyProjects: any[];
  loadingHistory: boolean;
  selectedProjectId?: number | string | null;
  onSelectHistoryProject: (proj: any) => void;
  onDeleteHistoryProject: (id: number) => void;
  analysisResult?: any[] | null;
  activeTab?: string;
  libSearchTerm?: string;
  setLibSearchTerm?: (term: string) => void;
  libTypeFilter?: string;
  setLibTypeFilter?: (type: string) => void;
  libPoleFilter?: string;
  setLibPoleFilter?: (pole: string) => void;

  // Panel CAD Controls & DWG Studio Data
  panelViewMode?: "sheet" | "cad" | "3d";
  setPanelViewMode?: (mode: "sheet" | "cad" | "3d") => void;
  cadLayers?: any[];
  onToggleLayer?: (layerId: string) => void;
  dwgStudioData?: DwgStudioStateData | null;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  uploading,
  uploadProgress,
  uploadedFile,
  setUploadedFile,
  filePreviewUrl,
  uploadError,
  dragOver,
  selectedBrand,
  setSelectedBrand,
  analyzing,
  handleAnalyze,
  handleClickUpload,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleFileChange,
  fileInputRef,
  systemSettings,
  formatSize,
  historyProjects,
  loadingHistory,
  selectedProjectId,
  onSelectHistoryProject,
  onDeleteHistoryProject,
  analysisResult,
  activeTab = "sld",
  libSearchTerm = "",
  setLibSearchTerm,
  libTypeFilter = "all",
  setLibTypeFilter,
  libPoleFilter = "all",
  setLibPoleFilter,
  panelViewMode = "sheet",
  setPanelViewMode,
  cadLayers = [],
  onToggleLayer,
  dwgStudioData,
}: SidebarProps) {
  const [panelMainTab, setPanelMainTab] = useState<"devices" | "layers" | "stats" | "export">("devices");
  const [panelFilterSearch, setPanelFilterSearch] = useState("");

  const activeDwgDevices = dwgStudioData?.devices || [];
  const activeDwgLayers = dwgStudioData?.layers || cadLayers || [];

  return (
    <aside
      className={`h-full bg-white flex flex-col flex-shrink-0 z-30 transition-all duration-300 select-none font-sans ${
        sidebarOpen
          ? "w-96 opacity-100 border-r border-slate-200"
          : "w-0 opacity-0 overflow-hidden pointer-events-none border-none border-0 p-0"
      }`}
    >
      {/* BRAND LOGO HEADER AT VERY TOP OF SIDEBAR */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="font-black text-sm text-slate-900 tracking-tight leading-none">
              AIDE <span className="text-xs font-bold text-blue-600">Pro</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase mt-0.5">
              AI Design Electric
            </p>
          </div>
        </div>

        {/* Toggle Collapse Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Thu gọn sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto custom-scrollbar">
        {/* ============================================================ */}
        {/* TAB SLD, HISTORY, BOQ: SIDEBAR UPLOAD & DỰ ÁN ĐÃ BÓC TÁCH     */}
        {/* ============================================================ */}
        {(activeTab === "sld" || activeTab === "history" || activeTab === "boq") && (
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {/* Quick Upload Box (Only on SLD tab) */}
            {activeTab === "sld" && (
              <div className="space-y-2 font-sans">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sơ Đồ Điện SLD
                  </span>
                  <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    JPG, PNG, WEBP, PDF
                  </span>
                </div>

                {/* 1. UPLOADING PROGRESS BAR STATE */}
                {uploading ? (
                  <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 space-y-2 shadow-xs">
                    <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                      <span className="flex items-center space-x-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>Đang tải sơ đồ lên server...</span>
                      </span>
                      <span className="font-mono text-blue-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  /* 2. ATTACHED FILE PREVIEW & DETAILS CARD */
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-xs">
                    {/* Thumbnail Preview (for Images) */}
                    {(filePreviewUrl || uploadedFile?.file_url || uploadedFile?.file_path) &&
                    !(uploadedFile?.file_name || "").toLowerCase().endsWith(".pdf") ? (
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative flex items-center justify-center group shadow-inner">
                        <img
                          src={filePreviewUrl || uploadedFile.file_url || uploadedFile.file_path}
                          alt="Bản vẽ xem trước"
                          className="w-full h-full object-contain p-1"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-1 rounded-lg">
                            Bản vẽ gốc đã tải
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* PDF Card Preview */
                      <div className="w-full p-3 bg-red-50/90 border border-red-200 rounded-xl flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-extrabold text-red-900 truncate">
                            {uploadedFile?.file_name || "Tài liệu SĐNL.pdf"}
                          </div>
                          <span className="text-[9.5px] text-red-600 font-semibold">Tài liệu sơ đồ điện PDF</span>
                        </div>
                      </div>
                    )}

                    {/* File info bar */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="truncate flex-1 pr-2">
                        <div className="font-extrabold text-slate-800 text-[11px] truncate">
                          {uploadedFile?.file_name || "Sơ đồ điện"}
                        </div>
                        <div className="text-[9.5px] text-slate-400 font-mono">
                          {uploadedFile?.file_size ? formatSize(uploadedFile.file_size) : "Sẵn sàng phân tích"}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUploadedFile(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Tải file khác"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Start AI Analysis Button */}
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      {analyzing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>{analyzing ? "ĐANG PHÂN TÍCH AI..." : "BẮT ĐẦU PHÂN TÍCH AI"}</span>
                    </button>
                  </div>
                ) : (
                  /* 3. BLANK DROP ZONE */
                  <div
                    onClick={handleClickUpload}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-3.5 text-center bg-white cursor-pointer transition-all ${
                      dragOver
                        ? "border-blue-500 bg-blue-50/80 scale-[0.99]"
                        : "border-slate-200/80 hover:border-blue-400 hover:bg-slate-50/50"
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 mx-auto text-blue-600 mb-1" />
                    <div className="text-[11px] font-bold text-slate-700">
                      Tải Sơ Đồ Điện (Image / PDF)
                    </div>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 font-medium">
                      Kéo thả file hoặc bấm dán (Ctrl+V)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.jpg,.jpeg,.png,.webp,.bmp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* LỊCH SỬ BÓC TÁCH */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lịch Sử Bóc Tách ({historyProjects.length})</span>
                </span>
                <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {loadingHistory ? "Đang tải..." : "Đã đồng bộ"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {historyProjects.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <FolderOpen className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <div>Chưa có dự án lưu trữ</div>
                    <p className="text-[10px] text-slate-400">
                      Các sơ đồ bóc tách thành công sẽ tự động xuất hiện ở đây.
                    </p>
                  </div>
                ) : (
                  historyProjects.map((proj: any) => {
                    const devCount = proj.versions?.[0]?.devices?.length ?? proj.device_count ?? 0;
                    const isSelected = selectedProjectId === proj.id;

                    return (
                      <div
                        key={proj.id}
                        onClick={() => onSelectHistoryProject(proj)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-2xs group flex flex-col justify-between border ${
                          isSelected
                            ? "bg-blue-600 border-2 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-[1.01]"
                            : "bg-white hover:bg-blue-50/70 border-slate-200/80 hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`font-extrabold text-xs truncate flex-1 pr-2 ${
                              isSelected ? "text-white" : "text-slate-800 group-hover:text-blue-600"
                            }`}
                          >
                            {proj.name || `Dự án #${proj.id}`}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHistoryProject(proj.id);
                            }}
                            className={`p-1 rounded transition-colors text-xs ${
                              isSelected
                                ? "text-blue-200 hover:text-white"
                                : "text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                            }`}
                            title="Xóa dự án khỏi lịch sử"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div
                          className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] ${
                            isSelected ? "border-blue-500/60" : "border-slate-100/80"
                          }`}
                        >
                          <span
                            className={`font-bold px-2 py-0.5 rounded border ${
                              isSelected
                                ? "bg-white/20 text-white border-white/30"
                                : "text-emerald-700 bg-emerald-50 border-emerald-200"
                            }`}
                          >
                            {devCount} Thiết Bị
                          </span>
                          <span
                            className={`font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}
                          >
                            {proj.created_at
                              ? new Date(proj.created_at).toLocaleDateString("vi-VN")
                              : "Hôm nay"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB LIBRARY SIDEBAR: SEARCH & FILTERS                        */}
        {/* ============================================================ */}
        {activeTab === "library" && (
          <div className="space-y-3 font-sans">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lọc Thư Viện Thiết Bị</span>
                </span>
                {(selectedBrand !== "LS" || libSearchTerm || libTypeFilter !== "all" || libPoleFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedBrand("LS");
                      if (setLibSearchTerm) setLibSearchTerm("");
                      if (setLibTypeFilter) setLibTypeFilter("all");
                      if (setLibPoleFilter) setLibPoleFilter("all");
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Xóa lọc</span>
                  </button>
                )}
              </div>

              {/* Brand Selection */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Thương hiệu hãng
                  </label>
                  <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    {selectedBrand}
                  </span>
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-900 text-xs font-bold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition-all"
                >
                  <option value="LS">LS Industrial Systems</option>
                  <option value="ABB">ABB Electric</option>
                  <option value="Schneider">Schneider Electric</option>
                  <option value="CHINT">CHINT Electric</option>
                  <option value="Mitsubishi">Mitsubishi Electric</option>
                  <option value="EMIC">EMIC Đo Lường</option>
                  <option value="Samwha">Samwha Tụ Bù</option>
                </select>
              </div>

              {/* Search Model Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tìm kiếm Mã SP / Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập mã SP (vd: ABN103c...)"
                    value={libSearchTerm}
                    onChange={(e) => setLibSearchTerm && setLibSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs py-2 pl-2.5 pr-8 rounded-xl focus:outline-none focus:border-blue-500 font-mono transition-all"
                  />
                  {libSearchTerm ? (
                    <button
                      onClick={() => setLibSearchTerm && setLibSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Loại thiết bị
                </label>
                <select
                  value={libTypeFilter}
                  onChange={(e) => setLibTypeFilter && setLibTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition-all"
                >
                  <option value="all">Tất cả loại thiết bị</option>
                  <option value="MCCB">Aptomat MCCB</option>
                  <option value="MCB">Aptomat nhánh MCB</option>
                  <option value="ACB">Máy cắt không khí ACB</option>
                  <option value="CONTACTOR">Khởi động từ Contactor</option>
                  <option value="RELAY">Rơ le nhiệt / Rơ le trung gian</option>
                  <option value="PLC">Bộ điều khiển PLC</option>
                  <option value="TERMINAL">Cầu đấu dây Terminal</option>
                </select>
              </div>

              {/* Pole Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Số cực (Pole)
                </label>
                <select
                  value={libPoleFilter}
                  onChange={(e) => setLibPoleFilter && setLibPoleFilter(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer transition-all"
                >
                  <option value="all">Tất cả số cực</option>
                  <option value="1">1 Pha (1P)</option>
                  <option value="2">2 Pha (2P)</option>
                  <option value="3">3 Pha (3P)</option>
                  <option value="4">4 Pha (4P)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: DWG CAD STUDIO EXPANDED SIDEBAR (ALL INFO INTEGRATED)  */}
        {/* ============================================================ */}
        {activeTab === "panel" && (
          <div className="space-y-3 flex-1 flex flex-col font-sans min-h-0">
            {/* FILE DWG/DXF SELECTION & ANALYZE TRIGGER SECTION */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Bản Vẽ CAD AutoCAD
                </span>
                <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                  DWG, DXF
                </span>
              </div>

              {/* File Info Box */}
              {dwgStudioData?.fileName ? (
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">
                        {dwgStudioData.fileName}
                      </span>
                    </div>
                    <span className="text-[9.5px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                      {(dwgStudioData.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* Explicit Analyze Trigger Button */}
                  {dwgStudioData.onStartParse && (
                    <button
                      onClick={() => dwgStudioData.onStartParse()}
                      disabled={dwgStudioData.loading}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all flex items-center justify-center space-x-2"
                    >
                      {dwgStudioData.loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>
                        {dwgStudioData.loading
                          ? "ĐANG PHÂN TÍCH..."
                          : "BẮT ĐẦU PHÂN TÍCH DWG"}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleClickUpload()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Chọn File DWG / DXF</span>
                  </button>
                </div>
              )}
            </div>

            {/* SIDEBAR MAIN DWG TABS */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 font-bold text-[11px] shrink-0">
              <button
                onClick={() => setPanelMainTab("devices")}
                className={`py-1.5 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  panelMainTab === "devices"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Thiết bị</span>
              </button>
              <button
                onClick={() => setPanelMainTab("layers")}
                className={`py-1.5 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  panelMainTab === "layers"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Layers</span>
              </button>
              <button
                onClick={() => setPanelMainTab("stats")}
                className={`py-1.5 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  panelMainTab === "stats"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Chỉ số</span>
              </button>
              <button
                onClick={() => setPanelMainTab("export")}
                className={`py-1.5 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  panelMainTab === "export"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Xuất</span>
              </button>
            </div>

            {/* SUB TAB CONTENT 1: THIẾT BỊ */}
            {panelMainTab === "devices" && (
              <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
                {/* Search & Sync Controls Bar */}
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between space-x-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Tìm linh kiện / mã SP..."
                        value={panelFilterSearch}
                        onChange={(e) => setPanelFilterSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs py-1.5 pl-7 pr-7 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      {panelFilterSearch && (
                        <button
                          onClick={() => setPanelFilterSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {dwgStudioData?.onSyncBoq && activeDwgDevices.length > 0 && (
                      <button
                        onClick={dwgStudioData.onSyncBoq}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10.5px] cursor-pointer shrink-0 transition-colors flex items-center space-x-1 shadow-xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Đồng bộ BOQ</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Component List Area */}
                <div className="flex-1 overflow-y-auto space-y-2 w-full custom-scrollbar pr-1">
                  {(() => {
                    const filteredList = activeDwgDevices.filter((item: any) => {
                      if (!panelFilterSearch) return true;
                      const q = panelFilterSearch.toLowerCase();
                      return (
                        (item.circuit || "").toLowerCase().includes(q) ||
                        (item.model || "").toLowerCase().includes(q) ||
                        (item.type || "").toLowerCase().includes(q) ||
                        (item.brand || "").toLowerCase().includes(q)
                      );
                    });

                    if (filteredList.length === 0) {
                      return (
                        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                          <Search className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                          <div>Chưa có thiết bị bóc tách</div>
                          <p className="text-[10px] text-slate-400">
                            Nạp bản vẽ DWG và bấm Bắt Đầu Phân Tích để trích xuất thiết bị.
                          </p>
                        </div>
                      );
                    }

                    return filteredList.map((dev: any, idx: number) => (
                      <div
                        key={dev.id || idx}
                        className="p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-400 rounded-xl flex justify-between items-center text-xs transition-all shadow-2xs group"
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="font-bold text-slate-800 text-[11px] truncate group-hover:text-blue-600">
                            {dev.circuit || dev.name || `Thiết bị #${idx + 1}`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5 flex items-center space-x-1">
                            <span className="px-1 py-0.2 bg-slate-100 text-slate-700 rounded font-bold text-[8.5px] border border-slate-200 shrink-0">
                              {dev.type || "EQP"}
                            </span>
                            <span className="truncate">{dev.model || dev.brand || ""}</span>
                          </div>
                        </div>
                        {dev.current ? (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] shrink-0">
                            {dev.current}A
                          </span>
                        ) : null}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* SUB TAB CONTENT 2: LAYERS MANAGEMENT */}
            {panelMainTab === "layers" && (
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Quản Lý Lớp Layer CAD ({activeDwgLayers.length})
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {activeDwgLayers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl">
                      Chưa có thông tin layer. Hãy chọn file DWG/DXF.
                    </div>
                  ) : (
                    activeDwgLayers.map((lyr: any, idx: number) => {
                      const layerName = lyr.name || `Layer_${idx}`;
                      const isVisible = lyr.visible !== false;
                      return (
                        <div
                          key={lyr.id || layerName}
                          onClick={() => {
                            if (dwgStudioData?.onToggleLayer) dwgStudioData.onToggleLayer(layerName);
                            else if (onToggleLayer) onToggleLayer(layerName);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-[11px] cursor-pointer transition-all border ${
                            isVisible
                              ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300"
                              : "bg-slate-100/50 border-slate-100 text-slate-400 line-through"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                              style={{
                                backgroundColor:
                                  typeof lyr.color === "number"
                                    ? `hsl(${(lyr.color * 30) % 360}, 70%, 50%)`
                                    : lyr.color || "#3b82f6",
                              }}
                            ></span>
                            <span className="truncate font-semibold">{layerName}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {lyr.entityCount !== undefined && (
                              <span className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-500">
                                {lyr.entityCount}
                              </span>
                            )}
                            {isVisible ? (
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SUB TAB CONTENT 3: STATS & AI ENGINEERING SPECS */}
            {panelMainTab === "stats" && (
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
                {/* CAD File Metadata */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="font-extrabold text-slate-800 border-b border-slate-100 pb-1 flex justify-between items-center">
                    <span>Thông Số File CAD</span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">
                      {dwgStudioData?.versionInfo?.hdr || "DWG"}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phiên bản AutoCAD:</span>
                      <span className="font-bold">{dwgStudioData?.versionInfo?.version || "Standard DWG"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng thực thể:</span>
                      <span className="font-mono font-bold text-blue-600">
                        {dwgStudioData?.entityStats?.reduce((s, e) => s + e.count, 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số khối Block:</span>
                      <span className="font-mono font-bold">{dwgStudioData?.blocks?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* AI Engineering Analysis Summary */}
                {dwgStudioData?.aiAnalysis ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 space-y-2">
                    <div className="font-extrabold text-blue-800 flex items-center space-x-1.5 border-b border-blue-100 pb-1">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Kết Quả Phân Tích Kỹ Thuật AI</span>
                    </div>

                    {/* Busbar spec */}
                    {dwgStudioData.aiAnalysis.busbarSpec && (
                      <div className="bg-white p-2 rounded-lg border border-blue-100 text-[11px] space-y-1">
                        <div className="font-bold text-amber-700 flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-amber-500 fill-current" />
                          <span>Tính Toán Thanh Cái (Busbar):</span>
                        </div>
                        <div className="text-slate-600 font-mono font-semibold">
                          Quy cách: {dwgStudioData.aiAnalysis.busbarSpec.recommendedSize}
                        </div>
                      </div>
                    )}

                    {/* Thermal check */}
                    {dwgStudioData.aiAnalysis.thermalAnalysis && (
                      <div className="bg-white p-2 rounded-lg border border-blue-100 text-[11px] space-y-1">
                        <div className="font-bold text-rose-700 flex items-center space-x-1">
                          <Thermometer className="w-3 h-3 text-rose-500" />
                          <span>Tính Tỏa Nhiệt Tủ:</span>
                        </div>
                        <div className="text-slate-600">
                          Công suất tỏa nhiệt: <b>{dwgStudioData.aiAnalysis.thermalAnalysis.totalPowerLossWatts}W</b> ({dwgStudioData.aiAnalysis.thermalAnalysis.recommendation})
                        </div>
                      </div>
                    )}

                    {/* Protection selectivty */}
                    {dwgStudioData.aiAnalysis.protectionCoordination && (
                      <div className="bg-white p-2 rounded-lg border border-blue-100 text-[11px] space-y-1">
                        <div className="font-bold text-emerald-700 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Phối hợp bảo vệ (Selectivity):</span>
                        </div>
                        <div className="text-slate-600">
                          {dwgStudioData.aiAnalysis.protectionCoordination.summary}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                    Chạy phân tích DWG để hiển thị tính toán kỹ thuật AI.
                  </div>
                )}
              </div>
            )}

            {/* SUB TAB CONTENT 4: EXPORT OPTIONS */}
            {panelMainTab === "export" && (
              <div className="space-y-3 flex-1 font-sans">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <h3 className="font-extrabold text-xs text-slate-800 flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Xuất File Sơ Đồ & Dữ Liệu</span>
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={dwgStudioData?.onDownloadSvg}
                      disabled={!dwgStudioData?.svgContent}
                      className="w-full py-2.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl font-bold text-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-40"
                    >
                      <span className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Xuất File Bản Vẽ Vector (.SVG)</span>
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-violet-200 font-mono">
                        Vector
                      </span>
                    </button>

                    <button
                      onClick={dwgStudioData?.onDownloadDxf}
                      disabled={!dwgStudioData?.rawArrayBuffer}
                      className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-bold text-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-40"
                    >
                      <span className="flex items-center space-x-2">
                        <FileOutput className="w-4 h-4" />
                        <span>Chuyển Đổi & Xuất File (.DXF)</span>
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200 font-mono">
                        AutoCAD
                      </span>
                    </button>

                    <button
                      onClick={dwgStudioData?.onSyncBoq}
                      disabled={!activeDwgDevices.length}
                      className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-40"
                    >
                      <span className="flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Xuất Bảng Báo Giá (BOQ Excel)</span>
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {activeDwgDevices.length} Thiết bị
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
