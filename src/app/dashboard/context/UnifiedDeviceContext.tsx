"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ============================================================
// UNIFIED DEVICE TYPE — works with both SLD AI and DWG WASM
// ============================================================
export interface UnifiedDevice {
  id: string;
  type: string;           // ACB, MCCB, MCB, CONTACTOR, FUSE, TIMER, etc.
  name: string;           // "MCCB 3P 250A 36kA"
  circuit: string;        // "Q02 - Outgoing 1"
  brand: string;          // "Schneider", "LS", "Chint"
  model: string;          // "C25N33D250"
  pole: number;           // 1, 2, 3, 4
  current: number;        // Rated current in A
  icu?: number;           // Breaking capacity kA
  leakage?: number;       // Leakage current mA
  cable?: string;         // Cable spec
  power?: number;         // Power kW
  layer?: string;         // CAD layer name
  status?: string;        // "OK", "WARNING"
  matchedModel?: any;     // Catalog match from backend
  source: "sld" | "dwg" | "manual";
}

export interface EngineAnalysis {
  busbar?: {
    material: string;
    dimensions: string;
    crossSection: number;
    weightKg: number;
  };
  coordination?: {
    passed: boolean;
    warnings: string[];
    errors: string[];
    summary: string;
  };
  thermal?: {
    totalHeatW: number;
    tempRiseCelsius: number;
    forcedVentilationRequired: boolean;
    fanCfm?: number;
    recommendation: string;
  };
  doorInstruments?: any[];
  catalogMatches?: Record<string, any>;
}

export interface ProjectMeta {
  name: string;
  version: number;
  fileType: "image" | "pdf" | "dwg" | "dxf" | "manual";
  projectId?: number;
  versionId?: number;
}

// ============================================================
// CONTEXT
// ============================================================
interface UnifiedDeviceContextValue {
  // Data
  devices: UnifiedDevice[];
  source: "sld" | "dwg" | "manual" | null;
  engineAnalysis: EngineAnalysis | null;
  svgContent: string;
  diagramImageUrl: string | null;
  projectMeta: ProjectMeta | null;

  // Actions
  setDevicesFromSLD: (devices: any[], meta?: Partial<ProjectMeta>) => void;
  setDevicesFromDWG: (devices: any[], meta?: Partial<ProjectMeta>) => void;
  setDevicesManual: (devices: UnifiedDevice[]) => void;
  updateDevice: (index: number, field: string, value: any) => void;
  removeDevice: (index: number) => void;
  addDevice: (device: Partial<UnifiedDevice>) => void;
  setEngineAnalysis: (analysis: EngineAnalysis) => void;
  setSvgContent: (svg: string) => void;
  setDiagramImageUrl: (url: string | null) => void;
  setProjectMeta: (meta: ProjectMeta) => void;
  clearAll: () => void;
}

const UnifiedDeviceContext = createContext<UnifiedDeviceContextValue | null>(null);

// ============================================================
// PROVIDER
// ============================================================
export function UnifiedDeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<UnifiedDevice[]>([]);
  const [source, setSource] = useState<"sld" | "dwg" | "manual" | null>(null);
  const [engineAnalysis, setEngineAnalysisState] = useState<EngineAnalysis | null>(null);
  const [svgContent, setSvgContentState] = useState("");
  const [diagramImageUrl, setDiagramImageUrlState] = useState<string | null>(null);
  const [projectMeta, setProjectMetaState] = useState<ProjectMeta | null>(null);

  // Normalize SLD AI devices into unified format
  const setDevicesFromSLD = useCallback((rawDevices: any[], meta?: Partial<ProjectMeta>) => {
    const unified: UnifiedDevice[] = (rawDevices || []).map((d: any, i: number) => ({
      id: d.id || `sld_${i + 1}`,
      type: (d.type || d.device_type || "UNKNOWN").toUpperCase(),
      name: d.name || d.circuit_name || d.description || "",
      circuit: d.circuit || d.circuit_name || `Q${i + 1}`,
      brand: d.brand || d.manufacturer || "LS",
      model: d.model || d.matched_model || "",
      pole: parseInt(d.pole || d.poles || "3", 10),
      current: parseInt(d.current || d.rating || d.in_a || "0", 10),
      icu: d.icu ? parseFloat(d.icu) : undefined,
      leakage: d.leakage ? parseInt(d.leakage, 10) : undefined,
      cable: d.cable || "",
      power: d.power ? parseFloat(d.power) : undefined,
      layer: d.layer || "",
      status: d.status || "OK",
      matchedModel: d.matchedModel || d.matched_model_data || null,
      source: "sld" as const,
    }));
    setDevices(unified);
    setSource("sld");
    if (meta) setProjectMetaState(prev => ({ ...prev, ...meta, fileType: meta.fileType || "image" } as ProjectMeta));
  }, []);

  // Normalize DWG WASM devices into unified format
  const setDevicesFromDWG = useCallback((rawDevices: any[], meta?: Partial<ProjectMeta>) => {
    const unified: UnifiedDevice[] = (rawDevices || []).map((d: any, i: number) => ({
      id: d.id || `dwg_${i + 1}`,
      type: (d.type || "UNKNOWN").toUpperCase(),
      name: d.name || d.text || "",
      circuit: d.circuit || `Q${i + 1}`,
      brand: d.brand || "LS",
      model: d.model || "",
      pole: d.pole || 3,
      current: d.current || 0,
      icu: d.icu,
      leakage: d.leakage,
      cable: d.cable || "",
      power: d.power,
      layer: d.layer || "",
      status: "OK",
      matchedModel: null,
      source: "dwg" as const,
    }));
    setDevices(unified);
    setSource("dwg");
    if (meta) setProjectMetaState(prev => ({ ...prev, ...meta, fileType: meta.fileType || "dwg" } as ProjectMeta));
  }, []);

  const setDevicesManual = useCallback((devs: UnifiedDevice[]) => {
    setDevices(devs);
    setSource("manual");
  }, []);

  const updateDevice = useCallback((index: number, field: string, value: any) => {
    setDevices(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  }, []);

  const removeDevice = useCallback((index: number) => {
    setDevices(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addDevice = useCallback((partial: Partial<UnifiedDevice>) => {
    const newDev: UnifiedDevice = {
      id: `manual_${Date.now()}`,
      type: "MCB",
      name: "",
      circuit: "",
      brand: "LS",
      model: "",
      pole: 3,
      current: 0,
      source: "manual",
      ...partial,
    };
    setDevices(prev => [...prev, newDev]);
  }, []);

  const setEngineAnalysis = useCallback((analysis: EngineAnalysis) => {
    setEngineAnalysisState(analysis);
  }, []);

  const setSvgContent = useCallback((svg: string) => {
    setSvgContentState(svg);
  }, []);

  const setDiagramImageUrl = useCallback((url: string | null) => {
    setDiagramImageUrlState(url);
  }, []);

  const setProjectMeta = useCallback((meta: ProjectMeta) => {
    setProjectMetaState(meta);
  }, []);

  const clearAll = useCallback(() => {
    setDevices([]);
    setSource(null);
    setEngineAnalysisState(null);
    setSvgContentState("");
    setDiagramImageUrlState(null);
    setProjectMetaState(null);
  }, []);

  return (
    <UnifiedDeviceContext.Provider value={{
      devices, source, engineAnalysis, svgContent, diagramImageUrl, projectMeta,
      setDevicesFromSLD, setDevicesFromDWG, setDevicesManual,
      updateDevice, removeDevice, addDevice,
      setEngineAnalysis, setSvgContent, setDiagramImageUrl, setProjectMeta, clearAll,
    }}>
      {children}
    </UnifiedDeviceContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================
export function useUnifiedDevices() {
  const ctx = useContext(UnifiedDeviceContext);
  if (!ctx) throw new Error("useUnifiedDevices must be used within UnifiedDeviceProvider");
  return ctx;
}
