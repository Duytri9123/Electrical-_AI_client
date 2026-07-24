/**
 * RULE LIBRARY - ELECTRICAL ENGINEERING ZONING & PLACEMENT RULES
 * Defines standards for electrical layout zoning, affinity, and clearances.
 */

export interface ZoneDefinition {
  id: "POWER" | "CONTROL" | "IO" | "TERMINAL";
  name: string;
  vertical_position_ratio: { min: number; max: number }; // 0 = top, 1 = bottom
  allowed_types: string[];
  preferred_types: string[];
}

export const ELECTRICAL_ZONES: Record<string, ZoneDefinition> = {
  POWER: {
    id: "POWER",
    name: "POWER ZONE (MCCB / ACB / SPD / FUSE)",
    vertical_position_ratio: { min: 0.0, max: 0.35 },
    allowed_types: ["MCCB", "ACB", "SPD", "FUSE", "BUSBAR"],
    preferred_types: ["MCCB", "ACB", "SPD"],
  },
  CONTROL: {
    id: "CONTROL",
    name: "CONTROL ZONE (PLC / POWER SUPPLY / RELAY / TIMER / CONTACTOR / MCB)",
    vertical_position_ratio: { min: 0.35, max: 0.75 },
    allowed_types: ["PLC", "POWER_SUPPLY", "RELAY", "TIMER", "CONTACTOR", "MCB"],
    preferred_types: ["POWER_SUPPLY", "PLC", "RELAY", "TIMER"],
  },
  TERMINAL: {
    id: "TERMINAL",
    name: "TERMINAL & I/O ZONE (X1 TERMINAL BLOCK / N / PE)",
    vertical_position_ratio: { min: 0.75, max: 1.0 },
    allowed_types: ["TERMINAL", "BUSBAR"],
    preferred_types: ["TERMINAL"],
  },
};

export interface PlacementRule {
  device_type: string;
  target_zone: "POWER" | "CONTROL" | "TERMINAL";
  prefer_near?: string[];
  avoid_near?: string[];
  min_spacing_horizontal_mm: number;
  min_spacing_vertical_mm: number;
}

export const PLACEMENT_RULES: PlacementRule[] = [
  {
    device_type: "MCCB",
    target_zone: "POWER",
    avoid_near: ["RELAY", "PLC"],
    min_spacing_horizontal_mm: 20,
    min_spacing_vertical_mm: 35,
  },
  {
    device_type: "POWER_SUPPLY",
    target_zone: "CONTROL",
    prefer_near: ["PLC"],
    min_spacing_horizontal_mm: 15,
    min_spacing_vertical_mm: 25,
  },
  {
    device_type: "PLC",
    target_zone: "CONTROL",
    prefer_near: ["POWER_SUPPLY", "RELAY"],
    avoid_near: ["MCCB"],
    min_spacing_horizontal_mm: 20,
    min_spacing_vertical_mm: 25,
  },
  {
    device_type: "RELAY",
    target_zone: "CONTROL",
    prefer_near: ["PLC"],
    min_spacing_horizontal_mm: 10,
    min_spacing_vertical_mm: 20,
  },
  {
    device_type: "MCB",
    target_zone: "CONTROL",
    min_spacing_horizontal_mm: 8,
    min_spacing_vertical_mm: 20,
  },
  {
    device_type: "TERMINAL",
    target_zone: "TERMINAL",
    min_spacing_horizontal_mm: 4,
    min_spacing_vertical_mm: 15,
  },
];
