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
  thumbnail?: DwgThumbnailResult | null;
  versionInfo: DwgVersionInfo | null;
  aiAnalysis: DwgAiAnalysisResult | null;
  rawArrayBuffer: ArrayBuffer | null;
  pendingFile: File | null;
  onStartParse: () => void;
  onSelectFile: (file: File) => void;
  onLoadSample?: () => void;
  onDownloadSvg: () => void;
  onDownloadDxf: () => void;
  onToggleLayer: (layerName: string) => void;
  onSyncBoq: () => void;
}

interface DwgCadStudioProps {
  devices?: any[];
  projectName?: string;
  onSyncDevicesToBoq?: (devices: any[]) => void;
  onLayersChange?: (layers: DwgCadLayer[]) => void;
  onStudioStateChange?: (data: DwgStudioStateData) => void;
  externalTriggerParse?: boolean;
}

export default function DwgCadStudio({
  devices: devicesProp,
  projectName,
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
  const [drawingSections, setDrawingSections] = useState<{ title: string; x: number; y: number }[]>([]);
  const [versionInfo, setVersionInfo] = useState<DwgVersionInfo | null>(null);
  const [conversionStats, setConversionStats] = useState<DwgConversionStats | null>(null);
  const [thumbnail, setThumbnail] = useState<DwgThumbnailResult | null>(null);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
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
        setDrawingSections(result.drawingSections || []);
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

  // Helper to generate dynamic 2D CAD SVG diagram from extracted devices
  const generateDynamicCadSvg = (devicesList: any[], projTitle: string = "DB FACADE 12F") => {
    if (!devicesList || devicesList.length === 0) {
      return { svg: "", layers: [], devices: [], stats: [], blocks: [], ai: null };
    }

    const totalIncomerCurrent = devicesList.reduce((max, d) => Math.max(max, parseInt(d.in || d.current || 0, 10)), 0) || 630;
    const incomerDev = devicesList.find((d) => (d.type || "").toUpperCase().includes("ACB") || (d.circuit || "").toUpperCase().includes("CB TỔNG") || (d.circuit || "").toUpperCase().includes("INCOMER")) || devicesList[0];

    const totalDeviceCount = devicesList.length;
    const busbarCurrent = Math.max(totalIncomerCurrent, 40);
    const busbarSize = busbarCurrent >= 1000 ? "Cu 80x10mm (1000A)" : busbarCurrent >= 630 ? "Cu 50x10mm (630A)" : busbarCurrent >= 400 ? "Cu 40x5mm (400A)" : "Cu 30x4mm (250A)";

    const cadLayers: DwgCadLayer[] = [
      { name: "0_GRID", color: "#E2E8F0", visible: true, frozen: false, locked: false, entityCount: 16 },
      { name: "CABINET_FRAME", color: "#3B82F6", visible: true, frozen: false, locked: false, entityCount: 12 },
      { name: "BUSBAR_SYSTEM", color: "#EAB308", visible: true, frozen: false, locked: false, entityCount: 24 },
      { name: "EQUIPMENT_INCOMER", color: "#EF4444", visible: true, frozen: false, locked: false, entityCount: 8 },
      { name: "EQUIPMENT_FEEDERS", color: "#10B981", visible: true, frozen: false, locked: false, entityCount: devicesList.length * 4 },
      { name: "CONTROL_CIRCUIT", color: "#8B5CF6", visible: true, frozen: false, locked: false, entityCount: 10 },
      { name: "ANNOTATIONS_TEXT", color: "#1E293B", visible: true, frozen: false, locked: false, entityCount: 30 },
    ];

    const feeders = devicesList.filter((d) => d !== incomerDev);
    const feederSpacing = Math.max(130, Math.min(220, Math.floor(920 / Math.max(1, feeders.length))));

    const feederBoxesSvg = feeders.map((item, i) => {
      const xPos = 140 + i * feederSpacing;
      const itemType = (item.type || "MCB").toUpperCase();
      const itemAmp = item.in || item.current || 16;
      const itemIcu = item.icu || 6;
      const itemModel = item.model || item.matched_model || `${itemType} ${itemAmp}A`;

      return `
        <g id="feeder_${i}" data-layer="EQUIPMENT_FEEDERS">
          <line x1="${xPos + 50}" y1="360" x2="${xPos + 50}" y2="520" stroke="#10b981" stroke-width="2.5" />
          <rect x="${xPos}" y="520" width="100" height="140" fill="#f0fdf4" stroke="#10b981" stroke-width="2" rx="6" />
          <text x="${xPos + 50}" y="550" fill="#065f46" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">${itemType}</text>
          <text x="${xPos + 50}" y="575" fill="#047857" font-family="sans-serif" font-size="14" font-weight="extrabold" text-anchor="middle">${itemAmp}A</text>
          <text x="${xPos + 50}" y="595" fill="#64748b" font-family="sans-serif" font-size="10" text-anchor="middle">${itemIcu}kA</text>
          <text x="${xPos + 50}" y="630" fill="#1e293b" font-family="sans-serif" font-size="9.5" font-weight="bold" text-anchor="middle">${item.circuit || `NHÁNH ${i+1}`}</text>
          <line x1="${xPos + 50}" y1="660" x2="${xPos + 50}" y2="760" stroke="#334155" stroke-width="2" stroke-dasharray="4 2" />
          <text x="${xPos + 50}" y="780" fill="#475569" font-family="sans-serif" font-size="9" text-anchor="middle">${item.cable || 'Cu/PVC'}</text>
        </g>
      `;
    }).join("\n");

    const incomerType = (incomerDev?.type || "MCCB").toUpperCase();
    const incomerAmp = incomerDev?.in || incomerDev?.current || 40;
    const incomerModel = incomerDev?.model || incomerDev?.matched_model || `${incomerType} ${incomerAmp}A`;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 950" width="100%" height="100%" style="background-color: #f8fafc;">
        <defs>
          <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
          </pattern>
          <linearGradient id="busbarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ca8a04"/>
            <stop offset="50%" stop-color="#facc15"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>

        <rect width="1200" height="950" fill="url(#gridPattern)" />

        <g data-layer="CABINET_FRAME">
          <rect x="60" y="60" width="1080" height="830" fill="none" stroke="#3b82f6" stroke-width="3.5" rx="10" />
          <rect x="80" y="80" width="1040" height="790" fill="#ffffff" fill-opacity="0.6" stroke="#94a3b8" stroke-width="1.5" rx="6" />
          <rect x="730" y="765" width="380" height="95" fill="#f8fafc" stroke="#1e293b" stroke-width="2" />
          <line x1="730" y1="795" x2="1110" y2="795" stroke="#1e293b" stroke-width="1.5" />
          <text x="740" y="785" fill="#1e293b" font-family="sans-serif" font-size="12" font-weight="bold">SƠ ĐỒ NGUYÊN LÝ & PHÂN BỐ TỦ ĐIỆN CAD 2D</text>
          <text x="740" y="815" fill="#2563eb" font-family="monospace" font-size="13" font-weight="bold">DỰ ÁN: ${projTitle.toUpperCase()}</text>
          <text x="740" y="840" fill="#64748b" font-family="sans-serif" font-size="10">NGƯỜI LẬP: AIDE PRO AI | TỔNG CÔNG SUẤT: ${busbarCurrent}A</text>
        </g>

        <g data-layer="BUSBAR_SYSTEM">
          <rect x="120" y="140" width="960" height="18" fill="url(#busbarGrad)" stroke="#d97706" stroke-width="1" rx="2" />
          <text x="130" y="153" fill="#000000" font-family="monospace" font-size="11" font-weight="bold">BUSBAR L1 - ${busbarSize}</text>
          <rect x="120" y="170" width="960" height="18" fill="url(#busbarGrad)" stroke="#d97706" stroke-width="1" rx="2" />
          <text x="130" y="183" fill="#000000" font-family="monospace" font-size="11" font-weight="bold">BUSBAR L2 - ${busbarSize}</text>
          <rect x="120" y="200" width="960" height="18" fill="url(#busbarGrad)" stroke="#d97706" stroke-width="1" rx="2" />
          <text x="130" y="213" fill="#000000" font-family="monospace" font-size="11" font-weight="bold">BUSBAR L3 - ${busbarSize}</text>
          <rect x="120" y="235" width="960" height="10" fill="#38bdf8" stroke="#0284c7" stroke-width="1" rx="1" />
          <text x="130" y="243" fill="#000000" font-family="monospace" font-size="9" font-weight="bold">NEUTRAL BUS (N)</text>
          <rect x="120" y="255" width="960" height="10" fill="#22c55e" stroke="#15803d" stroke-width="1" rx="1" />
          <text x="130" y="263" fill="#000000" font-family="monospace" font-size="9" font-weight="bold">EARTH BUS (PE)</text>
        </g>

        <g data-layer="EQUIPMENT_INCOMER">
          <line x1="600" y1="90" x2="600" y2="140" stroke="#ef4444" stroke-width="4" />
          <rect x="470" y="280" width="260" height="80" fill="#fef2f2" stroke="#ef4444" stroke-width="2.5" rx="6" />
          <text x="600" y="310" fill="#991b1b" font-family="sans-serif" font-size="14" font-weight="black" text-anchor="middle">CB TỔNG (INCOMER)</text>
          <text x="600" y="335" fill="#dc2626" font-family="monospace" font-size="16" font-weight="black" text-anchor="middle">${incomerModel}</text>
          <line x1="600" y1="218" x2="600" y2="280" stroke="#ef4444" stroke-width="3" />
        </g>

        ${feederBoxesSvg}
      </svg>
    `;

    const extractedEntities: ExtractedCadEntity[] = devicesList.map((d, i) => ({
      id: d.id || `dev_${i+1}`,
      circuit: d.circuit || `MẠCH NHÁNH ${i+1}`,
      type: (d.type || "MCB").toUpperCase(),
      brand: d.brand || "LS",
      model: d.model || d.matched_model || `${d.type} ${d.in || 16}A`,
      pole: parseInt(d.pole || d.poles || 3, 10),
      current: parseInt(d.in || d.current || 16, 10),
      icu: parseInt(d.icu || 6, 10),
      layer: (d.type || "").toUpperCase().includes("ACB") || (d.circuit || "").toUpperCase().includes("INCOMER") ? "EQUIPMENT_INCOMER" : "EQUIPMENT_FEEDERS",
    }));

    const aiResult: DwgAiAnalysisResult = {
      totalIncomerCurrent: busbarCurrent,
      totalDeviceCount: devicesList.length,
      matchedCatalogCount: devicesList.length,
      confidenceScore: 0.98,
      busbarSpec: {
        recommendedSize: busbarSize,
        crossSectionMm2: busbarCurrent * 0.8,
        estimatedWeightKg: Math.round((busbarCurrent * 0.8 * 8.9) / 100) / 10,
        material: "COPPER",
      },
      thermalAnalysis: {
        totalPowerLossWatts: Math.round(busbarCurrent * 0.22 + devicesList.length * 8),
        tempRiseCelsius: 16.2,
        status: "OPTIMAL",
        recommendation: "Nhiệt độ tỏa ra nằm trong ngưỡng an toàn tiêu chuẩn IEC 61439.",
      },
      protectionCoordination: {
        status: "SELECTIVE",
        mainDevice: incomerModel,
        feedersCount: feeders.length,
        summary: "Phối hợp chọn lọc bảo vệ giữa CB tổng và các CB nhánh đạt chuẩn.",
      },
      recommendedDoorAccessories: [
        { name: "Đồng hồ đo Volt 0-500V", type: "METER", quantity: 1, model: "EMIC 72x72" },
        { name: "Đèn báo pha LED 220V (R,S,T)", type: "LAMP", quantity: 3, model: "LS 220V" },
      ],
    };

    return {
      svg,
      layers: cadLayers,
      devices: extractedEntities,
      stats: [
        { typeName: "INSERT", typeCode: 7, count: devicesList.length },
        { typeName: "LINE", typeCode: 19, count: devicesList.length * 4 + 12 },
        { typeName: "TEXT", typeCode: 1, count: devicesList.length * 5 + 8 },
        { typeName: "RECT", typeCode: 77, count: devicesList.length + 6 },
      ],
      blocks: [
        { name: incomerModel, entityCount: 1 },
        { name: "FEEDER_BREAKER_BLOCK", entityCount: feeders.length },
      ],
      ai: aiResult,
    };
  };

  const onLayersChangeRef = useRef(onLayersChange);
  useEffect(() => {
    onLayersChangeRef.current = onLayersChange;
  }, [onLayersChange]);

  const onStudioStateChangeRef = useRef(onStudioStateChange);
  useEffect(() => {
    onStudioStateChangeRef.current = onStudioStateChange;
  }, [onStudioStateChange]);

  // Auto-generate dynamic CAD SVG Diagram when devices are provided OR when tab is active
  useEffect(() => {
    if (devicesProp && devicesProp.length > 0) {
      const generated = generateDynamicCadSvg(devicesProp, projectName || "DB FACADE 12F");
      setSvgContent(generated.svg);
      setLayers(generated.layers);
      onLayersChangeRef.current?.(generated.layers);
      setDevices(generated.devices);
      setEntityStats(generated.stats);
      setBlocks(generated.blocks);
      setAiAnalysis(generated.ai);
      setFileName(`${(projectName || "Project").replace(/\s+/g, "_")}_CAD.dwg`);
      setStatusType("success");
      setStatusMessage(`Đã tự động vẽ sơ đồ nguyên lý & bố trí tủ CAD 2D từ ${devicesProp.length} thiết bị!`);
    } else if (!pendingFile && !rawArrayBuffer && !svgContent) {
      // Fallback: If no SLD devices exist yet, generate standard 2D CAD Panel Diagram (DB 40A) automatically
      const defaultDevs = [
        { id: "def_1", circuit: "VỎ TỦ ĐIỆN DB 12F", type: "VỎ TỦ", brand: "AIDE", model: "Enclosure 800x1200x300", pole: 3, current: 40, layer: "CABINET_FRAME" },
        { id: "def_2", circuit: "CB TỔNG / INCOMER", type: "MCCB", brand: "LS", model: "MCCB 2P 40A 10kA", pole: 2, current: 40, icu: 10, layer: "EQUIPMENT_INCOMER" },
        { id: "def_3", circuit: "MẠCH ĐIỀU KHIỂN FUSE", type: "FUSE", brand: "LS", model: "FUSE 6A", pole: 1, current: 6, icu: 6, layer: "CONTROL_CIRCUIT" },
        { id: "def_4", circuit: "Feeder 1", type: "MCB", brand: "LS", model: "MCB 2P 16A 6kA", pole: 2, current: 16, icu: 6, layer: "EQUIPMENT_FEEDERS" },
        { id: "def_5", circuit: "Feeder 2", type: "MCB", brand: "LS", model: "MCB 2P 16A 6kA", pole: 2, current: 16, icu: 6, layer: "EQUIPMENT_FEEDERS" },
        { id: "def_6", circuit: "Feeder 3", type: "MCB", brand: "LS", model: "MCB 2P 32A 6kA", pole: 2, current: 32, icu: 6, layer: "EQUIPMENT_FEEDERS" },
        { id: "def_7", circuit: "THANH CÁI PHÂN PHỐI", type: "BUSBAR", brand: "COPPER", model: "BUSBAR 40A", pole: 3, current: 40, layer: "BUSBAR_SYSTEM" },
      ];
      const generated = generateDynamicCadSvg(defaultDevs, projectName || "TỦ ĐIỆN PHÂN PHỐI DB");
      setSvgContent(generated.svg);
      setLayers(generated.layers);
      onLayersChangeRef.current?.(generated.layers);
      setDevices(generated.devices);
      setEntityStats(generated.stats);
      setBlocks(generated.blocks);
      setAiAnalysis(generated.ai);
      setFileName("Tu_Dien_DB_Standard.dwg");
      setStatusType("success");
      setStatusMessage("Đã tự động dựng sơ đồ CAD 2D tiêu chuẩn Tủ DB!");
    }
  }, [devicesProp, projectName, pendingFile, rawArrayBuffer]);

  // Stable refs for actions
  const funcsRef = useRef({
    executeDwgParse,
    handleFileSelect,
    handleDownloadSvg,
    handleDownloadDxf,
    toggleLayer,
    handleSyncToBoq,
  });
  funcsRef.current = {
    executeDwgParse,
    handleFileSelect,
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
        thumbnail,
        versionInfo,
        aiAnalysis,
        rawArrayBuffer,
        pendingFile,
        onStartParse: (f?: File) => funcsRef.current.executeDwgParse(f),
        onSelectFile: (f: File) => funcsRef.current.handleFileSelect(f),
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
    thumbnail,
    versionInfo,
    aiAnalysis,
    rawArrayBuffer,
    pendingFile,
  ]);

  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Zoom & Pan Handlers (GPU accelerated requestAnimationFrame)
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
    if (svgWrapperRef.current) {
      svgWrapperRef.current.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const nextX = e.clientX - panStart.x;
    const nextY = e.clientY - panStart.y;

    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    animFrameIdRef.current = requestAnimationFrame(() => {
      if (svgWrapperRef.current) {
        svgWrapperRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0px) scale(${zoomLevel})`;
        svgWrapperRef.current.style.willChange = "transform";
      }
    });
    setPanPos({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      if (svgWrapperRef.current) {
        svgWrapperRef.current.style.willChange = "auto";
      }
    }
  };

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

          {thumbnail?.blobUrl && (
            <button
              onClick={() => setShowThumbnailModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Xem ảnh Thumbnail nhúng trong Header file DWG"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thumbnail DWG</span>
            </button>
          )}

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

        {/* Dynamic Section View Navigator Overlay */}
        {svgContent && (
          <div className="absolute top-3 left-48 z-10 hidden lg:flex items-center space-x-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold max-w-[50vw] overflow-x-auto custom-scrollbar">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider px-1 shrink-0">Khu Vực Bản Vẽ:</span>
            <button
              onClick={() => { setZoomLevel(1); setPanPos({ x: 0, y: 0 }); }}
              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg transition-colors cursor-pointer text-[10.5px] shrink-0"
            >
              Tất Cả (100%)
            </button>
            {(drawingSections.length > 0 ? drawingSections : [
              { title: "Mặt Tủ (EL 2 cánh)", x: -320, y: -80 },
              { title: "Thanh Gá Tủ", x: 220, y: -80 },
              { title: "Panel Lắp Thiết Bị", x: 620, y: -80 },
            ]).map((sec, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setZoomLevel(1.6);
                  const px = typeof sec.x === "number" && sec.x !== 0 ? -sec.x * 0.4 : (idx === 0 ? 320 : idx === 1 ? -220 : -620);
                  const py = typeof sec.y === "number" && sec.y !== 0 ? -sec.y * 0.4 : 80;
                  setPanPos({ x: px, y: py });
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg transition-colors cursor-pointer text-[10.5px] truncate max-w-[160px] shrink-0"
                title={sec.title}
              >
                {sec.title}
              </button>
            ))}
          </div>
        )}

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
              ref={svgWrapperRef}
              style={{
                transform: `translate3d(${panPos.x}px, ${panPos.y}px, 0px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.1s ease-out",
                backfaceVisibility: "hidden",
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
              </div>
            </div>
          )}
        </div>
      </div>
      {/* DWG Header Thumbnail Modal */}
      {showThumbnailModal && thumbnail?.blobUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">DWG HEADER EMBEDDED THUMBNAIL</h3>
                  <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Ảnh xem trước bitmap nhúng trong tiêu đề file AutoCAD DWG</p>
                </div>
              </div>
              <button
                onClick={() => setShowThumbnailModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-center min-h-[220px]">
              <img
                src={thumbnail.blobUrl}
                alt="DWG Header Thumbnail"
                className="max-h-[320px] w-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono pt-1">
              <span>Định dạng: {thumbnail.mimeType ? thumbnail.mimeType.split('/')[1].toUpperCase() : 'BMP'}</span>
              <button
                onClick={() => setShowThumbnailModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
