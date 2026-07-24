import React, { useState } from "react";

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
  
  // Panel CAD Controls Props
  panelViewMode?: "sheet" | "cad" | "3d";
  setPanelViewMode?: (mode: "sheet" | "cad" | "3d") => void;
  cadLayers?: any[];
  onToggleLayer?: (layerId: string) => void;
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
  cadLayers = [
    { id: "cabinet", name: "0_CABINET_FRAME", color: "#00ffff", visible: true },
    { id: "busbar", name: "1_BUSBAR_RSTNP", color: "#ff00ff", visible: true },
    { id: "devices", name: "2_DEVICES_EQUIPMENT", color: "#00ff00", visible: true },
    { id: "cutout", name: "3_CNC_CUTOUTS", color: "#ef4444", visible: true },
    { id: "dimension", name: "4_DIMENSIONS_COT", color: "#ffff00", visible: true },
    { id: "text", name: "5_ANNOTATIONS_TEXT", color: "#ffffff", visible: true },
    { id: "titleblock", name: "6_TITLE_BLOCK_A3", color: "#e2e8f0", visible: true },
  ],
  onToggleLayer,
}: SidebarProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [panelFilterSearch, setPanelFilterSearch] = useState("");
  const [panelMainTab, setPanelMainTab] = useState<"devices" | "management">("devices");
  const [panelSubTab, setPanelSubTab] = useState<"devices" | "busbar" | "acc" | "door">("devices");

  // Mouse Drag-to-Scroll for Panel Sub-Tabs
  const subTabScrollRef = React.useRef<HTMLDivElement>(null);
  const [isSubTabDragging, setIsSubTabDragging] = useState(false);
  const [subTabStartX, setSubTabStartX] = useState(0);
  const [subTabScrollLeft, setSubTabScrollLeft] = useState(0);

  const handleSubTabMouseDown = (e: React.MouseEvent) => {
    if (!subTabScrollRef.current) return;
    setIsSubTabDragging(true);
    setSubTabStartX(e.pageX - subTabScrollRef.current.offsetLeft);
    setSubTabScrollLeft(subTabScrollRef.current.scrollLeft);
  };
  const handleSubTabMouseLeaveOrUp = () => setIsSubTabDragging(false);
  const handleSubTabMouseMove = (e: React.MouseEvent) => {
    if (!isSubTabDragging || !subTabScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - subTabScrollRef.current.offsetLeft;
    const walk = (x - subTabStartX) * 2;
    subTabScrollRef.current.scrollLeft = subTabScrollLeft - walk;
  };

  return (
    <aside
      className={`h-full w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-30 transition-all duration-300 select-none font-sans ${
        sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-none"
      }`}
    >
      {/* BRAND LOGO HEADER AT VERY TOP OF SIDEBAR */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-sm">
            ⚡
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
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Thu gọn sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto custom-scrollbar">
        {/* TAB SLD, HISTORY, BOQ: SIDEBAR UPLOAD & DỰ ÁN ĐÃ BÓC TÁCH */}
        {(activeTab === "sld" || activeTab === "history" || activeTab === "boq") && (
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            {/* Quick Upload Box (Only on SLD tab) */}
            {activeTab === "sld" && (
              <div className="space-y-2">
                <button
                  onClick={handleClickUpload}
                  disabled={uploading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
                >
                  <span>☝</span>
                  <span>{uploading ? "ĐANG TẢI VÀ BÓC TÁCH..." : "UPLOAD DIAGRAM (SLD)"}</span>
                </button>

                <div
                  onClick={handleClickUpload}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-3 text-center bg-white cursor-pointer transition-all ${
                    dragOver ? "border-blue-500 bg-blue-50/80 scale-[0.99]" : "border-slate-200/80 hover:border-blue-400 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="text-xl mb-1">🖼️</div>
                  <div className="text-[11px] font-bold text-slate-700">Tải sơ đồ điện (Image / PDF)</div>
                  <p className="text-[9.5px] text-slate-400 mt-0.5 font-medium">Kéo thả file hoặc bấm dán (Ctrl+V)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.jpg,.jpeg,.png,.webp,.bmp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* LỊCH SỬ BÓC TÁCH (HISTORY PROJECTS LIST IN SIDEBAR) */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <span>📜 Lịch sử bóc tách ({historyProjects.length})</span>
                </span>
                <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {loadingHistory ? "Đang tải..." : "Đã đồng bộ"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {historyProjects.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <div>📂 Chưa có dự án lưu trữ</div>
                    <p className="text-[10px] text-slate-400">Các sơ đồ bóc tách thành công sẽ tự động xuất hiện ở đây.</p>
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
                          <div className={`font-extrabold text-xs truncate flex-1 pr-2 ${
                            isSelected ? "text-white" : "text-slate-800 group-hover:text-blue-600"
                          }`}>
                            {proj.name || `Dự án #${proj.id}`}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHistoryProject(proj.id);
                            }}
                            className={`p-0.5 rounded transition-colors text-xs ${
                              isSelected ? "text-blue-200 hover:text-white" : "text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                            }`}
                            title="Xóa dự án khỏi lịch sử"
                          >
                            🗑️
                          </button>
                        </div>

                        <div className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] ${
                          isSelected ? "border-blue-500/60" : "border-slate-100/80"
                        }`}>
                          <span className={`font-bold px-2 py-0.5 rounded border ${
                            isSelected
                              ? "bg-white/20 text-white border-white/30"
                              : "text-emerald-700 bg-emerald-50 border-emerald-200"
                          }`}>
                            {devCount} thiết bị
                          </span>
                          <span className={`font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                            {proj.created_at ? new Date(proj.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
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

        {/* TAB LIBRARY SIDEBAR: SEARCH & FILTERS REDESIGNED */}
        {activeTab === "library" && (
          <div className="space-y-3 font-sans">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs space-y-3">
              {/* Filter Section Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="text-blue-600">🔍</span>
                  <span>LỌC THƯ VIỆN THIẾT BỊ</span>
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
                    <span>🔄</span>
                    <span>Xóa lọc</span>
                  </button>
                )}
              </div>

              {/* Brand Selection Dropdown */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thương hiệu hãng</label>
                  <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    {selectedBrand}
                  </span>
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-900 text-xs font-bold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer transition-all"
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tìm kiếm Mã SP / Tên</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nhập mã SP (vd: ABN103c...)"
                    value={libSearchTerm}
                    onChange={(e) => setLibSearchTerm && setLibSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs py-2 pl-2.5 pr-8 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                  />
                  {libSearchTerm ? (
                    <button
                      onClick={() => setLibSearchTerm && setLibSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  )}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại thiết bị</label>
                <select
                  value={libTypeFilter}
                  onChange={(e) => setLibTypeFilter && setLibTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer transition-all"
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Số cực (Pole)</label>
                <select
                  value={libPoleFilter}
                  onChange={(e) => setLibPoleFilter && setLibPoleFilter(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-xs font-semibold py-2 px-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer transition-all"
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

        {/* TAB 4: PANEL DESIGN MAIN SIDEBAR */}
        {activeTab === "panel" && (
          <div className="space-y-3 flex-1 flex flex-col font-sans min-h-0">
            {/* 2 MAIN TOP TABS: 🔌 Thiết bị & ⚙️ Quản lý */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 font-bold text-xs shrink-0">
              <button
                onClick={() => setPanelMainTab("devices")}
                className={`py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${
                  panelMainTab === "devices"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>🔌</span>
                <span>Thiết bị</span>
              </button>
              <button
                onClick={() => setPanelMainTab("management")}
                className={`py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${
                  panelMainTab === "management"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>⚙️</span>
                <span>Quản lý</span>
              </button>
            </div>

            {/* TAB 1: 🔌 THIẾT BỊ (DEVICES & COMPONENTS LIST) */}
            {panelMainTab === "devices" && (
              <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
                {/* Search & Import Controls Bar */}
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between space-x-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="🔍 Tìm linh kiện / mã SP..."
                        value={panelFilterSearch}
                        onChange={(e) => setPanelFilterSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs py-1.5 pl-2.5 pr-7 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
                      />
                      {panelFilterSearch && (
                        <button
                          onClick={() => setPanelFilterSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <label className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[10.5px] cursor-pointer shrink-0 transition-colors flex items-center space-x-1">
                      <span>📥</span>
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              try {
                                const parsed = JSON.parse(evt.target?.result as string);
                                if (Array.isArray(parsed)) {
                                  alert(`Đã nạp thành công ${parsed.length} thiết bị từ file!`);
                                }
                              } catch {
                                alert("Đã nhận file linh kiện!");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Sub-tab Category Buttons (SWIPER SMOOTH HORIZONTAL SCROLL & MOUSE DRAG-TO-SCROLL) */}
                <div
                  ref={subTabScrollRef}
                  onMouseDown={handleSubTabMouseDown}
                  onMouseLeave={handleSubTabMouseLeaveOrUp}
                  onMouseUp={handleSubTabMouseLeaveOrUp}
                  onMouseMove={handleSubTabMouseMove}
                  className="flex items-center space-x-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto whitespace-nowrap text-[11px] font-bold shrink-0 custom-scrollbar scrollbar-none py-1.5 select-none cursor-grab active:cursor-grabbing"
                >
                  <button
                    onClick={() => setPanelSubTab("devices")}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
                      panelSubTab === "devices"
                        ? "bg-white text-blue-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold"
                    }`}
                  >
                    <span>🔌</span>
                    <span>Thiết bị</span>
                  </button>
                  <button
                    onClick={() => setPanelSubTab("busbar")}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
                      panelSubTab === "busbar"
                        ? "bg-white text-amber-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold"
                    }`}
                  >
                    <span>⚡</span>
                    <span>Busbar</span>
                  </button>
                  <button
                    onClick={() => setPanelSubTab("acc")}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
                      panelSubTab === "acc"
                        ? "bg-white text-emerald-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold"
                    }`}
                  >
                    <span>🧩</span>
                    <span>Phụ kiện</span>
                  </button>
                  <button
                    onClick={() => setPanelSubTab("door")}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all shrink-0 flex items-center space-x-1 ${
                      panelSubTab === "door"
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold"
                    }`}
                  >
                    <span>🚪</span>
                    <span>Mặt cánh</span>
                  </button>
                </div>

                {/* Draggable Component List Area with REAL Category Filtering & Fallback Data */}
                <div className="flex-1 overflow-y-auto space-y-2 w-full custom-scrollbar pr-1">
                  {(() => {
                    const rawList = (() => {
                      if (panelSubTab === "busbar") {
                        const filtered = (analysisResult || []).filter((d: any) =>
                          ["BUSBAR", "COPPER", "BAR"].some((k) => (d.type || "").toUpperCase().includes(k))
                        );
                        return filtered.length > 0
                          ? filtered
                          : [
                              { id: "bb_r", circuit: "BUSBAR-R Phase", type: "BUSBAR", brand: "LS BUSBAR", model: "Cu 40x5mm R-Phase", current: 630 },
                              { id: "bb_s", circuit: "BUSBAR-S Phase", type: "BUSBAR", brand: "LS BUSBAR", model: "Cu 40x5mm S-Phase", current: 630 },
                              { id: "bb_t", circuit: "BUSBAR-T Phase", type: "BUSBAR", brand: "LS BUSBAR", model: "Cu 40x5mm T-Phase", current: 630 },
                              { id: "bb_n", circuit: "BUSBAR-N Neutral", type: "BUSBAR", brand: "LS BUSBAR", model: "Cu 30x4mm N-Phase", current: 400 },
                              { id: "bb_pe", circuit: "BUSBAR-PE Earth", type: "BUSBAR", brand: "LS BUSBAR", model: "Cu 25x3mm PE Ground", current: 250 },
                            ];
                      }
                      if (panelSubTab === "acc") {
                        const filtered = (analysisResult || []).filter((d: any) =>
                          ["DIN_RAIL", "DUCT", "TERMINAL", "FUSE", "INSULATOR", "ACC"].some((k) => (d.type || "").toUpperCase().includes(k))
                        );
                        return filtered.length > 0
                          ? filtered
                          : [
                              { id: "acc_din", circuit: "DIN RAIL 35MM", type: "ACC", brand: "LS ACC", model: "Thanh Ray Nhôm 35mm (L=2M)" },
                              { id: "acc_duct", circuit: "WIRING DUCT 40x60", type: "ACC", brand: "LS ACC", model: "Máng Luồn Dây Nhựa 40x60mm" },
                              { id: "acc_term", circuit: "TERMINAL BLOCK 2.5", type: "ACC", brand: "LS ACC", model: "Cầu Đấu Dây 2.5mm² 10P" },
                              { id: "acc_ins", circuit: "BUSBAR INSULATOR", type: "ACC", brand: "LS ACC", model: "Sứ Cách Điện Busbar Support" },
                            ];
                      }
                      if (panelSubTab === "door") {
                        const filtered = (analysisResult || []).filter((d: any) =>
                          ["VOLT", "AMP", "LAMP", "SWITCH", "METER", "DOOR"].some((k) => (d.type || "").toUpperCase().includes(k))
                        );
                        return filtered.length > 0
                          ? filtered
                          : [
                              { id: "door_vmeter", circuit: "VOLTMETER 0-500V", type: "METER", brand: "EMIC", model: "Đồng hồ Volt 72x72mm 0-500V" },
                              { id: "door_ameter", circuit: "AMMETER 0-100A", type: "METER", brand: "EMIC", model: "Đồng hồ Ampere 72x72mm 0-100A" },
                              { id: "door_lamp", circuit: "PILOT LAMP R-S-T", type: "LAMP", brand: "LS LAMP", model: "Đèn Báo Báo Pha LED 220V (Bộ 3 cái)" },
                              { id: "door_sw", circuit: "VOLT SELECTOR SW", type: "SWITCH", brand: "LS SW", model: "Công Tắc Xoay Voltmeter 7 Vị Trí" },
                            ];
                      }
                      return analysisResult && analysisResult.length > 0 ? analysisResult : [
                        { id: "dev_main", circuit: "MAIN CB 40A 3P", type: "MCCB", brand: "LS Electric", model: "ABN103c 3P 40A 10kA", current: 40 },
                        { id: "dev_mcb1", circuit: "MCB NHÁNH L1", type: "MCB", brand: "LS Electric", model: "BKN 1P 16A 6kA", current: 16 },
                        { id: "dev_mcb2", circuit: "MCB NHÁNH L2", type: "MCB", brand: "LS Electric", model: "BKN 1P 16A 6kA", current: 16 },
                      ];
                    })();

                    const filteredList = rawList.filter((item: any) => {
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
                        <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                          <div>🔍 Không tìm thấy linh kiện phù hợp</div>
                          <p className="text-[10px] text-slate-400">Thử nhập từ khóa khác hoặc bấm Import linh kiện.</p>
                        </div>
                      );
                    }

                    return filteredList.map((dev: any, idx: number) => (
                      <div
                        key={dev.id || idx}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/json", JSON.stringify(dev));
                        }}
                        className="p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-400 rounded-xl flex justify-between items-center text-xs cursor-grab active:cursor-grabbing transition-all shadow-2xs group"
                      >
                        <div className="truncate flex-1 pr-2">
                          <div className="font-bold text-slate-800 text-[11px] truncate group-hover:text-blue-600">
                            {dev.circuit || `Thiết bị #${idx + 1}`}
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

            {/* TAB 2: ⚙️ QUẢN LÝ (CAD VIEW MODES, LAYERS & CABINET HISTORY) */}
            {panelMainTab === "management" && (
              <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-1">
                {/* View Mode Selection Buttons */}
                <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-400 tracking-wider uppercase flex items-center space-x-1">
                      <span>⚡ CHẾ ĐỘ XEM CAD</span>
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-cyan-600 text-white rounded-full">
                      v2.0
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      onClick={() => setPanelViewMode && setPanelViewMode("sheet")}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer ${
                        panelViewMode === "sheet"
                          ? "bg-cyan-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      📄 A3 Sheet
                    </button>
                    <button
                      onClick={() => setPanelViewMode && setPanelViewMode("cad")}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer ${
                        panelViewMode === "cad"
                          ? "bg-cyan-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      📐 2D Canvas
                    </button>
                    <button
                      onClick={() => setPanelViewMode && setPanelViewMode("3d")}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black text-center transition-all cursor-pointer ${
                        panelViewMode === "3d"
                          ? "bg-emerald-600 text-white shadow"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      🧊 3D View
                    </button>
                  </div>
                </div>

                {/* AutoCAD Layers Toggle Section in Main Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white space-y-2">
                  <div className="text-[11px] font-black text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                    <span>📑 QUẢN LÝ LỚP LAYER</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {cadLayers.length} Layers
                    </span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {cadLayers.map((lyr) => (
                      <div
                        key={lyr.id}
                        onClick={() => onToggleLayer && onToggleLayer(lyr.id)}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-[10.5px] cursor-pointer transition-all border ${
                          lyr.visible
                            ? "bg-slate-950 border-cyan-900 text-slate-200 hover:border-cyan-500"
                            : "bg-slate-950/40 border-slate-900 text-slate-600 line-through"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: lyr.color }}
                          ></span>
                          <span className="truncate font-semibold">{lyr.name}</span>
                        </div>
                        <span className="text-xs">{lyr.visible ? "👁️" : "🙈"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUẢN LÝ CÁC TỦ LỊCH SỬ (CABINETS HISTORY MANAGEMENT) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-slate-800 space-y-2">
                  <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                    <span>📜 LỊCH SỬ TỦ ĐIỆN CAD ({historyProjects.length})</span>
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold">
                      History
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {historyProjects.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 italic">
                        Chưa có lịch sử tủ điện.
                      </div>
                    ) : (
                      historyProjects.map((proj: any) => {
                        const isSelected = selectedProjectId === proj.id;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => onSelectHistoryProject(proj)}
                            className={`p-2 rounded-xl text-xs border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                : "bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="truncate flex-1 pr-1.5">
                              <div className="truncate font-bold text-[11px]">
                                {proj.name || `Tủ #${proj.id}`}
                              </div>
                              <div className={`text-[9.5px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                {proj.created_at ? new Date(proj.created_at).toLocaleDateString("vi-VN") : "Gần đây"}
                              </div>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              Nạp
                            </span>
                          </div>
                        );
                      })
                    )}
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
