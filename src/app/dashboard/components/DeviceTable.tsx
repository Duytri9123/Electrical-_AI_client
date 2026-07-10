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
      <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <span className="text-xs font-bold text-slate-800">Danh sách thiết bị</span>
        <button
          onClick={onAddDevice}
          className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded transition-colors"
        >
          + Thêm Thiết Bị
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="p-3">Ký hiệu/Mạch</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Số Cực</th>
              <th className="p-3">Dòng định mức (A)</th>
              <th className="p-3">Icu (kA)</th>
              <th className="p-3">Hãng</th>
              <th className="p-3">Mã thiết bị</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((dev, idx) => (
              <tr key={dev.id} className="hover:bg-slate-50/50">
                <td className="p-2.5">
                  <input
                    type="text"
                    value={dev.circuit}
                    onChange={(e) => onUpdateDevice(idx, "circuit", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="p-2.5">
                  <select
                    value={dev.type}
                    onChange={(e) => onUpdateDevice(idx, "type", e.target.value)}
                    className="px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  >
                    <option value="ACB">ACB</option>
                    <option value="MCCB">MCCB</option>
                    <option value="MCB">MCB</option>
                    <option value="RCBO">RCBO</option>
                    <option value="SPD">SPD</option>
                  </select>
                </td>
                <td className="p-2.5">
                  <select
                    value={dev.pole}
                    onChange={(e) => onUpdateDevice(idx, "pole", parseInt(e.target.value))}
                    className="px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  >
                    <option value={1}>1P</option>
                    <option value={2}>2P</option>
                    <option value={3}>3P</option>
                    <option value={4}>4P</option>
                  </select>
                </td>
                <td className="p-2.5">
                  <input
                    type="number"
                    value={dev.current}
                    onChange={(e) => onUpdateDevice(idx, "current", parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="p-2.5">
                  <input
                    type="text"
                    value={dev.icu}
                    onChange={(e) => onUpdateDevice(idx, "icu", e.target.value)}
                    className="w-20 px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="p-2.5">
                  <input
                    type="text"
                    value={dev.brand}
                    onChange={(e) => onUpdateDevice(idx, "brand", e.target.value)}
                    className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
                  />
                </td>
                <td className="p-2.5">
                  <input
                    type="text"
                    value={dev.model}
                    onChange={(e) => onUpdateDevice(idx, "model", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded focus:border-blue-400 focus:outline-none font-mono"
                  />
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => onRemoveDevice(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Xóa dòng"
                  >
                    🗑️
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
