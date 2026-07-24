/**
 * RULE LIBRARY v2.0 — IEC 61439 ENGINEERING ZONES & PLACEMENT RULES
 * Định nghĩa 5 khoang phân vùng chuẩn IEC 61439-1:2011, khoảng cách tối thiểu,
 * quy tắc đặt thiết bị, và ràng buộc cơ học cho Layout Engine.
 */

// ═══════════════════════════════════════════════════════
// IEC 61439-1 FORM OF SEPARATION
// Form 1: No separation
// Form 2A: Busbar separated from functional units
// Form 2B: Busbars + terminals separated from functional units
// Form 3A/3B/4A/4B: Full compartmentalization
// ═══════════════════════════════════════════════════════
export type FormSeparation = "FORM_1" | "FORM_2A" | "FORM_2B" | "FORM_3A" | "FORM_3B" | "FORM_4A" | "FORM_4B";

export type ZoneId = "CABLE_ENTRY" | "BUSBAR" | "POWER" | "CONTROL" | "DOOR" | "TERMINAL";

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  /** Vertical position ratio from TOP (0 = very top, 1 = very bottom) */
  vertical_position_ratio: { min: number; max: number };
  allowed_types: string[];
  preferred_types: string[];
  /** Min vertical spacing from adjacent zone (mm) */
  separation_mm: number;
  /** Background color hint for UI rendering */
  ui_color: string;
  description: string;
}

// ═══════════════════════════════════════════════════════
// 5-ZONE CABINET LAYOUT (IEC 61439-1 Form 2B standard)
// Zone allocation (top → bottom):
//   POWER       → 0%–30%   (CB Tổng, ACB, MCCB chính)
//   CONTROL     → 30%–70%  (MCB nhánh, Contactor, Relay, PLC)
//   TERMINAL    → 70%–85%  (Terminal block X1, N, PE)
//   CABLE_ENTRY → 85%–100% (Vào cáp, Cable gland)
//   DOOR        → cánh tủ  (Đồng hồ, đèn báo, công tắc)
//   BUSBAR      → dọc trục (Thanh cái R/S/T/N/PE)
// ═══════════════════════════════════════════════════════
export const ELECTRICAL_ZONES: Record<ZoneId, ZoneDefinition> = {
  CABLE_ENTRY: {
    id: "CABLE_ENTRY",
    name: "KHOANG VÀO CÁP (Cable Entry)",
    vertical_position_ratio: { min: 0.85, max: 1.0 },
    allowed_types: ["TERMINAL"],
    preferred_types: [],
    separation_mm: 50,
    ui_color: "#6b7280",
    description: "Khoang vào cáp lực và điều khiển (dưới cùng), Cable gland, màng chặn bụi",
  },
  BUSBAR: {
    id: "BUSBAR",
    name: "THANH CÁI ĐỒNG (Busbar R/S/T/N/PE)",
    vertical_position_ratio: { min: 0.0, max: 1.0 }, // Runs full height
    allowed_types: ["BUSBAR"],
    preferred_types: ["BUSBAR"],
    separation_mm: 25,   // IEC 61439 Form 2A: min 25mm live parts to structure
    ui_color: "#f59e0b",
    description: "Thanh cái đồng mạ thiếc 5 pha (R/S/T/N/PE) dọc suốt tủ",
  },
  POWER: {
    id: "POWER",
    name: "KHOANG NGUỒN (Power Zone — CB Tổng)",
    vertical_position_ratio: { min: 0.0, max: 0.30 },
    allowed_types: ["ACB", "MCCB", "SPD", "FUSE", "BUSBAR"],
    preferred_types: ["ACB", "MCCB", "SPD"],
    separation_mm: 30,
    ui_color: "#ef4444",
    description: "CB Tổng / ACB / MCCB chính, SPD chống sét, phía trên tủ",
  },
  CONTROL: {
    id: "CONTROL",
    name: "KHOANG ĐIỀU KHIỂN (Control Zone — CB Nhánh)",
    vertical_position_ratio: { min: 0.30, max: 0.70 },
    allowed_types: ["MCB", "RCBO", "RCCB", "CONTACTOR", "RELAY", "TIMER", "PLC", "POWER_SUPPLY", "FUSE"],
    preferred_types: ["MCB", "RCBO", "CONTACTOR", "RELAY"],
    separation_mm: 20,
    ui_color: "#3b82f6",
    description: "CB Nhánh, Contactor, Relay, Timer, PLC — giữa tủ",
  },
  TERMINAL: {
    id: "TERMINAL",
    name: "KHOANG ĐẦU NỐI (Terminal Zone)",
    vertical_position_ratio: { min: 0.70, max: 0.85 },
    allowed_types: ["TERMINAL"],
    preferred_types: ["TERMINAL"],
    separation_mm: 15,
    ui_color: "#10b981",
    description: "Terminal block X1, đấu nối cáp điều khiển — phía dưới tủ",
  },
  DOOR: {
    id: "DOOR",
    name: "CÁNH TỦ (Door Panel — Instruments)",
    vertical_position_ratio: { min: 0.0, max: 1.0 },
    allowed_types: ["VOLTMETER", "AMMETER", "PILOT_LAMP"],
    preferred_types: ["VOLTMETER", "AMMETER", "PILOT_LAMP"],
    separation_mm: 20,
    ui_color: "#8b5cf6",
    description: "Đồng hồ Voltmeter/Ammeter, Đèn báo pha, Công tắc xoay trên cánh tủ",
  },
};

// ═══════════════════════════════════════════════════════
// PLACEMENT RULES — IEC 61439 & TCVN 7540
// ═══════════════════════════════════════════════════════
export interface PlacementRule {
  device_type: string;
  target_zone: ZoneId;
  prefer_near?: string[];    // Types that should be adjacent (minimize wire length)
  avoid_near?: string[];     // Types to keep away from (EMI, heat separation)
  min_spacing_horizontal_mm: number;
  min_spacing_vertical_mm: number;
  must_be_first_in_zone?: boolean; // e.g. ACB must be first on rail
}

export const PLACEMENT_RULES: PlacementRule[] = [
  // ACB: Must be at TOP, first on rail, separated from control
  {
    device_type: "ACB",
    target_zone: "POWER",
    avoid_near: ["RELAY", "PLC", "TIMER"],
    min_spacing_horizontal_mm: 30,
    min_spacing_vertical_mm: 50,
    must_be_first_in_zone: true,
  },
  // MCCB Main (level 0): top zone
  {
    device_type: "MCCB",
    target_zone: "POWER",
    avoid_near: ["RELAY", "PLC"],
    min_spacing_horizontal_mm: 20,
    min_spacing_vertical_mm: 35,
    must_be_first_in_zone: false,
  },
  // SPD: Near main breaker, at top
  {
    device_type: "SPD",
    target_zone: "POWER",
    prefer_near: ["ACB", "MCCB"],
    min_spacing_horizontal_mm: 15,
    min_spacing_vertical_mm: 30,
  },
  // Power Supply: Near PLC (minimize 24VDC wire)
  {
    device_type: "POWER_SUPPLY",
    target_zone: "CONTROL",
    prefer_near: ["PLC"],
    min_spacing_horizontal_mm: 15,
    min_spacing_vertical_mm: 25,
  },
  // PLC: Near Power Supply + Relay banks
  {
    device_type: "PLC",
    target_zone: "CONTROL",
    prefer_near: ["POWER_SUPPLY", "RELAY"],
    avoid_near: ["MCCB", "ACB"],
    min_spacing_horizontal_mm: 20,
    min_spacing_vertical_mm: 25,
  },
  // Relay: Near PLC
  {
    device_type: "RELAY",
    target_zone: "CONTROL",
    prefer_near: ["PLC"],
    min_spacing_horizontal_mm: 10,
    min_spacing_vertical_mm: 20,
  },
  // Timer: Near Contactor
  {
    device_type: "TIMER",
    target_zone: "CONTROL",
    prefer_near: ["CONTACTOR"],
    min_spacing_horizontal_mm: 10,
    min_spacing_vertical_mm: 20,
  },
  // Contactor: In control zone, away from PLC
  {
    device_type: "CONTACTOR",
    target_zone: "CONTROL",
    avoid_near: ["PLC"],
    min_spacing_horizontal_mm: 10,
    min_spacing_vertical_mm: 20,
  },
  // MCB / RCBO / RCCB: Control zone, compact
  {
    device_type: "MCB",
    target_zone: "CONTROL",
    min_spacing_horizontal_mm: 0,   // MCB can be side-by-side (no clearance required)
    min_spacing_vertical_mm: 15,
  },
  {
    device_type: "RCBO",
    target_zone: "CONTROL",
    min_spacing_horizontal_mm: 0,
    min_spacing_vertical_mm: 15,
  },
  {
    device_type: "RCCB",
    target_zone: "CONTROL",
    min_spacing_horizontal_mm: 5,
    min_spacing_vertical_mm: 15,
  },
  // Terminal: Bottom zone
  {
    device_type: "TERMINAL",
    target_zone: "TERMINAL",
    min_spacing_horizontal_mm: 0,
    min_spacing_vertical_mm: 15,
  },
];

// ═══════════════════════════════════════════════════════
// IEC 61439 STRUCTURAL CONSTANTS
// ═══════════════════════════════════════════════════════
export const IEC61439_CONSTANTS = {
  /** Wiring duct width each side of DIN rail (mm) */
  WIRING_DUCT_WIDTH_MM: 40,

  /** Side margin from cabinet wall to first device (mm) — includes duct */
  SIDE_MARGIN_MM: 45,

  /** Top margin from cabinet ceiling (mm) */
  TOP_MARGIN_MM: 100,

  /** Bottom margin from cabinet floor to cable entry (mm) */
  BOTTOM_MARGIN_MM: 150,

  /** Standard DIN rail height (mm) EN 60715 */
  DIN_RAIL_HEIGHT_MM: 7.5,

  /** Spacing between DIN rails (center-to-center, mm) — min 125mm IEC 61439 */
  DIN_RAIL_SPACING_MM: 150,

  /** Min clearance between live parts Form 2A (mm) */
  CLEARANCE_LIVE_PARTS_FORM_2A_MM: 25,

  /** Min clearance between live parts Form 4B (mm) */
  CLEARANCE_LIVE_PARTS_FORM_4B_MM: 50,

  /** Standard busbar width allocation (mm, for busbar zone on left/right) */
  BUSBAR_ZONE_WIDTH_MM: 60,

  /** Min clearance from busbar to device (mm) */
  BUSBAR_TO_DEVICE_CLEARANCE_MM: 30,

  /** Footprint safety factor for cabinet sizing (1.15 = 15% headroom) */
  CABINET_SIZING_SAFETY_FACTOR: 1.15,
};

// ═══════════════════════════════════════════════════════
// CABLE ROUTING RULES
// ═══════════════════════════════════════════════════════
export interface CableRoutingRule {
  cable_type: "POWER" | "CONTROL" | "SIGNAL";
  max_fill_ratio: number;   // Wiring duct fill ratio max (IEC 60364: 40%)
  min_bend_radius_mm: number;
  separation_required: boolean; // Must be separated from other cable types
}

export const CABLE_ROUTING_RULES: CableRoutingRule[] = [
  { cable_type: "POWER",   max_fill_ratio: 0.40, min_bend_radius_mm: 50, separation_required: true },
  { cable_type: "CONTROL", max_fill_ratio: 0.40, min_bend_radius_mm: 30, separation_required: true },
  { cable_type: "SIGNAL",  max_fill_ratio: 0.30, min_bend_radius_mm: 20, separation_required: true },
];

// ═══════════════════════════════════════════════════════
// HELPER: Get zone for a device type
// ═══════════════════════════════════════════════════════
export function getDeviceZone(deviceType: string, level: number = 1): ZoneId {
  const upper = (deviceType || "").toUpperCase();
  if (upper === "ACB" || (upper === "MCCB" && level === 0)) return "POWER";
  if (upper === "MCCB" || upper === "SPD" || upper === "FUSE") return level === 0 ? "POWER" : "CONTROL";
  if (["MCB", "RCBO", "RCCB", "CONTACTOR", "RELAY", "TIMER", "PLC", "POWER_SUPPLY"].includes(upper)) return "CONTROL";
  if (upper === "TERMINAL") return "TERMINAL";
  if (["VOLTMETER", "AMMETER", "PILOT_LAMP"].includes(upper)) return "DOOR";
  if (upper === "BUSBAR") return "BUSBAR";
  return "CONTROL";
}

/** Check if a device type is allowed in a zone */
export function isAllowedInZone(deviceType: string, zoneId: ZoneId): boolean {
  return ELECTRICAL_ZONES[zoneId].allowed_types.includes(deviceType.toUpperCase());
}
