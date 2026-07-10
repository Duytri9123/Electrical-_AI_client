import React from "react";

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

interface DeviceTableProps {
  devices: Device[];
  onUpdateDevice: (index: number, field: keyof Device, value: any) => void;
  onRemoveDevice: (index: number) => void;
  onAddDevice: () => void;
}

export default function DeviceTable({
  devices,
  onUpdateDevice,
  onRemoveDevice,
  onAddDevice,
}: DeviceTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col flex-1 shadow-sm">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="p-2 w-8 text-center text-[10px]">#</th>
              <th className="p-2 w-12 text-center text-[10px]">LV</th>
              <th className="p-2 min-w-[120px] text-[10px]">CIRCUIT / LOAD</th>
              <th className="p-2 w-20 text-[10px]">TYPE</th>
              <th className="p-2 w-16 text-[10px]">POLES</th>
              <th className="p-2 w-16 text-[10px]">IN (A)</th>
              <th className="p-2 w-16 text-[10px]">ICU (kA)</th>
              <th className="p-2 w-16 text-[10px]">IΔ (mA)</th>
              <th className="p-2 min-w-[80px] text-[10px]">CABLE</th>
              <th className="p-2 w-16 text-[10px]">P (kW)</th>
              <th className="p-2 w-16 text-center text-[10px]">MATCH</th>
              <th className="p-2 min-w-[150px] text-[10px]">MATCHED MODEL</th>
              <th className="p-2 w-10 text-center text-[10px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((dev, idx) => (
              <tr key={dev.id} className="hover:bg-slate-50/50">
                {/* Index Column */}
                <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>

                {/* LV (Level) Column */}
                <td className="p-2 text-center">
                  <select
                    value={dev.level ?? 1}
                    onChange={(e) => onUpdateDevice(idx, "level", parseInt(e.target.value))}
                    className={`w-10 text-center py-0.5 font-bold rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-555 ${
                      (dev.level ?? 1) === 0
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </td>

                {/* Circuit / Load */}
                <td className="p-2">
                  <input
                    type="text"
                    value={dev.circuit}
                    onChange={(e) => onUpdateDevice(idx, "circuit", e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* Type Selection */}
                <td className="p-2">
                  <select
                    value={dev.type}
                    onChange={(e) => onUpdateDevice(idx, "type", e.target.value)}
                    className="w-full px-1.5 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="ACB">ACB</option>
                    <option value="MCCB">MCCB</option>
                    <option value="MCB">MCB</option>
                    <option value="RCBO">RCBO</option>
                    <option value="SPD">SPD</option>
                  </select>
                </td>

                {/* Poles Selection */}
                <td className="p-2">
                  <select
                    value={dev.pole}
                    onChange={(e) => onUpdateDevice(idx, "pole", parseInt(e.target.value))}
                    className="w-full px-1.5 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value={1}>1P</option>
                    <option value={2}>2P</option>
                    <option value={3}>3P</option>
                    <option value={4}>4P</option>
                  </select>
                </td>

                {/* Current IN (A) */}
                <td className="p-2">
                  <input
                    type="number"
                    value={dev.current}
                    onChange={(e) => onUpdateDevice(idx, "current", parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* ICU (kA) */}
                <td className="p-2">
                  <input
                    type="text"
                    value={dev.icu}
                    onChange={(e) => onUpdateDevice(idx, "icu", e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* Leakage current (mA) */}
                <td className="p-2">
                  <input
                    type="text"
                    value={dev.leakage ?? "-"}
                    onChange={(e) => onUpdateDevice(idx, "leakage", e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* Cable Specifications */}
                <td className="p-2">
                  <input
                    type="text"
                    value={dev.cable ?? ""}
                    onChange={(e) => onUpdateDevice(idx, "cable", e.target.value)}
                    placeholder="—"
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* Power (kW) */}
                <td className="p-2">
                  <input
                    type="number"
                    value={dev.power ?? 0}
                    onChange={(e) => onUpdateDevice(idx, "power", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0"
                  />
                </td>

                {/* Database Match Status Badge */}
                <td className="p-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 uppercase">
                    OK
                  </span>
                </td>

                {/* Matched Model string */}
                <td className="p-2">
                  <input
                    type="text"
                    value={dev.model}
                    onChange={(e) => onUpdateDevice(idx, "model", e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border-none focus:bg-slate-50 focus:outline-none focus:ring-0 font-mono text-[10.5px] font-semibold text-slate-700"
                  />
                </td>

                {/* Actions: delete row */}
                <td className="p-2 text-center">
                  <button
                    onClick={() => onRemoveDevice(idx)}
                    className="w-5 h-5 flex items-center justify-center text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 rounded border border-red-200 hover:border-red-500 transition-all cursor-pointer"
                    title="Xóa thiết bị"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
