"use client";

import React from "react";

interface SectionalLayerSheetProps {
  cabinetParams: {
    width: number;
    height: number;
    depth: number;
    cabinetStyle: string;
    project?: string;
  };
}

export const SectionalLayerSheet: React.FC<SectionalLayerSheetProps> = ({ cabinetParams }) => {
  return (
    <div className="bg-white border-2 border-slate-900 shadow-2xl p-6 flex flex-col space-y-4 font-mono text-slate-900 w-[1100px] select-none">
      {/* Top Banner Title */}
      <div className="text-center border-b-2 border-slate-900 pb-2">
        <h2 className="text-xl font-black tracking-widest uppercase">BẢNG VẼ LỚP CẮT KỸ THUẬT</h2>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
          IEC 61439 SECTIONAL VIEWS A-A, B-B, C-C &amp; LAYER LEGEND TABLE
        </p>
      </div>

      {/* Main CAD Sections Canvas Grid */}
      <div className="grid grid-cols-12 gap-4 items-start border border-slate-300 p-4 bg-slate-50/50">
        
        {/* Section A-A: Front View (6 Columns) */}
        <div className="col-span-6 flex flex-col items-center border border-slate-400 bg-white p-3 shadow-2xs">
          <div className="font-extrabold text-xs text-slate-800 border-b border-slate-300 pb-1 mb-3 w-full text-center">
            A - A (MẶT CẮT CHÍNH DIỆN)
          </div>
          <div className="relative border-4 border-slate-800 bg-slate-100 w-[320px] h-[360px] p-3 flex flex-col justify-between">
            
            {/* Callout Pins 1..9 */}
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center border border-red-800 shadow">1</div>
            <div className="absolute top-10 left-12 w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center border border-blue-800 shadow">2</div>
            <div className="absolute top-10 right-12 w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center border border-indigo-800 shadow">3</div>
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center border border-amber-800 shadow">4</div>
            <div className="absolute top-44 left-16 w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center border border-emerald-800 shadow">5</div>
            <div className="absolute bottom-20 left-24 w-4 h-4 rounded-full bg-purple-600 text-white font-black text-[9px] flex items-center justify-center border border-purple-800 shadow">6</div>
            <div className="absolute bottom-20 right-24 w-4 h-4 rounded-full bg-cyan-600 text-white font-black text-[9px] flex items-center justify-center border border-cyan-800 shadow">7</div>
            <div className="absolute bottom-12 left-1/3 w-4 h-4 rounded-full bg-yellow-500 text-slate-900 font-black text-[9px] flex items-center justify-center border border-yellow-700 shadow">8</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700 text-white font-black text-[9px] flex items-center justify-center border border-slate-900 shadow">9</div>

            {/* Incomer QF & SPD */}
            <div className="flex justify-around items-center border border-slate-400 p-2 bg-white">
              <div className="border border-slate-700 p-1.5 text-center bg-slate-50 font-bold text-[9px] w-20">
                QF (MCCB 3P)
              </div>
              <div className="border border-slate-700 p-1.5 text-center bg-slate-50 font-bold text-[9px] w-16">
                SPD 3P
              </div>
            </div>

            {/* 3P Busbar Bar (4) */}
            <div className="w-full h-3 bg-gradient-to-r from-red-600 via-amber-400 to-blue-600 border border-slate-800 rounded-none my-1 flex items-center justify-center text-[7px] text-white font-black">
              BUSBAR 3P+N (4)
            </div>

            {/* Branch MCBs (5) */}
            <div className="border border-slate-400 p-2 bg-white flex justify-around space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="border border-slate-600 bg-slate-200 text-[8px] font-bold px-1 py-3 text-center">
                  MCB
                </div>
              ))}
            </div>

            {/* Terminal Blocks X1 & Neutral/PE (7, 8) */}
            <div className="border border-slate-700 bg-slate-900 text-emerald-400 p-1.5 text-[8px] font-bold flex justify-between">
              <span>X1 TERMINAL BLOCK</span>
              <span>N / PE BUSBAR</span>
            </div>

            {/* Cable Glands (9) */}
            <div className="flex justify-around pt-1 border-t border-slate-400">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <div key={g} className="w-3 h-3 border border-slate-700 bg-slate-300 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="font-extrabold text-[10px] text-slate-700 mt-2">KÍCH THƯỚC: {cabinetParams.width} x {cabinetParams.height} MM</div>
        </div>

        {/* Section B-B: Side Cross View (3 Columns) */}
        <div className="col-span-3 flex flex-col items-center border border-slate-400 bg-white p-3 shadow-2xs">
          <div className="font-extrabold text-xs text-slate-800 border-b border-slate-300 pb-1 mb-3 w-full text-center">
            B - B (MẶT CẮT BÊN)
          </div>
          <div className="relative border-4 border-slate-800 bg-slate-100 w-[140px] h-[360px] p-2 flex flex-col justify-between items-center">
            <div className="font-bold text-[9px] text-slate-600 border-b border-slate-400 pb-0.5 w-full text-center">D = {cabinetParams.depth} MM</div>
            <div className="w-full flex-1 border-l-2 border-r-2 border-slate-400 my-2 relative flex flex-col justify-around px-2">
              <div className="w-full h-8 border border-slate-700 bg-slate-300 flex items-center justify-center text-[7px] font-bold">MONTAGE (11)</div>
              <div className="w-full h-10 border border-slate-700 bg-slate-200 flex items-center justify-center text-[7px] font-bold">DIN RAIL (10)</div>
              <div className="w-full h-12 border border-slate-700 bg-amber-200 flex items-center justify-center text-[7px] font-bold">BUSBAR (4)</div>
              <div className="w-full h-8 border border-slate-700 bg-emerald-200 flex items-center justify-center text-[7px] font-bold">X1 STRIP (7)</div>
            </div>
            <div className="w-full border-t border-slate-400 text-[8px] font-bold text-center pt-1">CỬA TRƯỚC (1)</div>
          </div>
          <div className="font-extrabold text-[10px] text-slate-700 mt-2">CHIỀU SÂU: {cabinetParams.depth} MM</div>
        </div>

        {/* Layer Legend Table (Image 2 Replica Table) */}
        <div className="col-span-3 border border-slate-400 bg-white p-3 shadow-2xs flex flex-col h-full">
          <div className="font-extrabold text-xs text-slate-900 border-b-2 border-slate-900 pb-1 mb-2 text-center uppercase">
            CHÚ THÍCH CÁC LỚP
          </div>
          <table className="w-full text-[8.5px] border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                <th className="border border-slate-400 px-1 py-1 text-center">STT</th>
                <th className="border border-slate-400 px-1 py-1 text-left">TÊN LỚP</th>
                <th className="border border-slate-400 px-1 py-1 text-left">GHI CHÚ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">1</td><td className="border border-slate-300 px-1 py-0.5 font-bold">VỎ TỦ</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">Tôn sơn tĩnh điện</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">2</td><td className="border border-slate-300 px-1 py-0.5 font-bold">APTOMAT TỔNG (QF)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">MCCB 3P / 2P</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">3</td><td className="border border-slate-300 px-1 py-0.5 font-bold">CHỐNG SÉT (SPD)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">3P / 1P+N</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">4</td><td className="border border-slate-300 px-1 py-0.5 font-bold">THANH CÁI ĐỒNG</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">3P + N (E-Cu)</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">5</td><td className="border border-slate-300 px-1 py-0.5 font-bold">APTOMAT NHÁNH (MCB)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">1P / 2P / 3P</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">6</td><td className="border border-slate-300 px-1 py-0.5 font-bold">DÂY DẪN (ĐI RA)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">Cu/PVC 6mm2</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">7</td><td className="border border-slate-300 px-1 py-0.5 font-bold">THANH TRUNG TÍNH (N)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">Đồng dẹp</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">8</td><td className="border border-slate-300 px-1 py-0.5 font-bold">THANH TIẾP ĐỊA (PE)</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">Đồng dẹp</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">9</td><td className="border border-slate-300 px-1 py-0.5 font-bold">BÍT ĐẦU CÁP</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">M20 / PG Cable Gland</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">10</td><td className="border border-slate-300 px-1 py-0.5 font-bold">RAY DIN</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">TS35 (35mm)</td></tr>
              <tr><td className="border border-slate-300 px-1 py-0.5 text-center font-bold">11</td><td className="border border-slate-300 px-1 py-0.5 font-bold">TẤM MONTAGE</td><td className="border border-slate-300 px-1 py-0.5 text-slate-600">Tôn mạ kẽm 1.5mm</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AutoCAD Title Block Footer (Khung Tên Bản Vẽ E-02) */}
      <div className="border-2 border-slate-900 p-3 bg-white grid grid-cols-12 gap-2 text-[9px]">
        <div className="col-span-5 border-r border-slate-400 pr-2 space-y-0.5">
          <div className="font-extrabold text-slate-900 uppercase">GHI CHÚ KỸ THUẬT:</div>
          <div className="text-slate-700">• Kích thước tủ: R{cabinetParams.width} x C{cabinetParams.height} x S{cabinetParams.depth} (mm)</div>
          <div className="text-slate-700">• Vật liệu vỏ tủ: Tôn sơn tĩnh điện dày 1.5mm (RAL 7035)</div>
          <div className="text-slate-700">• Cấp bảo vệ: {cabinetParams.cabinetStyle === "FACADE_DB_1P" ? "IP54" : "IP42/IP54"}</div>
          <div className="text-slate-700">• Quy chuẩn: IEC 61439-1/2 &amp; TCVN 7997:2009</div>
        </div>
        <div className="col-span-4 border-r border-slate-400 px-2 space-y-0.5">
          <div className="font-extrabold text-slate-900 uppercase">CÔNG TRÌNH:</div>
          <div className="font-extrabold text-blue-700 uppercase">{cabinetParams.project || "TỦ PHÂN PHỐI TẦNG 2"}</div>
          <div className="font-extrabold text-slate-900 uppercase mt-1">TÊN BẢN VẼ:</div>
          <div className="font-black text-slate-800 uppercase">BẢNG VẼ LỚP CẮT (A-A, B-B, C-C)</div>
        </div>
        <div className="col-span-3 flex flex-col justify-between text-right pl-2 font-mono">
          <div>TỶ LỆ: <span className="font-extrabold">1:10</span></div>
          <div>KÝ HIỆU: <span className="font-extrabold text-blue-700">E-02</span></div>
          <div>SỐ TRANG: <span className="font-extrabold">01/01</span></div>
        </div>
      </div>
    </div>
  );
};
