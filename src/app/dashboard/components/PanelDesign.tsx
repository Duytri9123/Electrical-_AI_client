import React, { useState } from "react";

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

export default function PanelDesign({ devices, layoutData, graphData }: PanelDesignProps) {
  const [viewMode, setViewMode] = useState<"physical" | "schematic">("physical");

  // Fallback layout data if missing from backend
  const activeLayout = layoutData || {
    panel_width: 800,
    panel_height: 1000,
    rails: [
      { id: "rail_1", y: 180, devices: devices.filter(d => (d.level ?? 1) === 0).map(d => d.id) },
      { id: "rail_2", y: 450, devices: devices.filter(d => (d.level ?? 1) === 1 && d.type === "MCCB").map(d => d.id) },
      { id: "rail_3", y: 720, devices: devices.filter(d => (d.level ?? 1) === 1 && d.type !== "MCCB").map(d => d.id) }
    ]
  };

  const getDeviceColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "ACB": return "border-red-500 bg-red-50/80 text-red-700";
      case "MCCB": return "border-amber-500 bg-amber-50/80 text-amber-800";
      case "MCB": return "border-blue-500 bg-blue-50/80 text-blue-700";
      case "RCBO": return "border-emerald-500 bg-emerald-50/80 text-emerald-700";
      default: return "border-slate-400 bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col flex-1 shadow-sm min-h-[500px]">
      {/* Control bar */}
      <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800">Bản vẽ Tủ điện & Sơ đồ nguyên lý</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">AI GENERATED</span>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setViewMode("physical")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
              viewMode === "physical"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-250"
            }`}
          >
            📐 Bố trí Thiết bị (Layout)
          </button>
          <button
            onClick={() => setViewMode("schematic")}
            className={`px-3 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
              viewMode === "schematic"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-250"
            }`}
          >
            ⚡ Sơ đồ Nguyên lý (SLD)
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center bg-slate-50 overflow-auto">
        {viewMode === "physical" ? (
          /* PHYSICAL CABINET DRAWING */
          <div className="relative bg-white border border-slate-350 shadow-md rounded-xl p-8 max-w-[500px] w-full" style={{ borderColor: '#cbd5e1' }}>
            {/* Cabinet frame */}
            <div className="border-[6px] border-slate-700 rounded-lg p-4 bg-slate-100 min-h-[550px] relative shadow-inner">
              {/* Cabinet Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-slate-900"></div>
                ))}
              </div>

              {/* Render Rails */}
              <div className="space-y-24 py-8">
                {activeLayout.rails.map((rail, idx) => {
                  const railDevices = rail.devices
                    .map(id => devices.find(d => d.id === id))
                    .filter((d): d is Device => !!d);

                  return (
                    <div key={rail.id} className="relative w-full flex flex-col items-center">
                      {/* Metallic Rail Bar */}
                      <div className="w-full h-5 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-400 border-y border-slate-500 rounded-sm shadow flex items-center justify-between px-4 absolute top-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      </div>

                      {/* Rail Label */}
                      <span className="absolute -top-6 left-1 text-[9px] font-extrabold text-slate-400 tracking-wider">
                        DIN RAIL {idx + 1}
                      </span>

                      {/* Devices on Rail */}
                      <div className="relative z-10 flex space-x-3 items-center justify-center px-6 w-full">
                        {railDevices.length === 0 ? (
                          <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 border-dashed py-1 px-3 rounded">
                            Trống
                          </div>
                        ) : (
                          railDevices.map(dev => {
                            // Calculate width based on poles
                            const widthClass = dev.pole === 3 ? "w-24" : dev.pole === 2 ? "w-16" : "w-10";

                            return (
                              <div
                                key={dev.id}
                                className={`h-20 ${widthClass} border-2 rounded-md shadow-sm flex flex-col justify-between p-1.5 text-center transition-transform hover:scale-105 ${getDeviceColor(
                                  dev.type
                                )}`}
                              >
                                {/* Device Brand/Name */}
                                <div className="text-[8px] font-bold uppercase tracking-wider truncate leading-tight">
                                  {dev.brand || "LS"}
                                </div>

                                {/* Device Type & Pole */}
                                <div className="font-mono text-[9px] font-extrabold my-1 leading-none">
                                  {dev.type} <span className="opacity-60">{dev.pole}P</span>
                                </div>

                                {/* Current & Model Code */}
                                <div className="mt-auto">
                                  <div className="text-[9px] font-bold text-slate-900 bg-white/90 rounded py-0.5 border border-slate-200/50 shadow-sm leading-none">
                                    {dev.current}A
                                  </div>
                                  <div className="text-[6.5px] font-mono text-slate-400 mt-1 truncate max-w-full">
                                    {dev.circuit}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Cabinet Base legs */}
            <div className="flex justify-between px-10 mt-1">
              <div className="w-6 h-3 bg-slate-700 rounded-b shadow"></div>
              <div className="w-6 h-3 bg-slate-700 rounded-b shadow"></div>
            </div>
          </div>
        ) : (
          /* SINGLE LINE SCHEMATIC DIAGRAM */
          <div className="relative bg-white border border-slate-350 shadow-md rounded-xl p-8 max-w-[650px] w-full min-h-[500px] flex flex-col" style={{ borderColor: '#cbd5e1' }}>
            <div className="flex-1 flex flex-col items-center py-6 relative">
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:15px_15px] opacity-60"></div>
              
              {/* Power Source */}
              <div className="relative z-10 flex flex-col items-center mb-10">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  G
                </div>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mt-1">3P Grid Input</span>
              </div>

              {/* Main vertical bus line */}
              <div className="w-1 bg-slate-800 h-10 relative"></div>

              {/* Main Breaker */}
              {devices.filter(d => (d.level ?? 1) === 0).map(mainDev => (
                <div key={mainDev.id} className="relative z-10 flex flex-col items-center my-1 bg-white border-2 border-amber-500 text-amber-800 font-bold px-3 py-1.5 rounded shadow-sm text-center min-w-[120px]">
                  <span className="text-[8px] text-slate-400 font-medium tracking-wide leading-none">{mainDev.circuit}</span>
                  <span className="text-xs font-extrabold my-0.5">{mainDev.type} {mainDev.pole}P</span>
                  <span className="text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">{mainDev.current}A</span>
                </div>
              ))}

              <div className="w-1 bg-slate-800 h-12 relative"></div>

              {/* Main Horizontal Busbar */}
              <div className="w-11/12 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border border-slate-700 rounded shadow relative">
                <span className="absolute -top-4 right-1 text-[8px] font-extrabold text-amber-600 uppercase tracking-wider">Main Copper Busbar 630A</span>
              </div>

              {/* Branch feeders (8 columns) */}
              <div className="w-full flex justify-between px-2 pt-1 mt-0">
                {devices.filter(d => (d.level ?? 1) > 0).map((branchDev, bIdx) => (
                  <div key={branchDev.id} className="flex flex-col items-center flex-1 min-w-[50px] relative">
                    {/* Connection line from busbar */}
                    <div className="w-0.5 bg-slate-800 h-8"></div>
                    
                    {/* Breaker symbol */}
                    <div className="relative z-10 bg-white border border-slate-400 text-slate-700 font-semibold px-1 py-2 rounded shadow-sm text-center min-w-[54px] hover:border-blue-500 transition-colors">
                      <div className="text-[7px] text-slate-400 leading-none">{branchDev.circuit}</div>
                      <div className="text-[9px] font-extrabold my-0.5 leading-none">{branchDev.type}</div>
                      <div className="text-[8.5px] font-bold text-slate-900 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/50 mt-1 leading-none">{branchDev.current}A</div>
                    </div>

                    {/* Feed line to load */}
                    <div className="w-0.5 bg-slate-800 h-10"></div>

                    {/* Load Terminals */}
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700 flex items-center justify-center text-[7px] text-white font-extrabold shadow-sm">
                      L
                    </div>
                    <span className="text-[7.5px] text-slate-400 font-medium mt-1 uppercase tracking-wide truncate max-w-full">
                      Load {bIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
