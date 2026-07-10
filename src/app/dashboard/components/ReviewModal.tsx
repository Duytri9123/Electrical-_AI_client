import React from "react";

interface Device {
  id: string;
  circuit: string;
  type: string;
  pole: number;
  current: number;
  icu: string;
  brand: string;
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
}: ReviewModalProps) {
  if (!isOpen || devices.length === 0) return null;

  const currentDevice = devices[currentIndex];
  const total = devices.length;
  const confirmedCount = Object.values(confirmedMap).filter(Boolean).length;
  const isConfirmed = !!confirmedMap[currentDevice.id];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
          <div className="flex items-center space-x-2">
            <span className="text-amber-500">🔍</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">DEVICE REVIEW</span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
              Confirmed {confirmedCount}/{total}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Body Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side: Diagram View */}
          <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center border-r border-slate-900">
            <div className="text-center space-y-3 max-w-md">
              <div className="text-4xl">📊</div>
              <p className="text-xs text-slate-400">No diagram image — review using the list on the right.</p>
              <div className="text-[10px] text-slate-600 bg-slate-900/50 p-3 rounded-lg border border-slate-900">
                <div className="font-semibold text-slate-500 mb-1">Thông số Mạch Hiện tại:</div>
                <div>Ký hiệu: <span className="font-mono text-blue-400">{currentDevice.circuit}</span></div>
                <div>Hãng / Model: {currentDevice.brand} - {currentDevice.model}</div>
              </div>
            </div>
          </div>

          {/* Right Side: Attributes Form */}
          <div className="w-80 bg-slate-900/40 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                Device {currentIndex + 1}/{total}
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                <select
                  value={currentDevice.type}
                  onChange={(e) => onUpdateDevice(currentIndex, "type", e.target.value)}
                  className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ACB">ACB</option>
                  <option value="MCCB">MCCB</option>
                  <option value="MCB">MCB</option>
                  <option value="RCBO">RCBO</option>
                  <option value="SPD">SPD</option>
                </select>
              </div>

              {/* Poles */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Poles</label>
                <select
                  value={currentDevice.pole}
                  onChange={(e) => onUpdateDevice(currentIndex, "pole", parseInt(e.target.value))}
                  className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>

              {/* Current */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current (A)</label>
                <input
                  type="number"
                  value={currentDevice.current}
                  onChange={(e) => onUpdateDevice(currentIndex, "current", parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Icu */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Icu (kA)</label>
                <input
                  type="text"
                  value={currentDevice.icu}
                  onChange={(e) => onUpdateDevice(currentIndex, "icu", e.target.value)}
                  className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Navigation & Confirmation Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => onNavigate(currentIndex - 1)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-850 rounded-lg text-xs font-bold transition-colors"
                >
                  ‹ Prev
                </button>
                <button
                  disabled={currentIndex === total - 1}
                  onClick={() => onNavigate(currentIndex + 1)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-850 rounded-lg text-xs font-bold transition-colors"
                >
                  Next ›
                </button>
              </div>

              <button
                onClick={() => onToggleConfirm(currentDevice.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                  isConfirmed
                    ? "bg-slate-800 text-slate-400 border border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
                }`}
              >
                {isConfirmed ? "✓ Confirmed" : "✓ Confirm"}
              </button>
              
              <p className="text-[9px] text-slate-500 text-center leading-relaxed">
                Arrow keys ← ↑ → ↓ to move • Enter to confirm • click a circle on the diagram
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
