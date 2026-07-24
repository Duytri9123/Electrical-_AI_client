import React, { useState, useEffect, useRef } from "react";
import ThreeCabinetViewer from "./ThreeCabinetViewer";
import { SectionalLayerSheet } from "./cad/SectionalLayerSheet";
import { CubicleForm2BSheet } from "./cad/CubicleForm2BSheet";
import { Indoor2DoorSheet } from "./cad/Indoor2DoorSheet";
import { Standard5MPlates } from "./cad/Standard5MPlates";

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

interface Rail {
  id: string;
  y: number;
  devices: string[];
}

interface LayoutData {
  panel_width: number;
  panel_height: number;
  rails: Rail[];
}

interface PanelDesignProps {
  devices: Device[];
  layoutData: LayoutData | null;
  graphData: any;
}

interface CabinetParams {
  name: string;
  type: "khung" | "panel" | "ghep";
  width: number;
  height: number;
  depth: number;
  acc_lamp_rst: number;
  acc_meter_v: number;
  acc_meter_a: number;
  acc_meter_multi: number;
  acc_btn_onoff: number;
  acc_btn_emerg: number;
  acc_selector: number;
  
  // Custom specifications from right side panel
  baseHeight: number;
  doorGap: number;
  innerDoorDepth: number;
  cableHoleRadius: number;
  ventLouvers: boolean;
  topCableHole: boolean;
  bottomCableHole: boolean;
  project: string;
  isc: number;
  phase: string;
  cabinetStyle: string;
}

type LayerKey = "all" | "m1" | "m2" | "m3" | "m4" | "m5";
type RightTabKey = "props" | "iec" | "enclosure" | "materials";

function Solid3DCube({
  width,
  height,
  depth,
  frontContent,
  topContent,
  sideColor = "bg-slate-800 border border-slate-700 text-slate-200",
  className = "",
  style = {},
  onClick,
}: {
  width: number;
  height: number;
  depth: number;
  frontContent?: React.ReactNode;
  topContent?: React.ReactNode;
  sideColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer select-none ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* Front Face */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-1 rounded-xs z-10"
        style={{ transform: `translateZ(${halfD}px)`, backfaceVisibility: "hidden" }}
      >
        {frontContent}
      </div>

      {/* Back Face */}
      <div
        className={`absolute inset-0 ${sideColor}`}
        style={{ transform: `rotateY(180deg) translateZ(${halfD}px)` }}
      />

      {/* Left Face */}
      <div
        className={`absolute top-0 bottom-0 ${sideColor}`}
        style={{
          width: `${depth}px`,
          left: `${halfW - halfD}px`,
          transform: `rotateY(-90deg) translateZ(${halfW}px)`,
        }}
      />

      {/* Right Face */}
      <div
        className={`absolute top-0 bottom-0 ${sideColor}`}
        style={{
          width: `${depth}px`,
          left: `${halfW - halfD}px`,
          transform: `rotateY(90deg) translateZ(${halfW}px)`,
        }}
      />

      {/* Top Face */}
      <div
        className={`absolute left-0 right-0 ${sideColor} flex items-center justify-center`}
        style={{
          height: `${depth}px`,
          top: `${halfH - halfD}px`,
          transform: `rotateX(90deg) translateZ(${halfH}px)`,
        }}
      >
        {topContent}
      </div>

      {/* Bottom Face */}
      <div
        className={`absolute left-0 right-0 ${sideColor}`}
        style={{
          height: `${depth}px`,
          top: `${halfH - halfD}px`,
          transform: `rotateX(-90deg) translateZ(${halfH}px)`,
        }}
      />
    </div>
  );
}

export default function PanelDesign({ devices, layoutData, graphData }: PanelDesignProps) {
  const [hasDrawing, setHasDrawing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<"physical" | "schematic">("physical");
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>("all");
  const [cadFormat, setCadFormat] = useState<"SECTION_ALAYOUT" | "INDOOR_2DOOR_8VIEWS" | "FORM_2B_MSB" | "STANDARD_5M">("SECTION_ALAYOUT");
  const [zoom, setZoom] = useState(100);
  const [snap, setSnap] = useState(true);
  const [activeTool, setActiveTool] = useState<"select" | "pan" | "ruler">("select");
  
  // Coordinates Tracker relative to active hovered plate
  const [coords, setCoords] = useState({ plate: "", x: "--", y: "--" });

  // Panning & Dragging States
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Ruler States (in local coordinate space)
  const [rulerStart, setRulerStart] = useState<{ x: number; y: number } | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{ x: number; y: number } | null>(null);

  // Floating Side Panel tab & visibility state
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<RightTabKey>("props");
  // Selected device reference
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  
  // Toolbar dropdown & Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showAiLayoutMenu, setShowAiLayoutMenu] = useState(false);
  const [showAiAcbMenu, setShowAiAcbMenu] = useState(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Interactive 3D Preview Modal States
  const [show3dModal, setShow3dModal] = useState(false);
  const [rotX, setRotX] = useState(-15);
  const [rotY, setRotY] = useState(25);
  const [zoom3d, setZoom3d] = useState(1);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isInnerOpen, setIsInnerOpen] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [presetView, setPresetView] = useState<"front" | "iso" | "side" | "top">("iso");
  const [showFrame3d, setShowFrame3d] = useState(true);
  const [showBusbar3d, setShowBusbar3d] = useState(true);
  const [showDevices3d, setShowDevices3d] = useState(true);
  const [selected3dDevice, setSelected3dDevice] = useState<Device | null>(null);

  // Mouse drag-to-orbit for 3D modal canvas
  const isOrbitingRef = useRef(false);
  const orbitStartRef = useRef({ x: 0, y: 0 });
  const orbitRotStartRef = useRef({ x: -15, y: 25 });

  const handle3dMouseDown = (e: React.MouseEvent) => {
    isOrbitingRef.current = true;
    orbitStartRef.current = { x: e.clientX, y: e.clientY };
    orbitRotStartRef.current = { x: rotX, y: rotY };
  };

  const handle3dMouseMove = (e: React.MouseEvent) => {
    if (!isOrbitingRef.current) return;
    const deltaX = e.clientX - orbitStartRef.current.x;
    const deltaY = e.clientY - orbitStartRef.current.y;
    setRotY(orbitRotStartRef.current.y + deltaX * 0.5);
    setRotX(Math.max(-85, Math.min(85, orbitRotStartRef.current.x - deltaY * 0.5)));
  };

  const handle3dMouseUp = () => {
    isOrbitingRef.current = false;
  };

  // Right Panel Action Modals
  const [showExportDxfModal, setShowExportDxfModal] = useState(false);
  const [showSaveProjectModal, setShowSaveProjectModal] = useState(false);
  const [showOpenProjectModal, setShowOpenProjectModal] = useState(false);
  const [showIecCheckModal, setShowIecCheckModal] = useState(false);
  const [showBomModal, setShowBomModal] = useState(false);

  const handleDownloadDxf = () => {
    const dxfString = `0
SECTION
2
ENTITIES
0
INSERT
8
BREAKERS
...DXF layout header...
0
ENDSEC
0
EOF`;
    const blob = new Blob([dxfString], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cabinetParams.name}-layout.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDxfModal(false);
  };

  const handleSaveProject = () => {
    const projectJson = JSON.stringify({
      cabinetParams,
      devices,
      version: "1.0",
    });
    const blob = new Blob([projectJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cabinetParams.name}-project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowSaveProjectModal(false);
  };

  const handleOpenProject = () => {
    setShowOpenProjectModal(true);
  };

  const [cabinetParams, setCabinetParams] = useState<CabinetParams>({
    name: "TĐ-H",
    type: "khung",
    width: 800,
    height: 800,
    depth: 250,
    acc_lamp_rst: 1,
    acc_meter_v: 1,
    acc_meter_a: 3,
    acc_meter_multi: 0,
    acc_btn_onoff: 1,
    acc_btn_emerg: 1,
    acc_selector: 1,
    baseHeight: 100,
    doorGap: 15,
    innerDoorDepth: 100,
    cableHoleRadius: 13,
    ventLouvers: true,
    topCableHole: true,
    bottomCableHole: true,
    project: "Tủ điện tầng hầm TĐ-H",
    isc: 10,
    phase: "3P",
    cabinetStyle: "HORIZONTAL_DB",
  });

  // Enclosure Spec Inputs temporary states
  const [formWidth, setFormWidth] = useState(cabinetParams.width);
  const [formHeight, setFormHeight] = useState(cabinetParams.height);
  const [formDepth, setFormDepth] = useState(cabinetParams.depth);
  const [formBaseHeight, setFormBaseHeight] = useState(cabinetParams.baseHeight);
  const [formDoorGap, setFormDoorGap] = useState(cabinetParams.doorGap);
  const [formInnerDoorDepth, setFormInnerDoorDepth] = useState(cabinetParams.innerDoorDepth);
  const [formCableHoleRadius, setFormCableHoleRadius] = useState(cabinetParams.cableHoleRadius);
  const [formVentLouvers, setFormVentLouvers] = useState(cabinetParams.ventLouvers);
  const [formTopCableHole, setFormTopCableHole] = useState(cabinetParams.topCableHole);
  const [formBottomCableHole, setFormBottomCableHole] = useState(cabinetParams.bottomCableHole);
  const [formName, setFormName] = useState(cabinetParams.name);
  const [formProject, setFormProject] = useState(cabinetParams.project);
  const [formIsc, setFormIsc] = useState(cabinetParams.isc);
  const [formPhase, setFormPhase] = useState(cabinetParams.phase);
  const [formCabinetStyle, setFormCabinetStyle] = useState<string>(cabinetParams.cabinetStyle || "HORIZONTAL_DB");

  // Sync cabinet parameters automatically when layoutData or devices list changes
  useEffect(() => {
    if (!devices || devices.length === 0) return;

    // AI Auto-Detection of SLD Panel Architecture & Optimal Dimensions
    const is1P = devices.every((d) => (d.pole || 1) <= 2) || devices.some((d) => d.circuit?.toUpperCase().includes("FACADE") || d.circuit?.toUpperCase().includes("LIGHT") || d.circuit?.toUpperCase().includes("1P"));
    const hasAcb = devices.some((d) => d.type === "ACB" || d.current >= 630);
    const isVdb = devices.some((d) => d.current >= 250 && d.current < 630);

    let style: "FACADE_DB_1P" | "HORIZONTAL_DB" | "VERTICAL_PAN_VDB" | "MSB_FORM_2B" = "HORIZONTAL_DB";
    let w = 800, h = 800, d = 250, p = "4P", name = "DB-3P-STANDARD";

    if (is1P) {
      style = "FACADE_DB_1P";
      w = 500;
      h = 600;
      d = 200;
      p = "1P";
      name = "DB FACADE 12F";
    } else if (hasAcb) {
      style = "MSB_FORM_2B";
      w = 1000;
      h = 2000;
      d = 800;
      p = "4P";
      name = "MSB-1600A";
    } else if (isVdb) {
      style = "VERTICAL_PAN_VDB";
      w = 800;
      h = 1200;
      d = 300;
      p = "4P";
      name = "VDB-400A";
    }

    const hasTimer = devices.some((d) => d.type?.toUpperCase().includes("TIMER") || d.circuit?.toUpperCase().includes("TIMER"));
    const hasContactor = devices.some((d) => d.type?.toUpperCase().includes("CONTACTOR") || d.circuit?.toUpperCase().includes("CONTACTOR"));

    let acc_meter_v = is1P ? 1 : 1;
    let acc_meter_a = is1P ? 0 : 3;
    let acc_lamp_rst = is1P ? 1 : 3;
    let acc_btn_onoff = (hasTimer || hasContactor) ? 1 : cabinetParams.acc_btn_onoff;
    let acc_selector = (hasTimer || hasContactor) ? 1 : cabinetParams.acc_selector;
    let acc_btn_emerg = 1;

    if (layoutData) {
      if ((layoutData as any).panel_width) w = (layoutData as any).panel_width;
      if ((layoutData as any).panel_height) h = (layoutData as any).panel_height;
      if ((layoutData as any).panel_depth) d = (layoutData as any).panel_depth;
      if ((layoutData as any).panel_name) name = (layoutData as any).panel_name;
      if ((layoutData as any).phase) p = (layoutData as any).phase;
      if ((layoutData as any).cabinet_style) style = (layoutData as any).cabinet_style;
      if ((layoutData as any).door_components) {
        const dc = (layoutData as any).door_components;
        if (dc.acc_meter_v !== undefined) acc_meter_v = dc.acc_meter_v;
        if (dc.acc_meter_a !== undefined) acc_meter_a = dc.acc_meter_a;
        if (dc.acc_lamp_rst !== undefined) acc_lamp_rst = dc.acc_lamp_rst;
        if (dc.acc_selector !== undefined) acc_selector = dc.acc_selector;
        if (dc.acc_btn_emerg !== undefined) acc_btn_emerg = dc.acc_btn_emerg;
      }
    }

    setFormWidth(w);
    setFormHeight(h);
    setFormDepth(d);
    setFormPhase(p);
    setFormName(name);

    setCabinetParams((prev) => ({
      ...prev,
      width: w,
      height: h,
      depth: d,
      phase: p,
      cabinetStyle: style,
      name: name,
      acc_meter_v,
      acc_meter_a,
      acc_lamp_rst,
      acc_btn_onoff,
      acc_selector,
      acc_btn_emerg,
      project: (layoutData as any)?.project_name || (is1P ? "DỰ ÁN DB FACADE 12F" : prev.project),
    }));
  }, [devices, layoutData]);

  const handleOpenNewDrawingModal = () => {
    setFormWidth(cabinetParams.width);
    setFormHeight(cabinetParams.height);
    setFormDepth(cabinetParams.depth);
    setFormName(cabinetParams.name);
    setShowModal(true);
  };

  const handleCreateDrawing = () => {
    setCabinetParams((prev) => ({
      ...prev,
      width: formWidth,
      height: formHeight,
      depth: formDepth,
      name: formName,
    }));
    setHasDrawing(true);
    setPanOffset({ x: 0, y: 0 });
    setZoom(75); // Start with smaller zoom to fit all plates
    setRulerStart(null);
    setRulerEnd(null);
    setSelectedDevice(null);
    setShowModal(false);
  };

  const handleApplyEnclosureChanges = () => {
    setCabinetParams((prev) => ({
      ...prev,
      width: formWidth,
      height: formHeight,
      depth: formDepth,
      baseHeight: formBaseHeight,
      doorGap: formDoorGap,
      innerDoorDepth: formInnerDoorDepth,
      cableHoleRadius: formCableHoleRadius,
      ventLouvers: formVentLouvers,
      topCableHole: formTopCableHole,
      bottomCableHole: formBottomCableHole,
      name: formName,
      project: formProject,
      isc: formIsc,
      phase: formPhase,
    }));
  };

  const handleClearCanvas = () => {
    setHasDrawing(false);
    setSelectedDevice(null);
    setRulerStart(null);
    setRulerEnd(null);
  };

  const getDeviceColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "ACB":
        return "border-rose-500 bg-rose-50/95 text-rose-700 hover:bg-rose-100 hover:shadow-rose-100/50";
      case "MCCB":
        return "border-amber-500 bg-amber-50/95 text-amber-800 hover:bg-amber-100 hover:shadow-amber-100/50";
      case "MCB":
        return "border-blue-500 bg-blue-50/95 text-blue-700 hover:bg-blue-100 hover:shadow-blue-100/50";
      case "RCBO":
        return "border-emerald-500 bg-emerald-50/95 text-emerald-700 hover:bg-emerald-100 hover:shadow-emerald-100/50";
      default:
        return "border-slate-350 bg-slate-50 text-slate-700 hover:bg-slate-100";
    }
  };

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Layer switch tabs drag-to-scroll refs
  const layerTabsRef = useRef<HTMLDivElement>(null);
  const isDraggingTabsRef = useRef(false);
  const tabsStartXRef = useRef(0);
  const tabsScrollLeftRef = useRef(0);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!layerTabsRef.current) return;
    isDraggingTabsRef.current = true;
    tabsStartXRef.current = e.pageX - layerTabsRef.current.offsetLeft;
    tabsScrollLeftRef.current = layerTabsRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabsRef.current || !layerTabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - layerTabsRef.current.offsetLeft;
    const walk = (x - tabsStartXRef.current) * 1.5;
    layerTabsRef.current.scrollLeft = tabsScrollLeftRef.current - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    isDraggingTabsRef.current = false;
  };

  // Convert mouse events on coordinates tracker, Pan drag and Ruler measurement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasDrawing) return;
    
    // Pan dragging active
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Ruler line tracking active
    if (rulerStart && activeTool === "ruler") {
      const wsRect = workspaceRef.current ? workspaceRef.current.getBoundingClientRect() : { left: 0, top: 0 };
      const wsX = e.clientX - wsRect.left;
      const wsY = e.clientY - wsRect.top;
      setRulerEnd({ x: wsX, y: wsY });
    }

    // Plate coordinates tracker
    const targetElement = e.target as HTMLElement;
    const plateContainer = targetElement.closest("[data-plate-id]");
    
    if (plateContainer) {
      const plateId = plateContainer.getAttribute("data-plate-id") || "";
      const rect = plateContainer.getBoundingClientRect();
      
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      // Calculate coordinates scaled by physical width
      const scale = zoom / 100;
      const pxX = Math.round(clientX / scale);
      const pxY = Math.round(clientY / scale);
      
      // Map pixels to millimeters (width 800mm is 240px width container)
      const mmPerPx = cabinetParams.width / 240;
      const mmX = Math.round(pxX * mmPerPx);
      const mmY = Math.round(pxY * mmPerPx);

      setCoords({
        plate: plateId.toUpperCase(),
        x: String(mmX),
        y: String(mmY),
      });
    } else {
      setCoords({ plate: "", x: "--", y: "--" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasDrawing) return;

    const target = e.target as HTMLElement;
    const isInteractive = target.closest("button") || target.closest("input") || target.closest("select") || target.closest(".device-box");
    const plateContainer = target.closest("[data-plate-id]");

    if (activeTool === "ruler") {
      if (!plateContainer) {
        // Clicked OUTSIDE cabinet plate -> Drag as Hand tool (Pan)
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        return;
      }
      // Clicked INSIDE cabinet plate -> Start drawing Ruler
      const wsRect = workspaceRef.current ? workspaceRef.current.getBoundingClientRect() : { left: 0, top: 0 };
      const wsX = e.clientX - wsRect.left;
      const wsY = e.clientY - wsRect.top;
      setRulerStart({ x: wsX, y: wsY });
      setRulerEnd({ x: wsX, y: wsY });
    } else if (activeTool === "pan" || e.button === 1 || !isInteractive) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setCoords({ plate: "", x: "--", y: "--" });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomStep = e.deltaY < 0 ? 10 : -10;
    setZoom((prev) => {
      const nextZoom = Math.min(400, Math.max(10, prev + zoomStep));
      // Proportional scale adjustment on panOffset to keep center locked on zoom
      const scaleRatio = nextZoom / prev;
      setPanOffset((prevPan) => ({
        x: Math.round(prevPan.x * scaleRatio),
        y: Math.round(prevPan.y * scaleRatio),
      }));
      return nextZoom;
    });
  };

  const handleSetActiveTool = (tool: "pan" | "ruler") => {
    if (activeTool === tool) {
      setActiveTool("select");
    } else {
      setActiveTool(tool);
    }
    setRulerStart(null);
    setRulerEnd(null);
  };

  const handleResetFit = () => {
    setZoom(selectedLayer === "all" ? 65 : 100);
    setPanOffset({ x: 0, y: 0 });
    setRulerStart(null);
    setRulerEnd(null);
  };

  // Exact parsed devices analyzed from Single Line Diagram drawing TĐ-H
  const activeDevices = (devices && devices.length > 0) ? devices : [
    // Rail 1 Devices: Main Incomer + Indicator Fuse + Lighting & Primary RCBOs
    { id: "dev_main", circuit: "TOTAL-IN", type: "MCB", pole: 3, current: 40, icu: "10kA", brand: "LS Electric", model: "BKN 3P 40A 10kA", status: "matched", level: 0 },
    { id: "dev_fuse", circuit: "CC 3x2A", type: "FUSE", pole: 3, current: 2, icu: "10kA", brand: "LS Electric", model: "Fuse Holder 3P 2A", status: "matched", level: 0 },
    { id: "dev_e1", circuit: "E1-EMERG", type: "MCB", pole: 1, current: 10, icu: "6kA", brand: "LS Electric", model: "BKN 1P 10A", status: "matched", level: 1 },
    { id: "dev_l1", circuit: "L1-LIGHT", type: "MCB", pole: 1, current: 10, icu: "6kA", brand: "LS Electric", model: "BKN 1P 10A", status: "matched", level: 1 },
    { id: "dev_l2", circuit: "L2-LIGHT", type: "MCB", pole: 1, current: 10, icu: "6kA", brand: "LS Electric", model: "BKN 1P 10A", status: "matched", level: 1 },
    { id: "dev_s1", circuit: "S1-SOCKET", type: "RCBO", pole: 2, current: 16, icu: "6kA", leakage: "30mA", brand: "LS Electric", model: "RKP 1P+N 16A 30mA", status: "matched", level: 1 },
    { id: "dev_s2", circuit: "S2-SOCKET", type: "RCBO", pole: 2, current: 16, icu: "6kA", leakage: "30mA", brand: "LS Electric", model: "RKP 1P+N 16A 30mA", status: "matched", level: 1 },

    // Rail 2 Devices: Socket RCBOs + AC Units IN1..IN5
    { id: "dev_s3", circuit: "S3-SOCKET", type: "RCBO", pole: 2, current: 16, icu: "6kA", leakage: "30mA", brand: "LS Electric", model: "RKP 1P+N 16A 30mA", status: "matched", level: 2 },
    { id: "dev_s4", circuit: "S4-SOCKET", type: "RCBO", pole: 2, current: 16, icu: "6kA", leakage: "30mA", brand: "LS Electric", model: "RKP 1P+N 16A 30mA", status: "matched", level: 2 },
    { id: "dev_s5", circuit: "S5-SOCKET", type: "RCBO", pole: 2, current: 16, icu: "6kA", leakage: "30mA", brand: "LS Electric", model: "RKP 1P+N 16A 30mA", status: "matched", level: 2 },
    { id: "dev_in1", circuit: "IN1-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 2 },
    { id: "dev_in2", circuit: "IN2-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 2 },
    { id: "dev_in3", circuit: "IN3-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 2 },

    // Rail 3 Devices: AC Units IN4..IN8 + DOL Motor Starter P1 + Reserve SP
    { id: "dev_in4", circuit: "IN4-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 3 },
    { id: "dev_in5", circuit: "IN5-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 3 },
    { id: "dev_in6", circuit: "IN6-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 3 },
    { id: "dev_in7", circuit: "IN7-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 3 },
    { id: "dev_in8", circuit: "IN8-AC", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A", status: "matched", level: 3 },
    { id: "dev_p1", circuit: "P1-FAN", type: "CONTACTOR", pole: 3, current: 16, icu: "6kA", brand: "LS Electric", model: "MC-18b 18A + MT-32", status: "matched", level: 3 },
    { id: "dev_sp", circuit: "SP-SPARE", type: "MCB", pole: 1, current: 16, icu: "6kA", brand: "LS Electric", model: "BKN 1P 16A (Dự phòng)", status: "matched", level: 3 },
  ];

  // Smart 3-rail auto-balancer function for even device distribution
  const buildSmartBalancedLayout = (devList: Device[]) => {
    if (devList.length === 0) return { panel_width: cabinetParams.width, panel_height: cabinetParams.height, rails: [] };

    // Level 0 / Main Incomer + Fuse go to Rail 1
    const mainIncomers = devList.filter((d) => (d.level ?? 0) === 0 || d.type === "ACB");
    const remainingDevs = devList.filter((d) => !mainIncomers.includes(d));

    // Target ~1/3 items per rail
    const totalCount = devList.length;
    const targetPerRail = Math.max(2, Math.ceil(totalCount / 3));

    const rail1ExtraCount = Math.max(0, targetPerRail - mainIncomers.length);
    const rail1Devs = [...mainIncomers, ...remainingDevs.slice(0, rail1ExtraCount)];
    
    const remainingAfter1 = remainingDevs.slice(rail1ExtraCount);
    const rail2Count = Math.ceil(remainingAfter1.length / 2);
    const rail2Devs = remainingAfter1.slice(0, rail2Count);
    const rail3Devs = remainingAfter1.slice(rail2Count);

    return {
      panel_width: cabinetParams.width,
      panel_height: cabinetParams.height,
      rails: [
        { id: "rail_1", y: 160, devices: rail1Devs.map((d) => d.id) },
        { id: "rail_2", y: 380, devices: rail2Devs.map((d) => d.id) },
        { id: "rail_3", y: 600, devices: rail3Devs.map((d) => d.id) },
      ],
    };
  };

  // Detect if passed layoutData is unbalanced (e.g. 15 items on Rail 3 and 0 on Rail 2)
  const isUnbalancedLayout = (layout: any) => {
    if (!layout || !layout.rails || layout.rails.length === 0) return true;
    const counts = layout.rails.map((r: any) => (r.devices ? r.devices.length : 0));
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    if (maxCount > 7) return true; // Overcrowded single rail!
    if (counts.length >= 3 && minCount === 0 && counts.reduce((a: number, b: number) => a + b, 0) > 3) return true; // Empty middle rail!
    return false;
  };

  // Fallback layout data if missing from backend or unbalanced
  const activeLayout = layoutData && !isUnbalancedLayout(layoutData)
    ? layoutData
    : buildSmartBalancedLayout(activeDevices);

  // Dynamic 2D canvas pixel dimensions based on real cabinet millimeters (1mm = 0.42px)
  const scaleFactor2D = 0.42;
  const plateWidthPx = Math.max(260, Math.round(cabinetParams.width * scaleFactor2D));
  const plateHeightPx = Math.max(380, Math.round(cabinetParams.height * scaleFactor2D));

  return (
    <div className="bg-slate-900 overflow-hidden flex flex-col flex-1 h-full min-h-0 w-full rounded-none border-none shadow-none transition-all relative font-sans">
      


      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative min-h-[500px]">
        
        {/* EMPTY STATE SCREEN */}
        {!hasDrawing && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center relative z-0">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md mb-6 group hover:border-blue-500/50 hover:bg-slate-50 transition-all duration-300">
              <svg className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-slate-800 tracking-wide mb-1.5">
              Chưa có bản vẽ nào
            </h3>
            
            <button
              onClick={handleOpenNewDrawingModal}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer mb-3.5 flex items-center space-x-1.5 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>+</span>
              <span>Bản vẽ mới</span>
            </button>
            
            <p className="text-[11px] text-slate-500 font-medium">
              hoặc bấm <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mx-1">📂 Mở dự án</span> để mở file đã lưu
            </p>
          </div>
        )}

        {/* WORKSPACE & CANVAS (when drawing exists) */}
        {hasDrawing && (
          <div className="flex-1 min-h-0 h-full max-h-full flex flex-col bg-slate-50 overflow-hidden relative">
            
            {/* TOP CAD TOOLBAR - ROW 1: MAIN MODES, COORDINATES, PDF & AI TOOLS | ROW 2: TOOLS, GRID, ZOOM */}
            <div className="px-3 py-1.5 bg-white border-b border-slate-200 flex flex-col space-y-1.5 text-xs text-slate-600 select-none z-30 shadow-sm w-full shrink-0 font-sans relative">
              {/* ROW 1: CHẾ ĐỘ XEM (Trái) & TỌA ĐỘ, PDF, AI LAYOUT/ACB, NÚT ẨN PANEL (Phải) */}
              <div className="flex items-center justify-between space-x-2 relative z-20 overflow-visible">
                {/* Left: View Mode Selection */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex bg-slate-100 border border-slate-200/90 p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => setViewMode("physical")}
                      className={`h-6 px-3 flex items-center space-x-1.5 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
                        viewMode === "physical" ? "bg-blue-600 text-white shadow-2xs" : "hover:bg-slate-200 text-slate-600 font-semibold"
                      }`}
                    >
                      <span>📐 Bố trí (Layout)</span>
                    </button>
                    <button
                      onClick={() => setViewMode("schematic")}
                      className={`h-6 px-3 flex items-center space-x-1.5 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
                        viewMode === "schematic" ? "bg-blue-600 text-white shadow-2xs" : "hover:bg-slate-200 text-slate-600 font-semibold"
                      }`}
                    >
                      <span>⚡ Nguyên lý (SLD)</span>
                    </button>
                  </div>
                </div>

                {/* Right: Coordinates, PDF, AI Layout, AI ACB & Panel Toggle Button */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {/* Coordinates indicator */}
                  <div className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/90 shrink-0">
                    {coords.plate ? `${coords.plate} ` : ""}X: <span className="text-slate-800 font-extrabold">{coords.x}</span> Y: <span className="text-slate-800 font-extrabold">{coords.y}</span>
                  </div>

                  {/* PDF màu Button */}
                  <button
                    onClick={() => window.print()}
                    className="h-6 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-bold text-[10.5px] cursor-pointer flex items-center space-x-1 shadow-2xs shrink-0"
                    title="Xuất/In bản vẽ PDF màu"
                  >
                    <span>📄 PDF màu</span>
                  </button>

                  {/* 🤖 AI LAYOUT DROPDOWN */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => { setShowAiLayoutMenu(!showAiLayoutMenu); setShowAiAcbMenu(false); }}
                      className="h-6 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold text-[10.5px] cursor-pointer shadow-2xs flex items-center space-x-1.5 shrink-0"
                      title="Tự động bố trí layout tủ điện bằng AI"
                    >
                      <span>🤖 AI Layout</span>
                      <span className="text-[7.5px] opacity-70">▼</span>
                    </button>
                    {showAiLayoutMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10.5px] rounded-lg shadow-2xl py-1 w-64 z-50 font-sans">
                        <div className="px-3 py-1 font-mono text-[9px] font-bold text-slate-400 border-b border-slate-800 uppercase">CHỌN MẪU BỐ TRÍ LAYOUT AI</div>
                        <button
                          onClick={() => {
                            alert("🤖 AI Layout: Đã sắp xếp lại Layout Tủ Phân Phối MDB 3 Cấp (ACB Tổng -> MCCB Phân Phối -> MCB Tải Outgoing).");
                            setShowAiLayoutMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 flex flex-col cursor-pointer border-b border-slate-800/60"
                        >
                          <span className="font-bold text-blue-400">🏢 Tủ Phân Phối MDB 3 Cấp</span>
                          <span className="text-[9px] text-slate-400">ACB 630A Top | MCCB Middle | MCB Bottom</span>
                        </button>
                        <button
                          onClick={() => {
                            alert("🤖 AI Layout: Đã áp dụng Layout Tủ Tổng Main ACB High-Power.");
                            setShowAiLayoutMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 flex flex-col cursor-pointer border-b border-slate-800/60"
                        >
                          <span className="font-bold text-amber-400">⚡ Tủ Tổng Main ACB High-Power</span>
                          <span className="text-[9px] text-slate-400">Gá khoang máy cắt ACB 1000A - 3200A</span>
                        </button>
                        <button
                          onClick={() => {
                            alert("🤖 AI Layout: Đã áp dụng Layout Tủ Điều Khiển MCC / ATS.");
                            setShowAiLayoutMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 flex flex-col cursor-pointer"
                        >
                          <span className="font-bold text-emerald-400">🕹️ Tủ Điều Khiển Động Cơ MCC / ATS</span>
                          <span className="text-[9px] text-slate-400">MCCB + Khởi động từ Contactor + Rơ le nhiệt</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ⚡ AI ACB DROPDOWN */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => { setShowAiAcbMenu(!showAiAcbMenu); setShowAiLayoutMenu(false); }}
                      className="h-6 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-md font-bold text-[10.5px] cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
                      title="Bố trí khoang ACB tự động"
                    >
                      <span>⚡ AI ACB</span>
                      <span className="text-[7.5px] opacity-70">▼</span>
                    </button>
                    {showAiAcbMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10.5px] rounded-lg shadow-2xl py-1 w-56 z-50 font-sans">
                        <button
                          onClick={() => {
                            alert("⚡ AI ACB: Đã cấu hình khoang ACB 630A - 1600A Drawout Type.");
                            setShowAiAcbMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                        >
                          <span>🔴 ACB 630A - 1600A Drawout</span>
                        </button>
                        <button
                          onClick={() => {
                            alert("⚡ AI ACB: Đã cấu hình khoang ACB 2000A - 3200A Fixed Type.");
                            setShowAiAcbMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                        >
                          <span>🟠 ACB 2000A - 3200A Fixed</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 🧊 PREVIEW 3D BUTTON */}
                  <button
                    onClick={() => setShow3dModal(true)}
                    className="h-6 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-extrabold text-[10.5px] cursor-pointer shadow-sm flex items-center space-x-1.5 border border-indigo-500 transition-all shrink-0 animate-pulse hover:animate-none"
                    title="Xem mô hình tủ điện 3D tương tác"
                  >
                    <span>🧊 Preview 3D</span>
                  </button>

                  <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className={`h-6 px-2.5 rounded-md font-bold text-[10.5px] cursor-pointer shadow-2xs flex items-center space-x-1 border transition-all shrink-0 ${
                      showRightPanel
                        ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                        : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                    }`}
                    title={showRightPanel ? "Ẩn bảng thông số" : "Hiện bảng thông số"}
                  >
                    <span>{showRightPanel ? "⏩ Ẩn Panel" : "⚙️ Panel Props"}</span>
                  </button>
                </div>
              </div>

              {/* ROW 2: CÁC CÔNG CỤ THAO TÁC, LƯỚI & ZOOM */}
              <div className="flex items-center justify-between space-x-2 pt-1 border-t border-slate-100 relative z-10 overflow-visible">
                {/* Left: Snap, Undo, Tools, Align, Pan/Ruler, Zoom & Fit */}
                <div className="flex items-center space-x-2 shrink-0 overflow-x-auto custom-scrollbar [&::-webkit-scrollbar]:h-0.5">
                  {/* Grid & Snap */}
                  <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-800 text-slate-700 bg-slate-50 border border-slate-200/90 px-2 py-0.5 rounded-md shrink-0">
                    <input
                      type="checkbox"
                      checked={snap}
                      onChange={(e) => setSnap(e.target.checked)}
                      className="rounded bg-slate-50 border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[10.5px] font-bold">Snap 5mm</span>
                  </label>

                  {/* Undo & Redo Buttons */}
                  <div className="flex items-center space-x-0.5 bg-slate-100 border border-slate-200/90 p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => alert("↩ Đã hoàn tác thao tác vừa thực hiện (Undo)")}
                      className="h-5 px-2 hover:bg-white hover:shadow-2xs text-slate-700 rounded font-bold text-[10.5px] cursor-pointer"
                      title="Undo (Hoàn tác)"
                    >
                      ↩ Undo
                    </button>
                    <button
                      onClick={() => alert("↪ Đã phục hồi thao tác vừa hoàn tác (Redo)")}
                      className="h-5 px-2 hover:bg-white hover:shadow-2xs text-slate-700 rounded font-bold text-[10.5px] cursor-pointer"
                      title="Redo (Làm lại)"
                    >
                      ↪ Redo
                    </button>
                  </div>

                  {/* Dropdown Tools Menu */}
                  <div className="relative shrink-0 z-50">
                    <button
                      onClick={() => { setShowToolsMenu(!showToolsMenu); setShowAlignMenu(false); }}
                      className="h-6 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-bold text-[10.5px] cursor-pointer flex items-center space-x-1 shadow-2xs"
                    >
                      <span>🛠️ Công cụ</span>
                      <span className="text-[8px]">▼</span>
                    </button>
                    {showToolsMenu && (
                      <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10.5px] rounded-lg shadow-2xl py-1 w-48 z-50 font-sans">
                        <button onClick={() => { setZoom((z) => Math.min(200, z + 10)); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between cursor-pointer">
                          <span>🔍 Phóng to</span>
                          <span className="text-slate-500 text-[9px]">+10%</span>
                        </button>
                        <button onClick={() => { setZoom((z) => Math.max(25, z - 10)); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between cursor-pointer">
                          <span>🔎 Thu nhỏ</span>
                          <span className="text-slate-500 text-[9px]">-10%</span>
                        </button>
                        <button onClick={() => { handleResetFit(); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer">
                          <span>🎯 Fit View</span>
                        </button>
                        <div className="border-t border-slate-800 my-1"></div>
                        <button onClick={() => { handleSetActiveTool("ruler"); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer">
                          <span>📐 Thước đo kích thước</span>
                        </button>
                        <button onClick={() => { handleSetActiveTool("pan"); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer">
                          <span>✋ Di chuyển bản vẽ (Pan)</span>
                        </button>
                        <button onClick={() => { setRulerStart(null); setRulerEnd(null); setShowToolsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-400 flex items-center space-x-1.5 cursor-pointer">
                          <span>🧹 Xóa dòng thước đo</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Align Menu */}
                  <div className="relative shrink-0 z-50">
                    <button
                      onClick={() => { setShowAlignMenu(!showAlignMenu); setShowToolsMenu(false); }}
                      className="h-6 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-bold text-[10.5px] cursor-pointer flex items-center space-x-1 shadow-2xs"
                    >
                      <span>+ Căn chỉnh</span>
                      <span className="text-[8px]">▼</span>
                    </button>
                    {showAlignMenu && (
                      <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-700 text-slate-200 text-[10.5px] rounded-lg shadow-2xl py-1 w-48 z-50 font-sans">
                        <button onClick={() => { alert("Đã căn trái các thiết bị trên rail"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer">
                          <span>⬅️ Căn lề trái</span>
                        </button>
                        <button onClick={() => { alert("Đã căn giữa các thiết bị trên rail"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer">
                          <span>↔️ Căn giữa</span>
                        </button>
                        <button onClick={() => { alert("Đã căn phải các thiết bị trên rail"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer">
                          <span>➡️ Căn lề phải</span>
                        </button>
                        <div className="border-t border-slate-800 my-1"></div>
                        <button onClick={() => { alert("Đã căn viền trên"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer">
                          <span>🔝 Căn viền trên</span>
                        </button>
                        <button onClick={() => { alert("Đã căn viền dưới"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer">
                          <span>⬇️ Căn viền dưới</span>
                        </button>
                        <button onClick={() => { alert("Đã chia đều khoảng cách thiết bị"); setShowAlignMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-emerald-400 flex items-center space-x-2 cursor-pointer">
                          <span>📏 Chia đều khoảng cách</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CAD Presentation Format Selector (Matching User AutoCAD Drawings) */}
                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 p-0.5 rounded-lg shrink-0">
                    <span className="text-[10px] font-black text-amber-800 px-1 font-mono">CAD Layout:</span>
                    <select
                      value={cadFormat}
                      onChange={(e) => setCadFormat(e.target.value as any)}
                      className="bg-white border border-amber-300 rounded text-[10.5px] font-bold text-slate-800 px-1.5 py-0.5 focus:outline-none cursor-pointer"
                    >
                      <option value="SECTION_ALAYOUT">📐 Bản vẽ Lớp Cắt (A-A, B-B, C-C & Bảng Chú Thích 1..11)</option>
                      <option value="INDOOR_2DOOR_8VIEWS">🏬 Bản vẽ 2 Cánh Tôn 1.5 - 8 Hình chiếu (Hình 3)</option>
                      <option value="FORM_2B_MSB">🏢 Bản vẽ Khung Đứng Form 2B - 7 Hình chiếu (Hình 1)</option>
                      <option value="STANDARD_5M">📂 Bộ 5 Tờ CAD Tiêu Chuẩn M1..M5</option>
                    </select>
                  </div>

                  {/* Tool Toggles: Pan & Ruler */}
                  <div className="flex bg-slate-100 border border-slate-200/90 p-0.5 rounded-lg shrink-0 space-x-0.5">
                    <button
                      onClick={() => handleSetActiveTool("pan")}
                      className={`h-5.5 px-2 flex items-center space-x-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        activeTool === "pan" ? "bg-white border border-slate-300 text-slate-900 shadow-2xs" : "hover:bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      <span>✋</span>
                      <span>Pan</span>
                    </button>
                    <button
                      onClick={() => handleSetActiveTool("ruler")}
                      className={`h-5.5 px-2 flex items-center space-x-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        activeTool === "ruler" ? "bg-white border border-slate-300 text-slate-900 shadow-2xs" : "hover:bg-slate-200/60 text-slate-600"
                      }`}
                    >
                      <span>📐</span>
                      <span>Ruler</span>
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200/90 p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => setZoom((prev) => Math.max(10, prev - 15))}
                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded font-extrabold cursor-pointer text-slate-700 text-xs"
                      title="Thu nhỏ bản vẽ (-15%)"
                    >
                      -
                    </button>
                    <span
                      onClick={() => setZoom(100)}
                      className="text-[10px] px-1 font-bold font-mono min-w-[34px] text-center text-slate-800 cursor-pointer hover:text-blue-600"
                      title="Click để reset tỷ lệ 100%"
                    >
                      {zoom}%
                    </span>
                    <button
                      onClick={() => setZoom((prev) => Math.min(400, prev + 15))}
                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 rounded font-extrabold cursor-pointer text-slate-700 text-xs"
                      title="Phóng to bản vẽ (+15%)"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleResetFit}
                    className="h-6 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-bold text-[10.5px] cursor-pointer shadow-2xs shrink-0"
                  >
                    Fit View
                  </button>

                  <button
                    onClick={handleToggleFullscreen}
                    className="h-6 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-bold text-[10.5px] cursor-pointer flex items-center space-x-1 shadow-2xs shrink-0"
                    title="Toàn màn hình"
                  >
                    <span>{isFullscreen ? "🗗 Thu nhỏ" : "⛶ Fullscreen"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DRAWING BOARD WORKSPACE CANVAS & PROPERTIES FLOATING PANEL */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* CENTRAL VIEWPORT DRAWING AREA */}
              <div
                ref={workspaceRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
                onClick={() => setSelectedDevice(null)}
                className={`flex-1 p-8 flex items-center justify-center overflow-auto bg-slate-50 relative select-none ${
                  isDragging
                    ? "cursor-grabbing"
                    : activeTool === "ruler"
                    ? "cursor-crosshair"
                    : "cursor-grab"
                }`}
                style={{
                  backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* Global Floating Ruler Measurement SVG Overlay */}
                {activeTool === "ruler" && rulerStart && rulerEnd && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                    <line
                      x1={rulerStart.x}
                      y1={rulerStart.y}
                      x2={rulerEnd.x}
                      y2={rulerEnd.y}
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />
                    <circle cx={rulerStart.x} cy={rulerStart.y} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />
                    <circle cx={rulerEnd.x} cy={rulerEnd.y} r="5" fill="#2563eb" stroke="white" strokeWidth="2" />
                    {(() => {
                      const dx = rulerEnd.x - rulerStart.x;
                      const dy = rulerEnd.y - rulerStart.y;
                      const distPx = Math.sqrt(dx * dx + dy * dy);
                      const calculatedPlateWidth = Math.max(260, Math.round(cabinetParams.width * 0.42));
                      const mmPerPx = (cabinetParams.width / calculatedPlateWidth) / (zoom / 100);
                      const distMm = Math.round(distPx * mmPerPx);
                      
                      const midX = (rulerStart.x + rulerEnd.x) / 2;
                      const midY = (rulerStart.y + rulerEnd.y) / 2;
                      
                      return (
                        <g>
                          <rect
                            x={midX - 35}
                            y={midY - 12}
                            width="70"
                            height="22"
                            rx="6"
                            fill="#0f172a"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                          />
                          <text
                            x={midX}
                            y={midY + 3}
                            fill="#38bdf8"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {distMm} mm
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                )}
                
                {viewMode === "physical" && (
                  /* MULTI-PLATE HORIZONTAL DYNAMIC PROPORTIONAL CAD DISPLAY */
                  <div
                    className="transition-all duration-75 ease-out flex items-start space-x-12 p-6 origin-center"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
                      transformOrigin: "center center",
                    }}
                  >
                    {cadFormat === "SECTION_ALAYOUT" && <SectionalLayerSheet cabinetParams={cabinetParams} />}
                    {cadFormat === "FORM_2B_MSB" && <CubicleForm2BSheet cabinetParams={cabinetParams} />}
                    {cadFormat === "INDOOR_2DOOR_8VIEWS" && <Indoor2DoorSheet cabinetParams={cabinetParams} />}
                    {cadFormat === "STANDARD_5M" && (
                      <Standard5MPlates
                        devices={devices}
                        cabinetParams={cabinetParams}
                        selectedLayer={selectedLayer}
                        selectedDevice={selectedDevice}
                        setSelectedDevice={setSelectedDevice}
                      />
                    )}
                  </div>
                )}

                {viewMode === "schematic" && (
                  /* SINGLE LINE SCHEMATIC DIAGRAM SLD VIEW */
                  <div
                    className="transition-all duration-100 ease-out relative"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <div className="relative bg-white border border-slate-200 shadow-xl rounded-2xl p-8 w-[640px] min-h-[500px] flex flex-col select-none pointer-events-auto">
                      <div className="flex-1 flex flex-col items-center py-6 relative">
                        {/* Architectural CAD grids background pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:15px_15px] opacity-70"></div>

                        {/* Power input source drawing */}
                        <div className="relative z-10 flex flex-col items-center mb-8">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-slate-750">
                            G
                          </div>
                          <span className="text-[8.5px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">
                            3P Grid Input
                          </span>
                        </div>

                        {/* Main feed line */}
                        <div className="w-0.5 bg-slate-800 h-8 relative"></div>

                        {/* Main circuit breaker rendering */}
                        {devices.filter((d) => (d.level ?? 1) === 0).map((mainDev) => (
                          <div
                            key={mainDev.id}
                            className="relative z-10 flex flex-col items-center my-1 bg-white border-2 border-amber-500 text-amber-800 font-bold px-3 py-1.5 rounded-lg shadow-md text-center min-w-[130px] hover:scale-103 transition-transform"
                          >
                            <span className="text-[7.5px] text-slate-400 font-semibold tracking-wider leading-none">
                              {mainDev.circuit}
                            </span>
                            <span className="text-xs font-extrabold my-0.5 text-slate-800">
                              {mainDev.type} {mainDev.pole}P
                            </span>
                            <span className="text-[9.5px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 font-mono text-amber-600">
                              {mainDev.current}A
                            </span>
                          </div>
                        ))}

                        {/* Feeder downstream cable line */}
                        <div className="w-0.5 bg-slate-800 h-10 relative"></div>

                        {/* Main Copper Busbar 630A */}
                        <div className="w-11/12 h-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-slate-700 rounded-sm shadow-md relative flex items-center justify-center">
                          <span className="absolute -top-4 right-1 text-[7.5px] font-extrabold text-amber-600 uppercase tracking-widest">
                            Main Copper Busbar 630A
                          </span>
                        </div>

                        {/* Feeders Branch columns layout */}
                        <div className="w-full flex justify-between px-1 pt-1 mt-0 overflow-x-auto scrollbar-none">
                          {devices.filter((d) => (d.level ?? 1) > 0).map((branchDev, bIdx) => (
                            <div key={branchDev.id} className="flex flex-col items-center flex-1 min-w-[62px] relative mt-0">
                              {/* Connector feed wire */}
                              <div className="w-0.5 bg-slate-800 h-8"></div>

                              {/* Downstream circuit breaker element */}
                              <div className="relative z-10 bg-white border border-slate-300 text-slate-700 font-semibold p-1.5 rounded-md shadow-sm text-center min-w-[56px] hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                                <div className="text-[6.5px] text-slate-400 font-mono leading-none">
                                  {branchDev.circuit}
                                </div>
                                <div className="text-[8.5px] font-extrabold my-0.5 text-slate-800 leading-none">
                                  {branchDev.type}
                                </div>
                                <div className="text-[8.5px] font-bold text-slate-900 bg-slate-50 px-1 py-0.5 rounded border border-slate-200 mt-1 leading-none font-mono">
                                  {branchDev.current}A
                                </div>
                              </div>

                              {/* Cable line downstream to terminal load */}
                              <div className="w-0.5 bg-slate-800 h-10"></div>

                              {/* Load Terminals */}
                              <div className="w-3 h-3 rounded-full bg-slate-800 flex items-center justify-center text-[7px] text-white font-extrabold shadow border border-slate-400">
                                L
                              </div>
                              <span className="text-[7px] text-slate-500 font-extrabold mt-1.5 uppercase tracking-wide truncate max-w-full font-mono">
                                Load {bIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Toggle Button when Right Panel is Hidden */}
              {!showRightPanel && (
                <button
                  onClick={() => setShowRightPanel(true)}
                  className="absolute right-3 top-3 z-30 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center space-x-1.5 cursor-pointer transition-all hover:scale-105"
                  title="Hiện bảng thông số"
                >
                  <span>⚙️ Panel Specs</span>
                  <span>◀</span>
                </button>
              )}

              {/* FLOATING PROPERTIES & ACTIONS RIGHT PANEL (Tabbed Navigation) */}
              {showRightPanel && (
                <div className="w-80 bg-slate-900 text-slate-200 border-l border-slate-800 flex flex-col z-10 shrink-0 h-full max-h-full overflow-hidden select-none">
                  {/* Panel header tabs + Close button */}
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-2 shrink-0">
                    <div className="grid grid-cols-4 flex-1 text-center font-bold text-[10px] uppercase select-none">
                      {(["props", "iec", "enclosure", "materials"] as RightTabKey[]).map((tabKey) => {
                        const label = { props: "Props", iec: "IEC", enclosure: "Enclosure", materials: "Materials" }[tabKey];
                        const isActive = activeRightTab === tabKey;
                        return (
                          <button
                            key={tabKey}
                            onClick={() => setActiveRightTab(tabKey)}
                            className={`py-3 transition-colors cursor-pointer border-b-2 ${
                              isActive
                                ? "text-emerald-400 border-emerald-500 bg-slate-900"
                                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowRightPanel(false)}
                      className="p-1.5 ml-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer text-xs"
                      title="Ẩn Panel thông số"
                    >
                      ✖
                    </button>
                  </div>

                  {/* Tab contents (Scrollable area) */}
                  <div className="p-3.5 flex-1 flex flex-col space-y-3 overflow-y-auto min-h-0">
                  {activeRightTab === "props" && (
                    <div className="space-y-3 flex-1">
                      {!selectedDevice ? (
                        <div className="text-slate-500 text-[11px] leading-relaxed text-center py-8">
                          <p className="font-bold text-slate-400 mb-1">Chọn thiết bị trên canvas</p>
                          <div className="text-[9.5px] text-slate-500 bg-slate-950 border border-slate-850 p-2 rounded mt-3 text-left space-y-1 font-mono">
                            <div>Phím tắt:</div>
                            <div>R — Xoay 90°</div>
                            <div>Del — Xóa</div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between">
                            <span>Thông tin thiết bị</span>
                            <span className="text-[8.5px] text-slate-500 font-mono">#{selectedDevice.id.slice(0,4)}</span>
                          </h4>
                          <div className="space-y-1.5 text-[11px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mã mạch:</span>
                              <span className="text-slate-200 font-bold">{selectedDevice.circuit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Loại:</span>
                              <span className="text-amber-400 font-bold">{selectedDevice.type} {selectedDevice.pole}P</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Dòng định mức:</span>
                              <span className="text-emerald-400 font-bold">{selectedDevice.current}A</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Model:</span>
                              <span className="text-slate-350">{selectedDevice.model}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Hãng SX:</span>
                              <span className="text-slate-200 font-bold">{selectedDevice.brand || "LS"}</span>
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-500 bg-slate-900 border border-slate-850 p-2 rounded mt-3 text-left space-y-1 font-mono">
                            <div>Thao tác nhanh:</div>
                            <div>• Nhấn <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">R</kbd> để xoay thiết bị</div>
                            <div>• Nhấn <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Del</kbd> để xóa thiết bị</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeRightTab === "iec" && (
                    <div className="space-y-3 flex-1 text-xs">
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-2">
                        <h4 className="font-bold text-emerald-400 text-[10.5px] uppercase tracking-wider flex items-center space-x-1">
                          <span>✓</span> <span>Tiêu chuẩn IEC 61439</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">
                          Kiểm tra độ giãn cách, dòng tải và khả năng cách điện theo thiết kế IEC.
                        </p>
                      </div>

                      <div className="space-y-2 text-[10px] font-mono text-slate-400">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                          <span>Cách điện Busbar:</span>
                          <span className="text-emerald-500 font-bold">✓ OK</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                          <span>Khoảng cách máng cáp:</span>
                          <span className="text-emerald-500 font-bold">✓ OK</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                          <span>Khả năng thoát nhiệt:</span>
                          <span className="text-emerald-500 font-bold">✓ OK</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1">
                          <span>Tính toán Isc CB:</span>
                          <span className="text-emerald-500 font-bold">✓ OK</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRightTab === "enclosure" && (
                    <div className="space-y-3 flex-1 text-xs overflow-y-auto pr-1">
                      <div className="text-slate-400 font-extrabold uppercase text-[9px] tracking-widest border-b border-slate-800 pb-1">
                        ■ CHỦNG LOẠI & KIẾN TRÚC TỦ ĐIỆN
                      </div>

                      {/* Architecture Preset Selector */}
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                        <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Chọn Loại Tủ Điện SLD
                        </label>
                        <select
                          value={cabinetParams.cabinetStyle || "HORIZONTAL_DB"}
                          onChange={(e) => {
                            const style = e.target.value;
                            if (style === "FACADE_DB_1P") {
                              setFormWidth(500);
                              setFormHeight(600);
                              setFormDepth(200);
                              setFormPhase("1P");
                              setCabinetParams((prev) => ({
                                ...prev,
                                width: 500,
                                height: 600,
                                depth: 200,
                                phase: "1P",
                                cabinetStyle: "FACADE_DB_1P",
                                name: "DB FACADE 12F",
                              }));
                            } else if (style === "VERTICAL_PAN_VDB") {
                              setFormWidth(800);
                              setFormHeight(1200);
                              setFormDepth(300);
                              setFormPhase("4P");
                              setCabinetParams((prev) => ({
                                ...prev,
                                width: 800,
                                height: 1200,
                                depth: 300,
                                phase: "4P",
                                cabinetStyle: "VERTICAL_PAN_VDB",
                                name: "VDB-400A",
                              }));
                            } else if (style === "MSB_FORM_2B") {
                              setFormWidth(1000);
                              setFormHeight(2000);
                              setFormDepth(800);
                              setFormPhase("4P");
                              setCabinetParams((prev) => ({
                                ...prev,
                                width: 1000,
                                height: 2000,
                                depth: 800,
                                phase: "4P",
                                cabinetStyle: "MSB_FORM_2B",
                                name: "MSB-1600A",
                              }));
                            } else {
                              setFormWidth(800);
                              setFormHeight(800);
                              setFormDepth(250);
                              setFormPhase("4P");
                              setCabinetParams((prev) => ({
                                ...prev,
                                width: 800,
                                height: 800,
                                depth: 250,
                                phase: "4P",
                                cabinetStyle: "HORIZONTAL_DB",
                                name: "DB-3P-STANDARD",
                              }));
                            }
                          }}
                          className="w-full bg-slate-900 border border-amber-500/40 rounded px-2.5 py-1.5 text-slate-100 font-bold text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="FACADE_DB_1P">⚡ Tủ DB 1 Pha / Facade (500x600x200 - 220V Timer/BMS)</option>
                          <option value="HORIZONTAL_DB">⚡ Tủ DB 3 Pha Phân Phối (800x800x250 - 380V Standard)</option>
                          <option value="VERTICAL_PAN_VDB">⚡ Tủ VDB Dạng Pan Assembly (800x1200x300 - 400A)</option>
                          <option value="MSB_FORM_2B">⚡ Tủ Tổng MSB / MCC Động Cơ (1000x2000x800 - Form 2B)</option>
                        </select>
                        <p className="text-[9.5px] text-slate-400 font-medium">
                          Tự động điều chỉnh kích thước WxHxD, hệ busbar (1P/3P), thiết bị điều khiển và lớp cắt 2D/3D.
                        </p>
                      </div>

                      <div className="text-slate-400 font-extrabold uppercase text-[9px] tracking-widest border-b border-slate-800 pb-1 mt-2">
                        ■ THÔNG SỐ VỎ TỦ
                      </div>

                      {/* Dimensions W H D */}
                      <div className="space-y-2.5 bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <div className="font-bold text-slate-400 text-[9.5px] tracking-wider uppercase mb-1">
                          Kích thước (MM)
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Chiều rộng W</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formWidth}
                            onChange={(e) => setFormWidth(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Chiều cao H</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formHeight}
                            onChange={(e) => setFormHeight(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Chiều sâu D</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formDepth}
                            onChange={(e) => setFormDepth(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* CAD Drawings specifications */}
                      <div className="space-y-2.5 bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <div className="font-bold text-slate-400 text-[9.5px] tracking-wider uppercase mb-1">
                          Bản vẽ hình chiếu
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Chiều cao bệ tủ</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formBaseHeight}
                            onChange={(e) => setFormBaseHeight(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Khe cánh tủ</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formDoorGap}
                            onChange={(e) => setFormDoorGap(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Cánh trong (sâu lắp từ mặt trước)</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formInnerDoorDepth}
                            onChange={(e) => setFormInnerDoorDepth(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 font-medium">
                            <span>Bán kính lỗ cáp</span> <span>mm</span>
                          </div>
                          <input
                            type="number"
                            value={formCableHoleRadius}
                            onChange={(e) => setFormCableHoleRadius(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Spec checkboxes */}
                        <div className="space-y-1.5 pt-1 text-[10px] text-slate-350">
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formVentLouvers}
                              onChange={(e) => setFormVentLouvers(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>Lá thông gió (mặt hông)</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formTopCableHole}
                              onChange={(e) => setFormTopCableHole(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>Lỗ cáp nóc tủ</span>
                          </label>
                          <label className="flex items-center space-x-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formBottomCableHole}
                              onChange={(e) => setFormBottomCableHole(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>Lỗ cáp đáy tủ</span>
                          </label>
                        </div>
                      </div>

                      {/* Electrical Specs */}
                      <div className="space-y-2.5 bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <div className="font-bold text-slate-400 text-[9.5px] tracking-wider uppercase mb-1">
                          Thông số điện
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 mb-0.5 font-medium">Tên tủ</div>
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 mb-0.5 font-medium">Dự án</div>
                          <input
                            type="text"
                            value={formProject}
                            onChange={(e) => setFormProject(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] text-slate-500 mb-0.5 font-medium">Isc (kA)</div>
                            <input
                              type="number"
                              value={formIsc}
                              onChange={(e) => setFormIsc(Number(e.target.value))}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none"
                            />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 mb-0.5 font-medium">Hệ</div>
                            <select
                              value={formPhase}
                              onChange={(e) => setFormPhase(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-xs w-full focus:outline-none cursor-pointer"
                            >
                              <option value="4P">4P</option>
                              <option value="3P">3P</option>
                              <option value="1P">1P</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Apply changes action button */}
                      <button
                        onClick={handleApplyEnclosureChanges}
                        className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 rounded py-1.5 font-bold cursor-pointer text-center text-[10.5px] transition-all w-full flex items-center justify-center space-x-1"
                      >
                        <span>↺</span> <span>Áp dụng thay đổi</span>
                      </button>
                    </div>
                  )}

                  {activeRightTab === "materials" && (
                    <div className="space-y-3 flex-1 text-xs">
                      <div className="text-slate-450 font-extrabold uppercase text-[9px] tracking-widest border-b border-slate-800 pb-1">
                        📊 THỐNG KÊ VẬT LIỆU
                      </div>
                      
                      <div className="space-y-2.5">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                          <div className="font-bold text-amber-500 text-[10px] uppercase mb-1">■ Thanh đồng (Busbar)</div>
                          <p className="text-[9.5px] text-slate-500 leading-normal">
                            Chưa có thanh đồng (busbar) nào trên bản vẽ. Kéo thanh đồng từ mục Phụ kiện vào tủ để thống kê.
                          </p>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1">
                          <div className="font-bold text-blue-450 text-blue-400 text-[10px] uppercase mb-1">■ Thiết bị điện (Breakers)</div>
                          <div className="text-[10px] font-mono space-y-1 text-slate-400">
                            <div className="flex justify-between">
                              <span>ACB LS 630A:</span>
                              <span className="text-slate-200">{devices.filter(d=>d.type==="ACB").length} cái</span>
                            </div>
                            <div className="flex justify-between">
                              <span>MCCB LS 125A:</span>
                              <span className="text-slate-200">{devices.filter(d=>d.type==="MCCB").length} cái</span>
                            </div>
                            <div className="flex justify-between">
                              <span>MCB LS 32A:</span>
                              <span className="text-slate-200">{devices.filter(d=>d.type==="MCB").length} cái</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-850 pt-1 mt-1 font-bold text-slate-350">
                              <span>Tổng cộng:</span>
                              <span className="text-emerald-400">{devices.length} thiết bị</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM COMMON CAD ACTIONS GRID (Pinned to bottom, never overflows) */}
                <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2 select-none shrink-0">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setShowIecCheckModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all"
                    >
                      ✓ IEC check
                    </button>
                    <button
                      onClick={() => setShowExportDxfModal(true)}
                      className="border border-white/60 hover:bg-white/10 text-white font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all"
                    >
                      ⬇ Export DXF
                    </button>
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all">
                      ⚙ Màu DXF
                    </button>
                    <button className="border border-emerald-500/70 hover:bg-emerald-500/10 text-emerald-400 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all">
                      📄 Xuất PDF màu
                    </button>
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all">
                      ⚙ D' (mặt đột)
                    </button>
                    <button
                      onClick={() => setShowBomModal(true)}
                      className="border border-emerald-600 hover:bg-emerald-600/10 text-emerald-500 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all"
                    >
                      📊 Xuất BOM Excel
                    </button>
                  </div>
                  {/* Row 4 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setShowSaveProjectModal(true)}
                      className="border border-blue-500 hover:bg-blue-500/10 text-blue-400 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all"
                    >
                      💾 Save project
                    </button>
                    <button
                      onClick={() => setShowOpenProjectModal(true)}
                      className="border border-blue-300/40 hover:bg-slate-800 text-slate-200 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center space-x-1"
                    >
                      <span>📂</span> <span>Open project...</span>
                    </button>
                  </div>
                  <button
                    onClick={handleClearCanvas}
                    className="border border-red-500/50 hover:bg-red-500/15 text-red-400 font-bold text-[9.5px] py-1.5 rounded-lg text-center cursor-pointer transition-all w-full"
                  >
                    🗑 Clear canvas
                  </button>
                </div>
              </div>
            )}

            </div>

            {/* MULTI-PLATE LAYER SWITCH TABS (Single horizontal swiper row at the VERY BOTTOM) */}
            {viewMode === "physical" && (
              <div
                ref={layerTabsRef}
                onMouseDown={handleTabsMouseDown}
                onMouseMove={handleTabsMouseMove}
                onMouseUp={handleTabsMouseUpOrLeave}
                onMouseLeave={handleTabsMouseUpOrLeave}
                className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-nowrap items-center gap-2 overflow-x-auto text-[11.5px] select-none z-10 shadow-2xs min-w-0 max-w-full whitespace-nowrap shrink-0 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:none [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <button
                  onClick={() => { setSelectedLayer("all"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "all"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  🌐 Xem tất cả các lớp (5 Plates)
                </button>
                <span className="text-slate-300 px-0.5 shrink-0">|</span>
                <button
                  onClick={() => { setSelectedLayer("m1"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "m1"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  🛠️ M1. Mặt gá thiết bị (Front Layout)
                </button>
                <button
                  onClick={() => { setSelectedLayer("m2"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "m2"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  🚪 M2. Mặt hông trái (Left Side Layout)
                </button>
                <button
                  onClick={() => { setSelectedLayer("m3"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "m3"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  🟢 M3. Tấm che bảo vệ (Inner Plate)
                </button>
                <button
                  onClick={() => { setSelectedLayer("m4"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "m4"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  🚨 M4. Mặt cánh ngoài (Outer Door)
                </button>
                <button
                  onClick={() => { setSelectedLayer("m5"); setRulerStart(null); setRulerEnd(null); }}
                  className={`px-3.5 py-1.5 text-[11.5px] font-extrabold rounded-xl border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    selectedLayer === "m5"
                      ? "bg-white border-slate-300 text-blue-600 shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  📐 M5. Mặt lưng/khung (Back layout)
                </button>
              </div>
            )}

          </div>
        )}

        {/* EXPORT DXF MODAL */}
        {showExportDxfModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col p-5 text-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">⬇ Export DXF</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tải file bản vẽ tủ điện DXF CAD.</p>
                </div>
                <button onClick={() => setShowExportDxfModal(false)} className="text-slate-400 hover:text-slate-200 font-bold p-1 rounded hover:bg-slate-800">✕</button>
              </div>
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[9.5px]">Layers được xuất</h4>
                  <div className="flex items-center text-slate-400 space-x-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-emerald-500" />
                    <span>Layer Thiết bị (Breakers)</span>
                  </div>
                  <div className="flex items-center text-slate-400 space-x-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-emerald-500" />
                    <span>Layer Vỏ tủ (Enclosure)</span>
                  </div>
                  <div className="flex items-center text-slate-400 space-x-2">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-emerald-500" />
                    <span>Layer Thanh đồng (Busbar)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button onClick={() => setShowExportDxfModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 text-xs font-bold rounded-lg">Huỷ</button>
                <button onClick={handleDownloadDxf} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow">
                  ⬇ Tải xuống .dxf
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SAVE PROJECT MODAL */}
        {showSaveProjectModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">💾 Save Project</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lưu thiết kế tủ điện vào máy (.json).</p>
                </div>
                <button onClick={() => setShowSaveProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Tủ:</span>
                  <span className="font-bold text-slate-800">{cabinetParams.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kích thước:</span>
                  <span className="font-mono">{cabinetParams.width}×{cabinetParams.height}×{cabinetParams.depth} mm</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Thiết bị:</span>
                  <span className="font-bold">{devices.length} breakers</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button onClick={() => setShowSaveProjectModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg">Huỷ</button>
                <button onClick={handleSaveProject} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow">
                  💾 Tải xuống project.json
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPEN PROJECT MODAL */}
        {showOpenProjectModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">📂 Open Project</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tải file thiết kế tủ điện đã lưu (.json).</p>
                </div>
                <button onClick={() => setShowOpenProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 space-y-1.5 mb-4">
                <div className="text-3xl text-slate-300">📂</div>
                <p className="text-xs text-slate-600 font-bold">Kéo thả file project.json vào đây<br />hoặc bấm để chọn file</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      try {
                        const data = JSON.parse(evt.target?.result as string);
                        if (data.cabinetParams) {
                          setCabinetParams(data.cabinetParams);
                          setFormWidth(data.cabinetParams.width);
                          setFormHeight(data.cabinetParams.height);
                          setFormDepth(data.cabinetParams.depth);
                          setFormBaseHeight(data.cabinetParams.baseHeight || 100);
                          setFormName(data.cabinetParams.name || "MDB-01");
                          setFormPhase(data.cabinetParams.phase || "4P");
                          setHasDrawing(true);
                          setShowOpenProjectModal(false);
                        }
                      } catch {
                        alert("File không hợp lệ");
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="mt-2 text-xs"
                />
              </div>
              <button onClick={() => setShowOpenProjectModal(false)} className="text-center text-xs text-slate-500 underline cursor-pointer">Đóng</button>
            </div>
          </div>
        )}

        {/* IEC CHECK REPORT MODAL */}
        {showIecCheckModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md flex flex-col p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span> <span>IEC 61439 Audit</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kiểm tra thiết kế theo tiêu chuẩn quốc tế.</p>
                </div>
                <button onClick={() => setShowIecCheckModal(false)} className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded hover:bg-slate-100">✕</button>
              </div>
              <div className="space-y-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-[55vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Điện áp cách điện định mức Ui</span>
                  <span className="text-emerald-600 font-mono font-bold">1000V AC</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Khả năng chịu ngắn mạch Icw</span>
                  <span className="text-emerald-600 font-mono font-bold">50 kA / 1s</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Độ tăng nhiệt busbar đồng</span>
                  <span className="text-emerald-600 font-mono font-bold">42.1°C (≤ 65°C)</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Khoảng cách cách điện (pha-đất)</span>
                  <span className="text-emerald-600 font-mono font-bold">25.2 mm (≥ 14 mm)</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Kiểu thử nghiệm (TTA/PTTA)</span>
                  <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ TTA Full</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-700">Chứng nhận CE / UKCA</span>
                  <span className="text-emerald-600 font-mono font-bold">✓ PASS</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button onClick={() => setShowIecCheckModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg">Đóng</button>
                <button onClick={() => setShowIecCheckModal(false)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow">
                  ✓ OK Đạt chuẩn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW DRAWING MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[92vh] overflow-y-auto flex flex-col p-5 sm:p-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <span className="text-blue-600 text-lg">📐</span>
                  <span>Bản vẽ mới</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Chọn thông số tủ cơ bản để bắt đầu thiết kế.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold p-1 rounded hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form inputs */}
            <div className="space-y-4 text-xs">
              
              {/* 1. Tên tủ input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên tủ
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase font-mono">
                    # {formName || "TỦ"}
                  </span>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-slate-200 text-slate-800 pl-16 pr-3.5 py-2 rounded-lg font-bold bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 transition-colors"
                  />
                </div>
              </div>

              {/* 2. Dimensions Inputs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Rộng (mm)
                  </label>
                  <input
                    type="number"
                    value={formWidth}
                    onChange={(e) => setFormWidth(Number(e.target.value))}
                    className="w-full border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Cao (mm)
                  </label>
                  <input
                    type="number"
                    value={formHeight}
                    onChange={(e) => setFormHeight(Number(e.target.value))}
                    className="w-full border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Sâu (mm)
                  </label>
                  <input
                    type="number"
                    value={formDepth}
                    onChange={(e) => setFormDepth(Number(e.target.value))}
                    className="w-full border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-bold bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors text-center"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer buttons */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateDrawing}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow hover:shadow-md transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>✓</span>
                <span>Tạo bản vẽ</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🧊 INTERACTIVE 3D CABINET PREVIEW MODAL OVERLAY */}
      {show3dModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col z-50 overflow-hidden font-sans select-none animate-fadeIn">
          {/* 3D Modal Header */}
          <div className="h-13 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold text-base">
                🧊
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center space-x-2">
                  <span>MÔ HÌNH TỦ ĐIỆN 3D TƯƠNG TÁC</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    IEC 61439 3D CAD
                  </span>
                </h3>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  Kéo chuột để xoay 3D 360° | Mở cánh tủ | Click thiết bị xem thông số
                </p>
              </div>
            </div>

            {/* 3D Presets & Toolbar Controls */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-800 border border-slate-700 p-0.5 rounded-lg space-x-0.5 text-xs">
                <button
                  onClick={() => setPresetView("front")}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                    presetView === "front" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Góc nhìn thẳng 3D"
                >
                  🔄 Mặt trước (Front)
                </button>
                <button
                  onClick={() => setPresetView("iso")}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                    presetView === "iso" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Góc nhìn Isometric 3D"
                >
                  📦 Phối cảnh (Iso)
                </button>
                <button
                  onClick={() => { setRotX(0); setRotY(90); }}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                    rotY === 90 ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Góc nhìn hông 3D"
                >
                  📐 Mặt hông (Side)
                </button>
                <button
                  onClick={() => { setRotX(-75); setRotY(0); }}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors cursor-pointer ${
                    rotX === -75 ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Góc nhìn đỉnh 3D"
                >
                  🔝 Mặt nóc (Top)
                </button>
              </div>

              {/* Angle indicator */}
              <div className="font-mono text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-1 rounded-md font-bold shrink-0">
                X: {Math.round(rotX)}° Y: {Math.round(rotY)}°
              </div>

              {/* 3D Zoom Controls */}
              <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 p-0.5 rounded-lg text-slate-300 text-xs">
                <button
                  onClick={() => setZoom3d((z) => Math.max(0.4, z - 0.15))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-[10px] px-1 font-bold min-w-[34px] text-center text-white">
                  {Math.round(zoom3d * 100)}%
                </span>
                <button
                  onClick={() => setZoom3d((z) => Math.min(2.5, z + 0.15))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-slate-700 rounded font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Close 3D Modal Button */}
              <button
                onClick={() => { setShow3dModal(false); setSelected3dDevice(null); }}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 hover:bg-rose-600 hover:border-rose-500 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                title="Đóng xem 3D"
              >
                ✕
              </button>
            </div>
          </div>

          {/* REAL THREE.JS WEBGL 3D CANVAS & VIEWPORT AREA */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
            <ThreeCabinetViewer
              cabinetParams={cabinetParams}
              devices={activeDevices as any}
              activeLayout={activeLayout}
              isDoorOpen={isDoorOpen}
              isInnerOpen={isInnerOpen}
              isExploded={isExploded}
              showFrame3d={showFrame3d}
              showBusbar3d={showBusbar3d}
              showDevices3d={showDevices3d}
              presetView={presetView}
              onSelectDevice={(dev) => setSelected3dDevice(dev as any)}
            />

            {/* LIVE 3D DEVICE SPECS POPUP CARD (WHEN CLICKED IN 3D) */}
            {selected3dDevice && (
              <div className="absolute right-6 top-6 bg-slate-900 border border-slate-700 text-slate-200 rounded-2xl shadow-2xl p-4 w-72 z-40 animate-fadeIn font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">⚡</span>
                    <span className="font-extrabold text-white text-xs uppercase tracking-wide">
                      THÔNG SỐ THIẾT BỊ 3D
                    </span>
                  </div>
                  <button
                    onClick={() => setSelected3dDevice(null)}
                    className="text-slate-400 hover:text-white font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Mã mạch:</span>
                    <span className="font-mono font-extrabold text-indigo-400">{selected3dDevice.circuit}</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Loại thiết bị:</span>
                    <span className="font-bold text-emerald-400">{selected3dDevice.type} {selected3dDevice.pole}P</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Dòng định mức (In):</span>
                    <span className="font-mono font-black text-amber-400">{selected3dDevice.current} A</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Hãng sản xuất:</span>
                    <span className="font-bold text-blue-400">{selected3dDevice.brand || "LS Electric"}</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Model:</span>
                    <span className="font-mono text-slate-200">{selected3dDevice.model}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D MODAL BOTTOM ACTION BAR */}
          <div className="h-14 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
            {/* Door & View Assembly Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Assembled vs Exploded Mode */}
              <button
                onClick={() => setIsExploded(!isExploded)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                  isExploded
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
                title="Chuyển chế độ lắp ghép 1 khối hoặc tách rời từng lớp 3D"
              >
                <span>{isExploded ? "💥" : "📦"}</span>
                <span>{isExploded ? "Chế độ: Tách Lớp 3D" : "Chế độ: Tủ Ghép Khối"}</span>
              </button>

              <button
                onClick={() => setIsDoorOpen(!isDoorOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                  isDoorOpen
                    ? "bg-amber-600 text-white border-amber-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                <span>🚪</span>
                <span>{isDoorOpen ? "Đóng cánh tủ ngoài" : "Mở cánh tủ ngoài (110°)"}</span>
              </button>

              <button
                onClick={() => setIsInnerOpen(!isInnerOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                  isInnerOpen
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                <span>🟢</span>
                <span>{isInnerOpen ? "Đóng tấm che bảo vệ" : "Mở tấm che bảo vệ"}</span>
              </button>
            </div>

            {/* Layer Visibility Checkboxes */}
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-300">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFrame3d}
                  onChange={(e) => setShowFrame3d(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Khung tủ 3D</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBusbar3d}
                  onChange={(e) => setShowBusbar3d(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Thanh cái đồng (Busbars)</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDevices3d}
                  onChange={(e) => setShowDevices3d(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Thiết bị 3D</span>
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
