"use client";

import React from "react";

interface CubicleForm2BSheetProps {
  cabinetParams: {
    width: number;
    height: number;
    depth: number;
  };
}

export const CubicleForm2BSheet: React.FC<CubicleForm2BSheetProps> = ({ cabinetParams }) => {
  return (
    <div className="bg-slate-900 border-2 border-cyan-500 shadow-2xl p-6 flex flex-col space-y-4 font-mono text-cyan-400 w-[1450px] select-none">
      <div className="text-center border-b border-cyan-500/50 pb-2">
        <h2 className="text-xl font-black tracking-widest uppercase text-cyan-300">BẢN VẼ TỦ KHUNG ĐỨNG FORM 2B (MSB / VDB 7 HÌNH CHIẾU)</h2>
        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">AUTOCAD CUBICLE SHEET 01/01 - SCALE 1:10 (IEC 61439-2 FORM 2B)</p>
      </div>
      
      {/* 7 Horizontal CAD Views */}
      <div className="grid grid-cols-7 gap-3 items-start border border-cyan-800 p-4 bg-slate-950">
        
        {/* View 1: EQUIPMENT VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">EQUIPMENT VIEW</div>
          <div className="w-[160px] h-[320px] border-2 border-cyan-400 p-1 flex flex-col justify-between relative bg-slate-900">
            <div className="w-full h-4 border border-red-500 bg-red-950 text-[6px] text-red-400 font-bold flex items-center justify-center">ROOF CANOPY</div>
            <div className="w-full flex-1 border border-cyan-700 my-2 flex flex-col justify-around p-1">
              <div className="w-full h-8 border border-amber-500 bg-amber-950 text-[6px] text-amber-300 flex items-center justify-center">BUSBAR CHAMBER</div>
              <div className="w-full h-24 border border-cyan-500 bg-slate-950 text-[6px] text-cyan-300 flex items-center justify-center">BREAKER RACKS</div>
            </div>
            <div className="w-full h-6 border border-emerald-500 bg-emerald-950 text-[6px] text-emerald-300 flex items-center justify-center">BASE FRAME 100MM</div>
          </div>
        </div>

        {/* View 2: 1st DOOR VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">1st DOOR VIEW</div>
          <div className="w-[160px] h-[320px] border-2 border-cyan-400 p-1 flex flex-col justify-between relative bg-slate-900">
            <div className="w-full h-12 border border-emerald-400 bg-emerald-950 text-[6px] text-emerald-300 flex items-center justify-center font-bold">MICA WINDOW ( Che An Toàn )</div>
            <div className="w-full flex-1 border border-slate-700 my-2"></div>
            <div className="w-2 h-6 bg-amber-400 mx-auto rounded-none"></div>
          </div>
        </div>

        {/* View 3: 2nd DOOR VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">2nd DOOR VIEW</div>
          <div className="w-[160px] h-[320px] border-2 border-cyan-400 p-2 flex flex-col justify-between relative bg-slate-900">
            <div className="w-full h-10 border border-cyan-400 bg-slate-950 p-1 flex justify-around items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 text-[5px] text-white flex items-center justify-center font-bold">R</div>
              <div className="w-3 h-3 rounded-full bg-amber-400 text-[5px] text-black flex items-center justify-center font-bold">S</div>
              <div className="w-3 h-3 rounded-full bg-blue-500 text-[5px] text-white flex items-center justify-center font-bold">T</div>
            </div>
            <div className="w-12 h-10 border border-cyan-300 bg-slate-950 text-[6px] text-cyan-300 flex items-center justify-center mx-auto my-2">METER</div>
            <div className="w-full h-6 border border-purple-400 bg-purple-950 text-[6px] text-purple-300 flex items-center justify-center font-bold">LOUVERS ( Quạt Hút )</div>
          </div>
        </div>

        {/* View 4: EQUIPMENT INTERNAL VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">INTERNAL VIEW</div>
          <div className="w-[160px] h-[320px] border-2 border-cyan-400 p-1 flex flex-col justify-between relative bg-slate-900">
            <div className="w-full h-4 bg-gradient-to-r from-red-600 via-amber-400 to-blue-600 text-[6px] text-white font-bold flex items-center justify-center">MAIN BUSBAR 1600A</div>
            <div className="w-full h-16 border border-cyan-300 bg-slate-950 text-[6px] text-cyan-300 font-bold flex items-center justify-center my-2">ACB 3P 1600A</div>
            <div className="w-full h-12 border border-emerald-400 bg-emerald-950 text-[6px] text-emerald-300 font-bold flex items-center justify-center">X1 TERMINAL BUS</div>
          </div>
        </div>

        {/* View 5: INSIDE SIDE VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">INSIDE SIDE VIEW</div>
          <div className="w-[140px] h-[320px] border-2 border-cyan-400 p-1 flex flex-col justify-between relative bg-slate-900">
            <div className="text-[6px] text-cyan-400 text-center font-bold border-b border-cyan-800 pb-0.5">D = {cabinetParams.depth}MM</div>
            <div className="w-full flex-1 border-l border-r border-cyan-700 my-1 flex flex-col justify-around p-1">
              <div className="w-full h-8 border border-amber-400 bg-amber-950 text-[6px] text-amber-300 flex items-center justify-center">BUSBAR DEPTH</div>
              <div className="w-full h-12 border border-cyan-400 bg-slate-950 text-[6px] text-cyan-300 flex items-center justify-center">ACB DEPTH</div>
            </div>
          </div>
        </div>

        {/* View 6: SIDE VIEW (EXTERIOR) */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">SIDE VIEW</div>
          <div className="w-[140px] h-[320px] border-2 border-cyan-400 p-2 flex flex-col justify-between relative bg-slate-900">
            <div className="w-full h-8 border border-purple-400 bg-purple-950 text-[6px] text-purple-300 flex items-center justify-center font-bold">SIDE LOUVERS</div>
            <div className="w-full h-8 border border-purple-400 bg-purple-950 text-[6px] text-purple-300 flex items-center justify-center font-bold my-auto">LOWER LOUVERS</div>
          </div>
        </div>

        {/* View 7: TOP/BOTTOM VIEW */}
        <div className="flex flex-col items-center border border-cyan-900 bg-slate-900 p-2">
          <div className="text-[8px] font-bold text-cyan-300 mb-2 border-b border-cyan-800 w-full text-center">TOP / BOTTOM</div>
          <div className="w-[140px] h-[140px] border-2 border-cyan-400 p-2 flex flex-col justify-between relative bg-slate-900 mb-2">
            <div className="text-[6px] text-cyan-300 text-center font-bold">MẶT NÓC NÂNG CẨU</div>
            <div className="w-full flex-1 border border-cyan-600 my-1 flex items-center justify-center text-[6px] text-cyan-400">4 MÓC M12</div>
          </div>
          <div className="w-[140px] h-[140px] border-2 border-cyan-400 p-2 flex flex-col justify-between relative bg-slate-900">
            <div className="text-[6px] text-cyan-300 text-center font-bold">MẶT ĐÁY ĐỘT LỖ</div>
            <div className="w-full flex-1 border border-cyan-600 my-1 flex items-center justify-center text-[6px] text-cyan-400">TẤM ĐÁY CÁP IP54</div>
          </div>
        </div>

      </div>
    </div>
  );
};
