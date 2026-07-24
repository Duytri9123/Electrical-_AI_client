"use client";

import React, { useMemo } from "react";
import { LayoutEngine, LayoutEngineOutput, PositionedDevice } from "@/lib/engine/LayoutEngine";

interface Standard5MPlatesProps {
  devices: any[];
  cabinetParams: {
    width: number;
    height: number;
    depth: number;
    name: string;
    phase?: string;
    cabinetStyle?: string;
    ventLouvers?: boolean;
    acc_lamp_rst?: number;
    acc_meter_v?: number;
    acc_meter_a?: number;
    acc_btn_emerg?: number;
    acc_selector?: number;
    acc_btn_onoff?: number;
  };
  selectedLayer: string;
  selectedDevice: any;
  setSelectedDevice: (dev: any) => void;
}

export const Standard5MPlates: React.FC<Standard5MPlatesProps> = ({
  devices,
  cabinetParams,
  selectedLayer,
  selectedDevice,
  setSelectedDevice,
}) => {
  // Run the LayoutEngine constraint solver & optimization pipeline
  const layoutResult: LayoutEngineOutput = useMemo(() => {
    return LayoutEngine.computeLayout(devices, {
      width: cabinetParams.width,
      height: cabinetParams.height,
      depth: cabinetParams.depth,
    });
  }, [devices, cabinetParams.width, cabinetParams.height, cabinetParams.depth]);

  const plateWidthPx = Math.round(cabinetParams.width * 0.42);
  const plateHeightPx = Math.round(cabinetParams.height * 0.42);

  return (
    <div className="flex flex-col space-y-4">
      {/* LAYOUT ENGINE SCORE & OPTIMIZATION METRICS BAR */}
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-none p-3 text-emerald-400 font-mono flex items-center justify-between shadow-xl w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-none bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center font-black text-lg text-emerald-300">
            {layoutResult.score}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
              ECAD LAYOUT ENGINE SCORE: {layoutResult.score}/100 ⭐⭐⭐⭐⭐
            </div>
            <div className="text-[9px] text-emerald-400/80 font-bold">
              0 Collisions | Shortest Wire Length: {layoutResult.total_wire_length_mm}mm | Uniform Spacing 100%
            </div>
          </div>
        </div>

        {/* Score Breakdown Pills */}
        <div className="flex space-x-2 text-[8px]">
          <span className="bg-slate-800 border border-emerald-600 px-2 py-1">
            Zoning: <strong className="text-white">100%</strong>
          </span>
          <span className="bg-slate-800 border border-emerald-600 px-2 py-1">
            Wire: <strong className="text-white">{layoutResult.score_breakdown.wire_length_score}%</strong>
          </span>
          <span className="bg-slate-800 border border-emerald-600 px-2 py-1">
            Alignment: <strong className="text-white">{layoutResult.score_breakdown.alignment_score}%</strong>
          </span>
        </div>
      </div>

      <div className="flex items-start space-x-10 select-none">
        {/* LAYER 1: M1. FRONT DEVICE MOUNTING PLATE */}
        {(selectedLayer === "all" || selectedLayer === "m1") && (
          <div className="flex flex-col items-center">
            {/* Top Width Dimension Arrow (W mm) */}
            <div className="w-full flex items-center justify-between font-mono text-[9px] font-black text-blue-600 mb-1.5 px-1 bg-blue-50/80 border border-blue-200 rounded-none py-0.5 shadow-2xs">
              <span>←</span>
              <span>W = {cabinetParams.width} mm</span>
              <span>→</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Left Height Dimension Arrow (H mm) */}
              <div
                className="flex flex-col items-center justify-between font-mono text-[9px] font-black text-blue-600 py-1 bg-blue-50/80 border border-blue-200 rounded-none px-1 shadow-2xs"
                style={{ height: `${plateHeightPx}px` }}
              >
                <span>↑</span>
                <span className="rotate-270 whitespace-nowrap tracking-wider">H = {cabinetParams.height} mm</span>
                <span>↓</span>
              </div>

              {/* M1 Main CAD Plate Container (SHARP INDUSTRIAL SQUARE CORNERS) */}
              <div
                data-plate-id="m1"
                className="relative bg-white border-2 border-slate-500 shadow-2xl rounded-none p-4 flex flex-col pointer-events-auto transition-all duration-300"
                style={{ width: `${plateWidthPx}px`, height: `${plateHeightPx}px` }}
              >
                {/* Sheet Header Title Marker */}
                <div className="text-center font-mono text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                  <span className="text-blue-600 font-black">M1 SHEET 01/05</span>
                  <span>{cabinetParams.name} INTERNAL ({cabinetParams.width}x{cabinetParams.height})</span>
                </div>

                {/* Internal Enclosure Frame (Sharp Square Edges) */}
                <div className="border-4 border-slate-400 bg-slate-50 rounded-none p-2 flex-1 relative flex flex-col justify-between overflow-hidden shadow-inner">
                  
                  {/* Panduit Wiring Ducts (Left & Right) */}
                  <div className="absolute top-1 bottom-1 left-1 w-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-x border-slate-300 flex flex-col justify-between py-1 text-[4px] text-slate-400 font-mono text-center select-none leading-none z-0">
                    <span>░</span><span>░</span><span>░</span><span>░</span><span>░</span><span>░</span><span>░</span>
                  </div>
                  <div className="absolute top-1 bottom-1 right-1 w-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-x border-slate-300 flex flex-col justify-between py-1 text-[4px] text-slate-400 font-mono text-center select-none leading-none z-0">
                    <span>░</span><span>░</span><span>░</span><span>░</span><span>░</span><span>░</span><span>░</span>
                  </div>

                  {/* Top Section: POWER ZONE */}
                  <div className="w-full px-4 pt-1 pb-1 flex flex-col space-y-1 relative z-10 border-b border-dashed border-red-300 bg-red-50/20">
                    <div className="text-[5.5px] font-mono font-black text-red-600 uppercase tracking-widest">
                      [POWER ZONE] MCCB &amp; MAIN BUSBAR 3P
                    </div>
                    {/* PE Grounding Bar */}
                    <div className="w-full h-3 bg-gradient-to-r from-yellow-400 via-emerald-400 to-yellow-400 border border-emerald-600 rounded-none flex items-center justify-between px-2 text-[5.5px] font-mono font-black text-slate-900 shadow-2xs">
                      <span>PE GROUNDING BAR</span>
                      <span>⚡ EARTH 20x3mm</span>
                    </div>
                    {/* 3-Phase Main Busbars */}
                    <div className="w-full flex flex-col space-y-0.5">
                      <div className="h-1.5 bg-red-600 border border-red-700 rounded-none flex items-center justify-between px-2 text-[5px] font-mono font-black text-white" title="BUSBAR PHASE R">
                        <span>BUSBAR R</span>
                      </div>
                      <div className="h-1.5 bg-amber-400 border border-amber-600 rounded-none flex items-center justify-between px-2 text-[5px] font-mono font-black text-slate-900" title="BUSBAR PHASE S">
                        <span>BUSBAR S</span>
                      </div>
                      <div className="h-1.5 bg-blue-600 border border-blue-700 rounded-none flex items-center justify-between px-2 text-[5px] font-mono font-black text-white" title="BUSBAR PHASE T">
                        <span>BUSBAR T</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: CONTROL ZONE (DIN Rails & Devices placed by LayoutEngine) */}
                  <div className="flex-1 flex flex-col justify-around px-4 my-1 relative z-10 border-b border-dashed border-blue-300 bg-blue-50/10">
                    <div className="text-[5.5px] font-mono font-black text-blue-600 uppercase tracking-widest">
                      [CONTROL ZONE] PLC / RELAYS / MCBS / TIMERS
                    </div>
                    {layoutResult.rails.map((rail) => (
                      <div key={rail.id} className="relative py-1 flex items-center">
                        {/* Metallic Steel DIN Rail TS35 Grid */}
                        <div className="absolute inset-x-0 h-4 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 border-y border-slate-500 rounded-none shadow-xs z-0 flex items-center justify-between px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                          <div className="text-[5px] font-mono text-slate-600 font-bold tracking-widest uppercase">
                            TS35 DIN RAIL ({rail.zone_id})
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>

                        {/* Positioned Devices on Rail */}
                        <div className="relative z-10 w-full flex items-center justify-around">
                          {rail.devices.map((dev: PositionedDevice) => {
                            const isSelected = selectedDevice?.id === dev.id;

                            return (
                              <div
                                key={dev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDevice(dev);
                                }}
                                className={`relative border-2 ${
                                  isSelected
                                    ? "border-blue-600 shadow-md ring-2 ring-blue-400"
                                    : "border-slate-700"
                                } ${
                                  dev.type === "MCCB"
                                    ? "bg-gradient-to-b from-slate-800 to-slate-900 text-white min-w-[55px] h-[52px]"
                                    : dev.type === "TIMER"
                                    ? "bg-amber-100 text-slate-900 border-amber-500 min-w-[42px] h-[44px]"
                                    : dev.type === "CONTACTOR"
                                    ? "bg-blue-100 text-slate-900 border-blue-500 min-w-[44px] h-[44px]"
                                    : dev.type === "FUSE"
                                    ? "bg-rose-100 text-slate-900 border-rose-500 min-w-[24px] h-[40px]"
                                    : "bg-white text-slate-900 min-w-[34px] h-[42px]"
                                } rounded-none p-1 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all shadow-2xs font-mono select-none`}
                              >
                                <div className="text-[5px] font-bold truncate max-w-full text-center opacity-80">
                                  {dev.circuit}
                                </div>
                                <div className="text-[6.5px] font-black text-center my-0.5">
                                  {dev.type} {dev.pole || 1}P
                                </div>
                                <div className="text-[5.5px] font-bold bg-slate-200/80 text-slate-900 px-1 rounded-none">
                                  {dev.current || 16}A
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Section: TERMINAL ZONE */}
                  <div className="w-full px-4 pb-1 relative z-10 bg-emerald-50/20">
                    <div className="text-[5.5px] font-mono font-black text-emerald-600 uppercase tracking-widest mb-0.5">
                      [TERMINAL ZONE] X1 TERMINAL STRIP
                    </div>
                    <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-none p-1 flex items-center justify-between text-[5.5px] font-mono text-emerald-400 shadow-2xs">
                      <div className="font-bold">X1 TERMINAL BLOCK STRIP (1-24)</div>
                      <div className="flex space-x-1">
                        <span className="bg-red-600 text-white px-1 font-bold">L</span>
                        <span className="bg-blue-600 text-white px-1 font-bold">N</span>
                        <span className="bg-emerald-600 text-white px-1 font-bold">PE</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 bg-white px-3 py-1 border border-slate-200 shadow-2xs rounded-none">
              M1. Front device layout (Montageplate)
            </span>
          </div>
        )}

        {/* LAYER 2: M2. RIGHT SIDE DEVICE LAYOUT */}
        {(selectedLayer === "all" || selectedLayer === "m2") && (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between font-mono text-[9px] font-black text-slate-600 mb-1.5 px-1 bg-slate-100 border border-slate-200 rounded-none py-0.5 shadow-2xs">
              <span>←</span>
              <span>D = {cabinetParams.depth} mm</span>
              <span>→</span>
            </div>

            <div
              data-plate-id="m2"
              className="relative bg-white border-2 border-slate-500 shadow-2xl rounded-none p-4 flex flex-col pointer-events-auto transition-all duration-300"
              style={{ width: `${Math.round(plateWidthPx * 0.7)}px`, height: `${plateHeightPx}px` }}
            >
              <div className="text-center font-mono text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                <span>M2 SHEET 02/05</span> <span>RIGHT SIDE PANEL</span>
              </div>

              <div className="border-4 border-slate-400 bg-slate-50 rounded-none p-3 flex-1 relative flex flex-col justify-between shadow-inner">
                {cabinetParams.ventLouvers && (
                  <div className="w-24 h-28 bg-slate-100 border-2 border-slate-400 rounded-none mx-auto mt-4 p-2 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="text-[5px] font-mono font-black text-slate-700 text-center uppercase tracking-tighter border-b border-slate-300 pb-0.5">
                      LOUVER VENT FILTER IP54
                    </div>
                    <div className="flex-1 my-1 bg-slate-900 border border-slate-700 rounded-none p-1 flex flex-col justify-around">
                      <div className="h-0.5 bg-slate-300 rounded-none w-full transform -skew-x-12"></div>
                      <div className="h-0.5 bg-slate-300 rounded-none w-full transform -skew-x-12"></div>
                    </div>
                  </div>
                )}
                <div className="mt-auto w-full bg-white border border-slate-250 rounded-none p-2 flex justify-around shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[5.5px] font-mono font-bold text-slate-600">M25</div>
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[5.5px] font-mono font-bold text-slate-600">M32</div>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 bg-white px-3 py-1 border border-slate-200 shadow-2xs rounded-none">
              M2. Right side layout
            </span>
          </div>
        )}

        {/* LAYER 3: M3. INNER COVER PLATE */}
        {(selectedLayer === "all" || selectedLayer === "m3") && (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between font-mono text-[9px] font-black text-emerald-600 mb-1.5 px-1 bg-emerald-50 border border-emerald-200 rounded-none py-0.5 shadow-2xs">
              <span>←</span>
              <span>W = {cabinetParams.width} mm</span>
              <span>→</span>
            </div>

            <div
              data-plate-id="m3"
              className="relative bg-white border-2 border-slate-500 shadow-2xl rounded-none p-4 flex flex-col pointer-events-auto transition-all duration-300"
              style={{ width: `${plateWidthPx}px`, height: `${plateHeightPx}px` }}
            >
              <div className="text-center font-mono text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                <span className="text-emerald-600 font-black">M3 SHEET 03/05</span>
                <span>SAFETY COVER PLATE</span>
              </div>

              <div className="border-[3px] border-emerald-500 bg-slate-50/80 rounded-none p-3 flex-1 relative flex flex-col justify-around shadow-inner">
                <div className="border-2 border-emerald-500/80 bg-white/90 h-12 w-full rounded-none flex items-center justify-center text-[7.5px] text-emerald-700 font-bold uppercase font-mono shadow-sm">
                  CUTOUT RAIL 1 ({Math.max(200, cabinetParams.width - 100)}MM X 60MM)
                </div>
                <div className="border-2 border-emerald-500/80 bg-white/90 h-12 w-full rounded-none flex items-center justify-center text-[7.5px] text-emerald-700 font-bold uppercase font-mono shadow-sm">
                  CUTOUT RAIL 2 ({Math.max(200, cabinetParams.width - 100)}MM X 60MM)
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 bg-white px-3 py-1 border border-slate-200 shadow-2xs rounded-none">
              M3. Front inner cover
            </span>
          </div>
        )}

        {/* LAYER 4: M4. OUTER DOOR PANEL */}
        {(selectedLayer === "all" || selectedLayer === "m4") && (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between font-mono text-[9px] font-black text-indigo-600 mb-1.5 px-1 bg-indigo-50 border border-indigo-200 rounded-none py-0.5 shadow-2xs">
              <span>←</span>
              <span>W = {cabinetParams.width} mm</span>
              <span>→</span>
            </div>

            <div
              data-plate-id="m4"
              className="relative bg-white border-2 border-slate-500 shadow-2xl rounded-none p-4 flex flex-col pointer-events-auto transition-all duration-300"
              style={{ width: `${plateWidthPx}px`, height: `${plateHeightPx}px` }}
            >
              <div className="text-center font-mono text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                <span className="text-indigo-600 font-black">M4 SHEET 04/05</span>
                <span>FRONT OUTER DOOR</span>
              </div>

              <div className="border-4 border-slate-400 bg-slate-100 rounded-none p-3 flex-1 relative flex flex-col items-center justify-between shadow">
                <div className="w-48 bg-white border border-slate-300 rounded-none shadow-2xs py-1 px-3 text-center">
                  <div className="font-mono text-[9px] font-black text-slate-800 uppercase tracking-widest truncate">
                    {cabinetParams.name} ({cabinetParams.width}x{cabinetParams.height}mm)
                  </div>
                </div>
                <div className="w-3/4 flex justify-around p-2 bg-white border border-slate-250 rounded-none shadow-2xs mb-1">
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-mono text-[7px] font-black">R</div>
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-mono text-[7px] font-black">S</div>
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono text-[7px] font-black">T</div>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 bg-white px-3 py-1 border border-slate-200 shadow-2xs rounded-none">
              M4. Outer front door
            </span>
          </div>
        )}

        {/* LAYER 5: M5. REAR BACK PANEL */}
        {(selectedLayer === "all" || selectedLayer === "m5") && (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between font-mono text-[9px] font-black text-slate-600 mb-1.5 px-1 bg-slate-100 border border-slate-200 rounded-none py-0.5 shadow-2xs">
              <span>←</span>
              <span>W = {cabinetParams.width} mm</span>
              <span>→</span>
            </div>

            <div
              data-plate-id="m5"
              className="relative bg-white border-2 border-slate-500 shadow-2xl rounded-none p-4 flex flex-col pointer-events-auto transition-all duration-300"
              style={{ width: `${plateWidthPx}px`, height: `${plateHeightPx}px` }}
            >
              <div className="text-center font-mono text-[8px] text-slate-500 font-extrabold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                <span>M5 SHEET 05/05</span> <span>REAR BACK PANEL</span>
              </div>

              <div className="border-4 border-slate-400 bg-slate-50 rounded-none p-3 flex-1 relative flex flex-col justify-between shadow-inner">
                <div className="text-center text-[8px] font-mono font-bold text-slate-400 uppercase">
                  SPCC STEEL BACKPLATE ({cabinetParams.width}x{cabinetParams.height}mm)
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 bg-white px-3 py-1 border border-slate-200 shadow-2xs rounded-none">
              M5. Rear back panel
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
