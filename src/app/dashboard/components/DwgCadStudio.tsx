"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileCode2,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
  Info,
  BarChart3,
  Image as ImageIcon,
  FileOutput,
  Box,
  ChevronRight,
  Search,
  FileText,
  X,
  Play,
} from "lucide-react";

import type {
  DwgCadLayer,
  ExtractedCadEntity,
  DwgEntityStat,
  DwgBlockInfo,
  DwgTableItem,
  DwgVersionInfo,
  DwgConversionStats,
  DwgThumbnailResult,
  DwgParseResult,
  DwgAiAnalysisResult,
} from "../../../lib/cad/DwgEngine";

export interface DwgStudioStateData {
  fileName: string;
  fileSize: number;
  loading: boolean;
  statusMessage: string;
  statusType: "idle" | "loading" | "success" | "error";
  svgContent: string;
  layers: DwgCadLayer[];
  devices: ExtractedCadEntity[];
  entityStats: DwgEntityStat[];
  blocks: DwgBlockInfo[];
  versionInfo: DwgVersionInfo | null;
  aiAnalysis: DwgAiAnalysisResult | null;
  rawArrayBuffer: ArrayBuffer | null;
  pendingFile: File | null;
  onStartParse: () => void;
  onSelectFile: (file: File) => void;
  onLoadSample: () => void;
  onDownloadSvg: () => void;
  onDownloadDxf: () => void;
  onToggleLayer: (layerName: string) => void;
  onSyncBoq: () => void;
}

interface DwgCadStudioProps {
  onSyncDevicesToBoq?: (devices: any[]) => void;
  onLayersChange?: (layers: DwgCadLayer[]) => void;
  onStudioStateChange?: (data: DwgStudioStateData) => void;
  externalTriggerParse?: boolean;
}

export default function DwgCadStudio({
  onSyncDevicesToBoq,
  onLayersChange,
  onStudioStateChange,
  externalTriggerParse,
}: DwgCadStudioProps) {
  const [loading, setLoading] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("Chưa tải file. Chọn file DWG/DXF và nhấn Bắt Đầu Phân Tích.");
  const [statusType, setStatusType] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Parse results
  const [svgContent, setSvgContent] = useState("");
  const [layers, setLayers] = useState<DwgCadLayer[]>([]);
  const [devices, setDevices] = useState<ExtractedCadEntity[]>([]);
  const [entityStats, setEntityStats] = useState<DwgEntityStat[]>([]);
  const [blocks, setBlocks] = useState<DwgBlockInfo[]>([]);
  const [styles, setStyles] = useState<DwgTableItem[]>([]);
  const [dimStyles, setDimStyles] = useState<DwgTableItem[]>([]);
  const [viewports, setViewports] = useState<DwgTableItem[]>([]);
  const [layouts, setLayouts] = useState<DwgTableItem[]>([]);
  const [versionInfo, setVersionInfo] = useState<DwgVersionInfo | null>(null);
  const [conversionStats, setConversionStats] = useState<DwgConversionStats | null>(null);
  const [thumbnail, setThumbnail] = useState<DwgThumbnailResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<DwgAiAnalysisResult | null>(null);
  const [databaseJson, setDatabaseJson] = useState<any>(null);
  const [rawArrayBuffer, setRawArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [dwgRawPtr, setDwgRawPtr] = useState<any>(null);

  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thumbnail?.blobUrl) URL.revokeObjectURL(thumbnail.blobUrl);
    };
  }, [thumbnail]);

  // Execute DWG Parse when user clicks Analyze button
  const executeDwgParse = useCallback(
    async (fileToParse?: File) => {
      const file = fileToParse || pendingFile;
      if (!file) return;

      setLoading(true);
      setStatusType("loading");
      setStatusMessage(`Đang phân tích LibreDWG WASM: ${file.name}...`);

      // Reset
      setSvgContent("");
      setLayers([]);
      setDevices([]);
      setEntityStats([]);
      setBlocks([]);
      setStyles([]);
      setDimStyles([]);
      setViewports([]);
      setLayouts([]);
      setVersionInfo(null);
      setConversionStats(null);
      if (thumbnail?.blobUrl) URL.revokeObjectURL(thumbnail.blobUrl);
      setThumbnail(null);

      try {
        const buffer = await file.arrayBuffer();
        setRawArrayBuffer(buffer);

        const isDxf = file.name.toLowerCase().endsWith(".dxf");
        const { dwgEngine } = await import("../../../lib/cad/DwgEngine");
        const { Dwg_File_Type } = await import("../../../lib/cad/libredwg/libredwg");

        const fileType = isDxf ? Dwg_File_Type.DXF : Dwg_File_Type.DWG;
        const result: DwgParseResult = await dwgEngine.parseFullDwg(buffer, fileType);

        setSvgContent(result.svgContent || "");
        setLayers(result.layers);
        onLayersChangeRef.current?.(result.layers);
        setDevices(result.devices);
        setEntityStats(result.entityStats);
        setBlocks(result.blocks);
        setStyles(result.styles);
        setDimStyles(result.dimStyles);
        setViewports(result.viewports);
        setLayouts(result.layouts);
        setVersionInfo(result.versionInfo);
        setConversionStats(result.stats);
        setThumbnail(result.thumbnail);
        setAiAnalysis(result.aiAnalysis);
        setDatabaseJson(result.databaseJson);
        setDwgRawPtr(result.dwgRawPtr);
        setWasmReady(true);

        const totalEntities = result.entityStats.reduce((s, e) => s + e.count, 0);
        setStatusType("success");
        setStatusMessage(
          `Đã phân tích thành công ${file.name} — ${result.versionInfo.version} (${totalEntities} thực thể, ${result.layers.length} lớp layer, ${result.devices.length} thiết bị)`
        );
      } catch (err: any) {
        console.error("[DwgCadStudio] Parse error:", err);
        setStatusType("error");
        setStatusMessage(`Lỗi xử lý file: ${err?.message || err}`);
      } finally {
        setLoading(false);
      }
    },
    [pendingFile, thumbnail, onLayersChange]
  );

  // File selected handler (does NOT auto-parse; awaits user click)
  const handleFileSelect = useCallback((file: File) => {
    setPendingFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setStatusType("idle");
    setStatusMessage(`Đã nạp file: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Bấm "Bắt Đầu Phân Tích DWG" để bóc tách.`);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Export SVG download
  const handleDownloadSvg = useCallback(() => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.\w+$/, ".svg") || "drawing.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent, fileName]);

  // Export DXF download
  const handleDownloadDxf = useCallback(async () => {
    if (!rawArrayBuffer) return;
    setStatusType("loading");
    setStatusMessage("Đang chuyển đổi sang DXF...");
    try {
      const { dwgEngine } = await import("../../../lib/cad/DwgEngine");
      const result = await dwgEngine.exportToDxf(rawArrayBuffer);
      if (!result) {
        setStatusType("error");
        setStatusMessage("Chuyển đổi DXF thất bại.");
        return;
      }
      const blob = new Blob([new Uint8Array(result.data)], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.replace(/\.\w+$/, ".dxf") || "drawing.dxf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusType("success");
      setStatusMessage(`Đã xuất ${a.download} thành công!`);
    } catch (err: any) {
      setStatusType("error");
      setStatusMessage(`Lỗi xuất DXF: ${err?.message || err}`);
    }
  }, [rawArrayBuffer, fileName]);

  // Toggle layer
  const toggleLayer = useCallback((layerName: string) => {
    setLayers((prev) => {
      const updated = prev.map((l) => (l.name === layerName ? { ...l, visible: !l.visible } : l));
      if (svgContent) {
        const hiddenLayers = updated.filter((l) => !l.visible).map((l) => l.name);
        let modifiedSvg = svgContent.replace(/<style id="layer-visibility">[\s\S]*?<\/style>/g, "");

        if (hiddenLayers.length > 0) {
          const cssRules = hiddenLayers
            .map((ln) => `g[data-layer="${ln}"], [class*="layer-${ln.replace(/\s/g, "_")}"] { display: none !important; }`)
            .join("\n");
          const styleTag = `<style id="layer-visibility">\n${cssRules}\n</style>`;
          modifiedSvg = modifiedSvg.replace(/<svg([^>]*)>/, `<svg$1>${styleTag}`);
        }
        setSvgContent(modifiedSvg);
      }
      return updated;
    });
  }, [svgContent]);

  // Sync devices to BOQ
  const handleSyncToBoq = useCallback(() => {
    if (onSyncDevicesToBoq && devices.length > 0) {
      onSyncDevicesToBoq(devices);
    }
  }, [onSyncDevicesToBoq, devices]);

  // Load sample demo drawing & auto parse
  const handleLoadSampleDwg = useCallback(() => {
    setLoading(true);
    setStatusType("loading");
    setStatusMessage("Đang tạo bản vẽ mẫu SĐNL Tủ Trạm 630A...");

    setTimeout(() => {
      const mockSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="100%" height="100%" style="background-color: #f8fafc;">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
            </pattern>
            <linearGradient id="busbarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ca8a04"/>
              <stop offset="50%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#ca8a04"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="1600" fill="url(#grid)" />
          <g id="layer_CABINET">
            <rect x="100" y="100" width="1000" height="1400" fill="none" stroke="#3b82f6" stroke-width="4" rx="8" />
            <line x1="100" y1="500" x2="1100" y2="500" stroke="#3b82f6" stroke-width="3" />
            <line x1="100" y1="1100" x2="1100" y2="1100" stroke="#3b82f6" stroke-width="3" />
          </g>
          <g id="layer_BUSBAR">
            <rect x="180" y="160" width="840" height="24" fill="url(#busbarGrad)" stroke="#eab308" stroke-width="1" />
            <rect x="180" y="200" width="840" height="24" fill="url(#busbarGrad)" stroke="#eab308" stroke-width="1" />
            <rect x="180" y="240" width="840" height="24" fill="url(#busbarGrad)" stroke="#eab308" stroke-width="1" />
            <text x="190" y="177" fill="#000" font-family="monospace" font-size="14" font-weight="bold">BUSBAR L1 - 630A (Cu 50x10)</text>
            <text x="190" y="217" fill="#000" font-family="monospace" font-size="14" font-weight="bold">BUSBAR L2 - 630A (Cu 50x10)</text>
            <text x="190" y="257" fill="#000" font-family="monospace" font-size="14" font-weight="bold">BUSBAR L3 - 630A (Cu 50x10)</text>
          </g>
          <g id="layer_ACB">
            <rect x="350" y="550" width="500" height="320" fill="#fff" stroke="#ef4444" stroke-width="3" rx="6" />
            <text x="600" y="705" fill="#1e293b" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">ACB 630A (SCHNEIDER MTZ1)</text>
          </g>
          <g id="layer_MCCB">
            <rect x="200" y="1160" width="220" height="240" fill="#f0fdf4" stroke="#10b981" stroke-width="2" rx="4" />
            <text x="310" y="1270" fill="#065f46" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">MCCB 250A</text>
            <rect x="490" y="1160" width="220" height="240" fill="#f0fdf4" stroke="#10b981" stroke-width="2" rx="4" />
            <text x="600" y="1270" fill="#065f46" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">MCCB 160A</text>
            <rect x="780" y="1160" width="220" height="240" fill="#f0fdf4" stroke="#10b981" stroke-width="2" rx="4" />
            <text x="890" y="1270" fill="#065f46" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">MCCB 100A</text>
          </g>
        </svg>
      `;

      setSvgContent(mockSvg);
      setFileName("Sample_Substation_630A.dwg");
      setFileSize(582572);
      const mockLayers: DwgCadLayer[] = [
        { name: "0", color: "#888888", visible: true, frozen: false, locked: false, entityCount: 12 },
        { name: "CABINET_FRAME", color: "#3B82F6", visible: true, frozen: false, locked: false, entityCount: 8 },
        { name: "BUSBAR_630A", color: "#EAB308", visible: true, frozen: false, locked: false, entityCount: 16 },
        { name: "EQUIPMENT_ACB", color: "#EF4444", visible: true, frozen: false, locked: false, entityCount: 6 },
        { name: "EQUIPMENT_MCCB", color: "#10B981", visible: true, frozen: false, locked: false, entityCount: 18 },
      ];
      setLayers(mockLayers);
      onLayersChangeRef.current?.(mockLayers);

      const sampleDevs: ExtractedCadEntity[] = [
        { id: "sample_1", circuit: "CB TỔNG INCOMER", type: "ACB", brand: "SCHNEIDER", model: "MTZ1 630A", pole: 3, current: 630, icu: 50, layer: "EQUIPMENT_ACB" },
        { id: "sample_2", circuit: "MẠCH NHÁNH NẠP 1", type: "MCCB", brand: "LS", model: "ABN203c 250A", pole: 3, current: 250, icu: 30, layer: "EQUIPMENT_MCCB" },
        { id: "sample_3", circuit: "MẠCH NHÁNH NẠP 2", type: "MCCB", brand: "LS", model: "ABN103c 160A", pole: 3, current: 160, icu: 18, layer: "EQUIPMENT_MCCB" },
        { id: "sample_4", circuit: "MẠCH NHÁNH NẠP 3", type: "MCCB", brand: "LS", model: "ABN103c 100A", pole: 3, current: 100, icu: 18, layer: "EQUIPMENT_MCCB" },
        { id: "sample_5", circuit: "THANH CÁI CHÍNH", type: "BUSBAR", brand: "COPPER", model: "Cu 50x10mm 630A", pole: 3, current: 630, layer: "BUSBAR_630A" },
      ];
      setDevices(sampleDevs);
      setEntityStats([
        { typeName: "INSERT", typeCode: 7, count: 12 },
        { typeName: "TEXT", typeCode: 1, count: 24 },
        { typeName: "LWPOLYLINE", typeCode: 77, count: 32 },
        { typeName: "LINE", typeCode: 19, count: 48 },
      ]);
      setBlocks([
        { name: "ACB_SCHNEIDER_630A", entityCount: 1 },
        { name: "MCCB_LS_250A", entityCount: 3 },
      ]);
      setVersionInfo({ hdr: "AC1032", version: "AC1032 (AutoCAD 2018)", codepage: 30, codepageName: "ANSI_1252" });
      setAiAnalysis({
        totalIncomerCurrent: 630,
        totalDeviceCount: 4,
        matchedCatalogCount: 4,
        confidenceScore: 0.95,
        busbarSpec: { recommendedSize: "Cu 50x10mm (630A)", crossSectionMm2: 500, estimatedWeightKg: 12.5, material: "COPPER" },
        thermalAnalysis: { totalPowerLossWatts: 145, tempRiseCelsius: 18.5, status: "OPTIMAL", recommendation: "Nhiệt độ tỏa ra nằm trong giới hạn an toàn." },
        protectionCoordination: { status: "SELECTIVE", mainDevice: "ACB 630A", feedersCount: 3, summary: "Phối hợp bảo vệ đạt yêu cầu." },
        recommendedDoorAccessories: [
          { name: "Đồng hồ Volt 0-500V", type: "METER", quantity: 1, model: "EMIC 72x72" },
          { name: "Đèn báo pha LED 220V", type: "LAMP", quantity: 3, model: "LS LAMP 220V" },
        ],
      });
      setStatusType("success");
      setStatusMessage("Đã nạp thành công bản vẽ mẫu SĐNL Tủ Trạm 630A!");
      setLoading(false);
    }, 600);
  }, [onLayersChange]);

  const onLayersChangeRef = useRef(onLayersChange);
  useEffect(() => {
    onLayersChangeRef.current = onLayersChange;
  }, [onLayersChange]);

  const onStudioStateChangeRef = useRef(onStudioStateChange);
  useEffect(() => {
    onStudioStateChangeRef.current = onStudioStateChange;
  }, [onStudioStateChange]);

  // Stable refs for actions
  const funcsRef = useRef({
    executeDwgParse,
    handleFileSelect,
    handleLoadSampleDwg,
    handleDownloadSvg,
    handleDownloadDxf,
    toggleLayer,
    handleSyncToBoq,
  });
  funcsRef.current = {
    executeDwgParse,
    handleFileSelect,
    handleLoadSampleDwg,
    handleDownloadSvg,
    handleDownloadDxf,
    toggleLayer,
    handleSyncToBoq,
  };

  // Sync state to parent ONLY when data state values change
  useEffect(() => {
    if (onStudioStateChangeRef.current) {
      onStudioStateChangeRef.current({
        fileName,
        fileSize,
        loading,
        statusMessage,
        statusType,
        svgContent,
        layers,
        devices,
        entityStats,
        blocks,
        versionInfo,
        aiAnalysis,
        rawArrayBuffer,
        pendingFile,
        onStartParse: (f?: File) => funcsRef.current.executeDwgParse(f),
        onSelectFile: (f: File) => funcsRef.current.handleFileSelect(f),
        onLoadSample: () => funcsRef.current.handleLoadSampleDwg(),
        onDownloadSvg: () => funcsRef.current.handleDownloadSvg(),
        onDownloadDxf: () => funcsRef.current.handleDownloadDxf(),
        onToggleLayer: (l: string) => funcsRef.current.toggleLayer(l),
        onSyncBoq: () => funcsRef.current.handleSyncToBoq(),
      });
    }
  }, [
    fileName,
    fileSize,
    loading,
    statusMessage,
    statusType,
    svgContent,
    layers,
    devices,
    entityStats,
    blocks,
    versionInfo,
    aiAnalysis,
    rawArrayBuffer,
    pendingFile,
  ]);

  // Zoom & Pan Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanPos({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.25), 4));
  };

  const totalEntities = entityStats.reduce((s, e) => s + e.count, 0);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* ============ TOP CANVAS TOOLBAR ============ */}
      <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs font-bold text-slate-800 truncate">
              {fileName || "DWG CAD Studio"}
            </h2>
            <p className="text-[10px] text-slate-400 truncate">
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept=".dwg,.dxf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Chọn File DWG/DXF</span>
          </button>

          {(pendingFile || fileName) && !svgContent && (
            <button
              onClick={() => executeDwgParse()}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{loading ? "Đang phân tích..." : "Bắt Đầu Phân Tích DWG"}</span>
            </button>
          )}

          <button
            onClick={handleLoadSampleDwg}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? "animate-spin" : ""}`} />
            <span>Nạp Bản Vẽ Mẫu</span>
          </button>

          {svgContent && (
            <button
              onClick={handleDownloadSvg}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          )}

          {rawArrayBuffer && (
            <button
              onClick={handleDownloadDxf}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <FileOutput className="w-3.5 h-3.5" />
              <span>DXF</span>
            </button>
          )}

          {devices.length > 0 && (
            <button
              onClick={handleSyncToBoq}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Đồng bộ BOQ ({devices.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ============ MAIN FULL-WIDTH CANVAS AREA ============ */}
      <div className="flex-1 relative bg-slate-50 flex flex-col overflow-hidden">
        {/* Zoom Controls */}
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 shadow-md">
          <button onClick={handleZoomIn} title="Phóng to" className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} title="Thu nhỏ" className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} title="Reset" className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer">
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-slate-500 font-mono px-2 py-0.5 bg-slate-100 rounded-lg">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Quick Stats Overlay on Canvas */}
        {svgContent && (
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200 shadow-md">
            <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> {layers.length} Lớp Layer
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-violet-600" /> {totalEntities} Thực Thể
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" /> {devices.length} Thiết Bị
              </span>
            </div>
          </div>
        )}

        {/* SVG Canvas Area */}
        <div
          ref={svgContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="flex-1 w-full h-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing select-none overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <RefreshCw className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-700 font-bold">LibreDWG WASM đang xử lý bản vẽ...</p>
                <p className="text-xs text-slate-400 mt-1">{statusMessage}</p>
              </div>
            </div>
          ) : svgContent ? (
            <div
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.15s ease-out",
                width: "100%",
                height: "100%",
              }}
              className="flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : pendingFile ? (
            /* Card state when file is selected but user hasn't clicked parse yet */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 max-w-md shadow-xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <FileCode2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  File Sẵn Sàng
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2 truncate">
                  {pendingFile.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Dung lượng: {(pendingFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Định dạng hỗ trợ: <b>AutoCAD DWG, DXF</b>. Nhấn nút bên dưới để tiến hành bóc tách thiết bị và trích xuất sơ đồ.
              </p>
              <button
                onClick={() => executeDwgParse()}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt Đầu Phân Tích DWG</span>
              </button>
            </div>
          ) : (
            /* Blank state */
            <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                <FileCode2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Chưa có bản vẽ</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Định dạng hỗ trợ: <b>.DWG</b> và <b>.DXF</b> (AutoCAD)
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Chọn File DWG / DXF</span>
                </button>
                <button
                  onClick={handleLoadSampleDwg}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span>Nạp Bản Vẽ Mẫu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
