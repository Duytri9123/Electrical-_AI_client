import React from "react";

interface Device {
  id: string;
  circuit: string;
  type: string;
  pole: number;
  current: number;
  icu: string;
  brand?: string;
  model: string;
  status: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onUpdateDevice: (index: number, field: keyof Device, value: any) => void;
  confirmedMap: Record<string, boolean>;
  onToggleConfirm: (id: string) => void;
  diagramImageUrl?: string | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  devices,
  currentIndex,
  onNavigate,
  onUpdateDevice,
  confirmedMap,
  onToggleConfirm,
  diagramImageUrl,
}: ReviewModalProps) {
  if (!isOpen || devices.length === 0) return null;

  const currentDevice = devices[currentIndex];
  const total = devices.length;
  const confirmedCount = Object.values(confirmedMap).filter(Boolean).length;
  const isConfirmed = !!confirmedMap[currentDevice.id];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs">🔍</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Review Thiết Bị</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
              Đã xác nhận {confirmedCount}/{total}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 font-bold transition-all shadow-sm"
          >
            ✕ Đóng
          </button>
        </div>

        {/* Body Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side: Diagram View */}
          <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center border-r border-slate-200">
            <div className="text-center space-y-3 max-w-md w-full">
              {diagramImageUrl ? (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                  <img src={diagramImageUrl} alt="Bản vẽ SLD" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  📊
                </div>
              )}
              <p className="text-xs text-slate-500 font-medium">Chi tiết thông số thiết bị từ bản vẽ SLD</p>
              <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5 text-left">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100">Thông Số Mạch</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ký hiệu mạch:</span>
                  <span className="font-mono font-bold text-blue-600">{currentDevice.circuit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hãng:</span>
                  <span className="font-semibold text-slate-700">{currentDevice.brand || "LS"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="font-mono text-slate-700">{currentDevice.model}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Attributes Form */}
          <div className="w-80 bg-white p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Thiết Bị {currentIndex + 1} / {total}
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Loại thiết bị</label>
                <select
                  value={currentDevice.type}
                  onChange={(e) => onUpdateDevice(currentIndex, "type", e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="ACB">ACB</option>
                  <option value="MCCB">MCCB</option>
                  <option value="MCB">MCB</option>
                  <option value="RCBO">RCBO</option>
                  <option value="SPD">SPD</option>
                  <option value="Contactor">Contactor</option>
                </select>
              </div>

              {/* Poles */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Số Cực (Poles)</label>
                <select
                  value={currentDevice.pole ?? 3}
                  onChange={(e) => onUpdateDevice(currentIndex, "pole", parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value={1}>1P</option>
                  <option value={2}>2P</option>
                  <option value={3}>3P</option>
                  <option value={4}>4P</option>
                </select>
              </div>

              {/* Current */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dòng Định Mức (A)</label>
                <input
                  type="number"
                  value={currentDevice.current ?? 0}
                  onChange={(e) => onUpdateDevice(currentIndex, "current", parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Icu */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Dòng Cắt Icu (kA)</label>
                <input
                  type="text"
                  value={currentDevice.icu ?? ""}
                  onChange={(e) => onUpdateDevice(currentIndex, "icu", e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Navigation & Confirmation Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => onNavigate(currentIndex - 1)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  ‹ Trước
                </button>
                <button
                  disabled={currentIndex === total - 1}
                  onClick={() => onNavigate(currentIndex + 1)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Sau ›
                </button>
              </div>

              <button
                onClick={() => onToggleConfirm(currentDevice.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isConfirmed
                    ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                }`}
              >
                {isConfirmed ? "✓ Đã Xác Nhận" : "✓ Xác Nhận Thiết Bị Này"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
