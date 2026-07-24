"use client";

import React, { useState } from "react";
import { CADDocument, PanelJSON, ViewType } from "./cadTypes";
import { generateCadDocumentFromPanel } from "./layoutEngine";
import { exportDocumentToDXF } from "./dxfExporter";

interface Indoor2DoorSheetProps {
  panelJSON?: PanelJSON;
  cabinetParams?: any;
}

export const Indoor2DoorSheet: React.FC<Indoor2DoorSheetProps> = ({ panelJSON, cabinetParams }) => {
  const defaultPanel: PanelJSON = {
    projectInfo: {
      projectName: "TỦ ĐIỆN ĐỒNG HỒ & ĐỘNG LỰC TRẠM SẠC 630A",
      customer: "CÔNG TY ĐIỆN LỰC & XÂY LẮP",
      drawingTitle: "BẢN VẼ TỦ 2 CÁNH TÔN 1.5 - TỦ TRONG NHÀ",
      drawingNumber: "CAD-2026-630A-01",
      scale: "1:10",
      sheetSize: "A3",
      designer: "Nguyễn Văn A",
      approver: "Trần Văn B",
      date: "2026-07-24",
      material: "Tôn 1.5mm Sơn Tĩnh Điện",
      paintColor: "RAL 7032 (Ghi sần)",
      revision: "01",
    },
    cabinet: {
      type: "INDOOR_2_DOOR",
      width: 800,
      height: 1500,
      depth: 500,
      plinthHeight: 100,
      sheetMetalThickness: 1.5,
      color: "RAL 7032",
    },
    components: [
      { id: "c1", tag: "QF1 TỔNG", type: "MCCB", brand: "ABB", model: "XT3N 250A", width: 140, height: 180, depth: 92, currentRating: 250, mountType: "PANEL_SCREW", targetView: "EQUIPMENT_PANEL", clearance: { top: 50, bottom: 50, left: 30, right: 30 } },
      { id: "c2", tag: "VOLTMETER", type: "VOLT_METER", brand: "Selec", model: "MA12", width: 96, height: 96, depth: 60, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 20, bottom: 20, left: 20, right: 20 } },
      { id: "c3", tag: "AMMETER", type: "AMP_METER", brand: "Selec", model: "MA302", width: 96, height: 96, depth: 60, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 20, bottom: 20, left: 20, right: 20 } },
      { id: "c4", tag: "SELECTOR", type: "SELECTOR_SWITCH", brand: "Kraus&Naimer", model: "7-Pos", width: 48, height: 48, depth: 60, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c5", tag: "HL1 (R)", type: "PILOT_LAMP", brand: "Schneider", model: "XB7 Red", width: 30, height: 30, depth: 50, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c6", tag: "HL2 (S)", type: "PILOT_LAMP", brand: "Schneider", model: "XB7 Yellow", width: 30, height: 30, depth: 50, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c7", tag: "HL3 (T)", type: "PILOT_LAMP", brand: "Schneider", model: "XB7 Blue", width: 30, height: 30, depth: 50, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c8", tag: "START", type: "PUSH_BUTTON", brand: "Schneider", model: "Green Start", width: 30, height: 30, depth: 55, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c9", tag: "STOP", type: "PUSH_BUTTON", brand: "Schneider", model: "Red Stop", width: 30, height: 30, depth: 55, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 15, bottom: 15, left: 15, right: 15 } },
      { id: "c10", tag: "E-STOP", type: "EMERGENCY_STOP", brand: "Schneider", model: "E-Stop 40mm", width: 40, height: 40, depth: 65, mountType: "DOOR_CUTOUT", targetView: "INNER_DOOR", clearance: { top: 20, bottom: 20, left: 20, right: 20 } },
      { id: "c11", tag: "PLC1", type: "PLC", brand: "Siemens", model: "S7-1200 CPU 1214C", width: 110, height: 100, depth: 75, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 40, bottom: 40, left: 20, right: 20 } },
      { id: "c12", tag: "KA1", type: "RELAY", brand: "Omron", model: "MY2N 24VDC", width: 38, height: 78, depth: 65, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 20, bottom: 20, left: 5, right: 5 } },
      { id: "c13", tag: "KA2", type: "RELAY", brand: "Omron", model: "MY2N 24VDC", width: 38, height: 78, depth: 65, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 20, bottom: 20, left: 5, right: 5 } },
      { id: "c14", tag: "QF2", type: "MCB", brand: "Schneider", model: "iC60N 3P 32A", width: 54, height: 85, depth: 70, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 30, bottom: 30, left: 5, right: 5 } },
      { id: "c15", tag: "KM1", type: "CONTACTOR", brand: "Schneider", model: "LC1D32M7", width: 75, height: 85, depth: 90, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 30, bottom: 30, left: 10, right: 10 } },
      { id: "c16", tag: "X1 TERMINAL", type: "TERMINAL_STRIP", brand: "Weidmuller", model: "WDU 2.5", width: 500, height: 45, depth: 40, mountType: "DIN_RAIL_35", targetView: "EQUIPMENT_PANEL", clearance: { top: 40, bottom: 40, left: 10, right: 10 } },
    ],
  };

  const currentPanel = panelJSON || defaultPanel;
  const doc: CADDocument = generateCadDocumentFromPanel(currentPanel);

  const [activeTab, setActiveTab] = useState<ViewType | "ALL">("ALL");

  const handleExportDXF = () => {
    const dxfString = exportDocumentToDXF(doc);
    const blob = new Blob([dxfString], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.metadata?.drawingNumber || "Cabinet_Layout"}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950 border-2 border-cyan-500 shadow-2xl p-5 flex flex-col space-y-5 font-mono text-cyan-400 w-full select-none rounded-xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-cyan-500/50 pb-3 gap-3">
        <div>
          <h1 className="text-xl font-black tracking-widest uppercase text-cyan-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            BẢN VẼ TỦ 2 CÁNH TÔN 1.5 - TỦ TRONG NHÀ CHUẨN CAD/EPLAN
          </h1>
          <p className="text-[11px] text-cyan-400/80 font-bold uppercase tracking-wider mt-0.5">
            PROJECT: {doc.metadata?.projectName} | SCALE: {doc.metadata?.scale} | SHEET: {doc.metadata?.sheetSize}
          </p>
        </div>

        {/* DXF Export Button */}
        <button
          onClick={handleExportDXF}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black px-5 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          XUẤT FILE AUTOCAD (.DXF)
        </button>
      </div>

      {/* View Selector Tabs */}
      <div className="flex space-x-1.5 border-b border-cyan-900 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1 rounded-t text-xs font-bold transition-all ${
            activeTab === "ALL" ? "bg-cyan-500 text-slate-950 shadow" : "bg-slate-900 text-cyan-400 hover:bg-slate-800"
          }`}
        >
          TẤT CẢ HÌNH CHIẾU
        </button>
        {doc.projections?.slice(0, 5).map((p: any) => (
          <button
            key={p.viewType}
            onClick={() => setActiveTab(p.viewType)}
            className={`px-2.5 py-1 rounded-t text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === p.viewType ? "bg-cyan-500 text-slate-950 shadow" : "bg-slate-900 text-cyan-400 hover:bg-slate-800"
            }`}
          >
            {p.title.split(". ")[1]}
          </button>
        ))}
      </div>

      {/* Projections Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/60 p-4 border border-cyan-800 rounded-xl">
        {(doc.projections || [])
          .filter((p: any) => activeTab === "ALL" || activeTab === p.viewType)
          .map((proj: any) => {
            // Compute scale factor to fit exactly inside 240px wide x 420px high box
            const targetW = 220;
            const targetH = 400;
            const scaleFactor = Math.min(targetW / proj.width, targetH / proj.height);
            const boxPixelW = proj.width * scaleFactor;
            const boxPixelH = proj.height * scaleFactor;

            return (
              <div key={proj.viewType} className="flex flex-col items-center bg-slate-900 border border-cyan-700/80 p-3 rounded-lg shadow-lg relative">
                <div className="text-[11px] font-bold text-cyan-300 border-b border-cyan-800 pb-1.5 mb-3 w-full text-center tracking-wide uppercase truncate">
                  {proj.title}
                </div>

                {/* View Box Container */}
                <div
                  className="relative bg-slate-950 border-2 border-cyan-400 p-1 overflow-hidden shadow-inner flex flex-col justify-between"
                  style={{
                    width: `${boxPixelW}px`,
                    height: `${boxPixelH}px`,
                  }}
                >
                  {/* Rendered View Objects */}
                  {proj.objects.map((obj: any) => {
                    // Hide background frame dummy labels
                    const isFrame = obj.blockType === "CABINET" || obj.blockType === "OUTER_DOOR" || obj.blockType === "INNER_DOOR" || obj.blockType === "PLATE";
                    const itemW = Math.max(4, obj.w * scaleFactor);
                    const itemH = Math.max(4, obj.h * scaleFactor);

                    return (
                      <div
                        key={obj.id}
                        title={obj.label || obj.tag || obj.blockType}
                        className="absolute border flex items-center justify-center text-[7px] font-bold transition-all hover:scale-105 hover:z-20 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-0.5"
                        style={{
                          left: `${obj.x * scaleFactor}px`,
                          top: `${obj.y * scaleFactor}px`,
                          width: `${itemW}px`,
                          height: `${itemH}px`,
                          borderColor: obj.stroke,
                          backgroundColor: obj.fill || "transparent",
                          color: obj.stroke === "#00ffff" ? "#38bdf8" : "#fef08a",
                        }}
                      >
                        {!isFrame && itemW > 16 && itemH > 10 ? obj.tag || obj.blockType : ""}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 text-[9.5px] text-cyan-400/80 font-semibold text-center">
                  KT: {proj.width} x {proj.height} MM
                </div>
              </div>
            );
          })}
      </div>

      {/* Bill of Materials (BOM) Table */}
      <div className="border border-cyan-800 rounded-lg p-3.5 bg-slate-900/80">
        <h3 className="text-xs font-bold uppercase text-cyan-300 mb-2 flex items-center gap-2">
          📋 BẢNG LIỆT KÊ THIẾT BỊ VẬT TƯ (BILL OF MATERIALS - BOM)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-cyan-700 bg-slate-950 text-cyan-300">
                <th className="p-1.5 border border-cyan-800 text-center">STT</th>
                <th className="p-1.5 border border-cyan-800">TAG</th>
                <th className="p-1.5 border border-cyan-800">TÊN THIẾT BỊ</th>
                <th className="p-1.5 border border-cyan-800">MODEL</th>
                <th className="p-1.5 border border-cyan-800">HÃNG</th>
                <th className="p-1.5 border border-cyan-800 text-center">SL</th>
                <th className="p-1.5 border border-cyan-800">KÍCH THƯỚC (WxHxD)</th>
              </tr>
            </thead>
            <tbody>
              {(doc.bomTable || []).map((item: any) => (
                <tr key={item.itemNumber} className="border-b border-cyan-900/50 hover:bg-cyan-950/30 text-cyan-200">
                  <td className="p-1.5 border border-cyan-900 text-center font-bold">{item.itemNumber}</td>
                  <td className="p-1.5 border border-cyan-900 font-bold text-amber-300">{item.tag}</td>
                  <td className="p-1.5 border border-cyan-900">{item.name}</td>
                  <td className="p-1.5 border border-cyan-900 font-mono text-emerald-400">{item.model}</td>
                  <td className="p-1.5 border border-cyan-900">{item.brand}</td>
                  <td className="p-1.5 border border-cyan-900 text-center font-bold">{item.quantity}</td>
                  <td className="p-1.5 border border-cyan-900">{item.dimensions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Title Block (Khung Tên A3) */}
      <div className="border-2 border-cyan-400 p-3 bg-slate-900 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div>
          <span className="text-cyan-500 block text-[9.5px]">TÊN DỰ ÁN:</span>
          <span className="font-bold text-white">{doc.metadata?.projectName}</span>
        </div>
        <div>
          <span className="text-cyan-500 block text-[9.5px]">KHÁCH HÀNG:</span>
          <span className="font-bold text-white">{doc.metadata?.customer}</span>
        </div>
        <div>
          <span className="text-cyan-500 block text-[9.5px]">CHẤT LIỆU VỎ TỦ:</span>
          <span className="font-bold text-amber-300">{doc.metadata?.material}</span>
        </div>
        <div>
          <span className="text-cyan-500 block text-[9.5px]">MÀU SƠN TĨNH ĐIỆN:</span>
          <span className="font-bold text-amber-300">{doc.metadata?.paintColor}</span>
        </div>
      </div>
    </div>
  );
};
