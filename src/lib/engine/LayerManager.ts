/**
 * LAYER MANAGER — ELECTRICAL CABINET DESIGN LAYERS
 * Quản lý 11 lớp layer kỹ thuật cho bản vẽ tủ điện chuẩn kỹ sư.
 * Tiêu chuẩn: ISO/IEC 81714, IEC 61082-1 (CAD Electrical Drawing Layers)
 */

export type LayerId =
  | "LAYER_00_TITLE_BLOCK"
  | "LAYER_01_CABINET_OUTLINE"
  | "LAYER_02_DIN_RAIL"
  | "LAYER_03_BUSBAR"
  | "LAYER_04_MAIN_BREAKER"
  | "LAYER_05_BRANCH_DEVICES"
  | "LAYER_06_DOOR_INSTRUMENTS"
  | "LAYER_07_WIRING_DUCT"
  | "LAYER_08_CABLE_ENTRY"
  | "LAYER_09_DIMENSIONS"
  | "LAYER_10_ANNOTATION";

export interface LayerDefinition {
  id: LayerId;
  index: number;
  name: string;
  description: string;
  color: string;       // Hex color for CAD rendering
  lineWeight: number;  // mm (ISO 128: 0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0)
  lineType: "CONTINUOUS" | "DASHED" | "DOTTED" | "CENTER" | "PHANTOM";
  visible: boolean;
  locked: boolean;
  printable: boolean;
  zone: "STRUCTURE" | "ELECTRICAL" | "MECHANICAL" | "ANNOTATION";
}

/** Định nghĩa 11 layer chuẩn kỹ sư điện công nghiệp */
export const DESIGN_LAYERS: Record<LayerId, LayerDefinition> = {
  LAYER_00_TITLE_BLOCK: {
    id: "LAYER_00_TITLE_BLOCK",
    index: 0,
    name: "00 — TITLE BLOCK",
    description: "Khung bản vẽ A3/A2, thông tin dự án, chữ ký duyệt",
    color: "#1a1a2e",
    lineWeight: 0.70,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ANNOTATION",
  },
  LAYER_01_CABINET_OUTLINE: {
    id: "LAYER_01_CABINET_OUTLINE",
    index: 1,
    name: "01 — CABINET OUTLINE",
    description: "Đường bao vỏ tủ, kích thước ngoài W×H×D, vị trí cánh",
    color: "#e63946",
    lineWeight: 0.70,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "STRUCTURE",
  },
  LAYER_02_DIN_RAIL: {
    id: "LAYER_02_DIN_RAIL",
    index: 2,
    name: "02 — DIN RAIL",
    description: "Thanh ray DIN 35mm (EN 60715), vị trí lắp đặt trên backplate",
    color: "#457b9d",
    lineWeight: 0.35,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "MECHANICAL",
  },
  LAYER_03_BUSBAR: {
    id: "LAYER_03_BUSBAR",
    index: 3,
    name: "03 — BUSBAR R/S/T/N/PE",
    description: "Thanh cái đồng phân phối 5 pha, màng co nhiệt cách điện",
    color: "#f4a261",
    lineWeight: 1.00,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ELECTRICAL",
  },
  LAYER_04_MAIN_BREAKER: {
    id: "LAYER_04_MAIN_BREAKER",
    index: 4,
    name: "04 — MAIN BREAKER (CB TỔNG)",
    description: "CB Tổng level 0: ACB/MCCB chính, vị trí lắp, footprint, kết nối busbar",
    color: "#2a9d8f",
    lineWeight: 0.50,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ELECTRICAL",
  },
  LAYER_05_BRANCH_DEVICES: {
    id: "LAYER_05_BRANCH_DEVICES",
    index: 5,
    name: "05 — BRANCH DEVICES (CB NHÁNH)",
    description: "CB Nhánh level 1+: MCB/MCCB, Contactor, Relay, Timer, SPD",
    color: "#264653",
    lineWeight: 0.35,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ELECTRICAL",
  },
  LAYER_06_DOOR_INSTRUMENTS: {
    id: "LAYER_06_DOOR_INSTRUMENTS",
    index: 6,
    name: "06 — DOOR INSTRUMENTS (CÁNH TỦ)",
    description: "Đồng hồ đo, đèn báo pha, công tắc xoay trên cánh tủ — vị trí khoét lỗ",
    color: "#e9c46a",
    lineWeight: 0.35,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ELECTRICAL",
  },
  LAYER_07_WIRING_DUCT: {
    id: "LAYER_07_WIRING_DUCT",
    index: 7,
    name: "07 — WIRING DUCT (MÁNG LUỒN DÂY)",
    description: "Máng luồn dây Panduit 40×60mm / 60×60mm dọc 2 bên DIN rail",
    color: "#6d6875",
    lineWeight: 0.25,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "MECHANICAL",
  },
  LAYER_08_CABLE_ENTRY: {
    id: "LAYER_08_CABLE_ENTRY",
    index: 8,
    name: "08 — CABLE ENTRY (VÀO CÁP)",
    description: "Vị trí vào cáp, cable gland, cáp lực và cáp điều khiển",
    color: "#b5838d",
    lineWeight: 0.35,
    lineType: "DASHED",
    visible: true,
    locked: false,
    printable: true,
    zone: "MECHANICAL",
  },
  LAYER_09_DIMENSIONS: {
    id: "LAYER_09_DIMENSIONS",
    index: 9,
    name: "09 — DIMENSIONS (KÍCH THƯỚC)",
    description: "Đường kích thước, đường dẫn, chú thích số mm",
    color: "#a8dadc",
    lineWeight: 0.18,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ANNOTATION",
  },
  LAYER_10_ANNOTATION: {
    id: "LAYER_10_ANNOTATION",
    index: 10,
    name: "10 — ANNOTATION (GHI CHÚ)",
    description: "Nhãn thiết bị, ghi chú kỹ thuật, số hiệu mạch điện",
    color: "#aaaaaa",
    lineWeight: 0.18,
    lineType: "CONTINUOUS",
    visible: true,
    locked: false,
    printable: true,
    zone: "ANNOTATION",
  },
};

/** Lấy tất cả layer theo thứ tự index */
export function getAllLayers(): LayerDefinition[] {
  return Object.values(DESIGN_LAYERS).sort((a, b) => a.index - b.index);
}

/** Lấy layer theo ID */
export function getLayer(id: LayerId): LayerDefinition {
  return DESIGN_LAYERS[id];
}

/** Toggle visibility của một layer */
export function toggleLayerVisibility(
  layers: LayerDefinition[],
  id: LayerId
): LayerDefinition[] {
  return layers.map((l) =>
    l.id === id ? { ...l, visible: !l.visible } : l
  );
}

/** Toggle lock của một layer */
export function toggleLayerLock(
  layers: LayerDefinition[],
  id: LayerId
): LayerDefinition[] {
  return layers.map((l) =>
    l.id === id ? { ...l, locked: !l.locked } : l
  );
}

/**
 * Xác định layer nào cần thiết cho từng loại thiết bị.
 * Dùng để highlight layer tương ứng khi user click thiết bị.
 */
export function getDeviceLayer(deviceType: string): LayerId {
  const upperType = (deviceType || "").toUpperCase();
  if (upperType === "ENCLOSURE") return "LAYER_01_CABINET_OUTLINE";
  if (upperType === "BUSBAR")    return "LAYER_03_BUSBAR";
  if (upperType === "DIN_RAIL")  return "LAYER_02_DIN_RAIL";
  if (upperType === "WIRING_DUCT") return "LAYER_07_WIRING_DUCT";
  if (upperType === "VOLTMETER" || upperType === "AMMETER" || upperType === "PILOT_LAMP")
    return "LAYER_06_DOOR_INSTRUMENTS";
  // Main breaker (level 0)
  if (upperType === "ACB") return "LAYER_04_MAIN_BREAKER";
  // Branch devices
  if (["MCCB", "MCB", "RCBO", "RCCB", "CONTACTOR", "RELAY", "TIMER", "SPD", "FUSE"].includes(upperType))
    return "LAYER_05_BRANCH_DEVICES";
  if (upperType === "TERMINAL") return "LAYER_05_BRANCH_DEVICES";
  return "LAYER_10_ANNOTATION";
}

/**
 * Khởi tạo danh sách layer mặc định cho bản vẽ mới.
 * Có thể filter theo layers_required từ AI response.
 */
export function initializeLayers(layersRequired?: string[]): LayerDefinition[] {
  const all = getAllLayers();
  if (!layersRequired || layersRequired.length === 0) return all;
  return all.filter((l) => layersRequired.includes(l.id));
}

/** Màu nền mỗi zone để group layer trong Sidebar UI */
export const ZONE_COLORS: Record<string, string> = {
  STRUCTURE:  "#fee2e2",  // Red tint
  ELECTRICAL: "#dbeafe",  // Blue tint
  MECHANICAL: "#f3f4f6",  // Gray tint
  ANNOTATION: "#f0fdf4",  // Green tint
};

export const ZONE_LABELS: Record<string, string> = {
  STRUCTURE:  "Kết cấu",
  ELECTRICAL: "Điện",
  MECHANICAL: "Cơ khí",
  ANNOTATION: "Chú thích",
};
