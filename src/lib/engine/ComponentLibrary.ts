/**
 * COMPONENT LIBRARY - ELECTRICAL SWITCHGEAR & CONTROLGEAR PHYSICAL SPECS
 * Standardized database of physical component dimensions, mounting rules,
 * thermal clearances, and terminal specs.
 */

export interface ComponentSpec {
  model_code: string;
  type: "MCCB" | "MCB" | "ACB" | "CONTACTOR" | "TIMER" | "FUSE" | "PLC" | "POWER_SUPPLY" | "RELAY" | "TERMINAL" | "SPD" | "BUSBAR";
  brand: string;
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  mount_type: "din_rail" | "backplate" | "busbar";
  min_clearance_top_bottom_mm: number;
  min_clearance_sides_mm: number;
  heat_dissipation_watts: number;
  weight_kg: number;
  terminal_positions: {
    inlet_y_offset_mm: number;
    outlet_y_offset_mm: number;
  };
}

export const COMPONENT_LIBRARY: Record<string, ComponentSpec> = {
  // --- MCCBs ---
  "ABB_XT1_MCCB_3P": {
    model_code: "ABB XT1 3P",
    type: "MCCB",
    brand: "ABB",
    width_mm: 76,
    height_mm: 130,
    depth_mm: 70,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 30,
    min_clearance_sides_mm: 15,
    heat_dissipation_watts: 12,
    weight_kg: 1.1,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 120 },
  },
  "LS_ABN52C_MCCB_2P": {
    model_code: "LS ABN52c 2P",
    type: "MCCB",
    brand: "LS Electric",
    width_mm: 54,
    height_mm: 130,
    depth_mm: 60,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25,
    min_clearance_sides_mm: 10,
    heat_dissipation_watts: 8,
    weight_kg: 0.7,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 120 },
  },
  "SCHNEIDER_NSX100_MCCB_3P": {
    model_code: "Schneider NSX100N 3P",
    type: "MCCB",
    brand: "Schneider",
    width_mm: 105,
    height_mm: 161,
    depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40,
    min_clearance_sides_mm: 20,
    heat_dissipation_watts: 18,
    weight_kg: 2.0,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
  },

  // --- MCBs & RCBOs ---
  "GENERIC_MCB_1P": {
    model_code: "MCB 1P 18MM",
    type: "MCB",
    brand: "Generic",
    width_mm: 18,
    height_mm: 81,
    depth_mm: 65,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15,
    min_clearance_sides_mm: 0,
    heat_dissipation_watts: 2,
    weight_kg: 0.12,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
  },
  "GENERIC_MCB_2P": {
    model_code: "MCB 2P 36MM",
    type: "MCB",
    brand: "Generic",
    width_mm: 36,
    height_mm: 81,
    depth_mm: 65,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15,
    min_clearance_sides_mm: 0,
    heat_dissipation_watts: 4,
    weight_kg: 0.24,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
  },
  "GENERIC_MCB_3P": {
    model_code: "MCB 3P 54MM",
    type: "MCB",
    brand: "Generic",
    width_mm: 54,
    height_mm: 81,
    depth_mm: 65,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15,
    min_clearance_sides_mm: 0,
    heat_dissipation_watts: 6,
    weight_kg: 0.36,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
  },

  // --- PLC & CONTROL ---
  "SIEMENS_S7_1200_PLC": {
    model_code: "Siemens S7-1200 CPU 1214C",
    type: "PLC",
    brand: "Siemens",
    width_mm: 110,
    height_mm: 100,
    depth_mm: 75,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 25,
    min_clearance_sides_mm: 15,
    heat_dissipation_watts: 15,
    weight_kg: 0.45,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 90 },
  },
  "MEANWELL_24V_POWER_SUPPLY": {
    model_code: "Mean Well NDR-120-24 24V 5A",
    type: "POWER_SUPPLY",
    brand: "Mean Well",
    width_mm: 40,
    height_mm: 125,
    depth_mm: 113,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 30,
    min_clearance_sides_mm: 15,
    heat_dissipation_watts: 14,
    weight_kg: 0.6,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 115 },
  },

  // --- RELAYS & TIMERS & CONTACTORS ---
  "OMRON_MY4N_RELAY": {
    model_code: "Omron MY4N-D2 24VDC",
    type: "RELAY",
    brand: "Omron",
    width_mm: 27,
    height_mm: 78,
    depth_mm: 64,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 10,
    min_clearance_sides_mm: 5,
    heat_dissipation_watts: 1.5,
    weight_kg: 0.08,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 70 },
  },
  "PANASONIC_SUL181D_TIMER": {
    model_code: "Panasonic SUL181d 24H",
    type: "TIMER",
    brand: "Panasonic",
    width_mm: 53.5,
    height_mm: 90,
    depth_mm: 60,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15,
    min_clearance_sides_mm: 5,
    heat_dissipation_watts: 3,
    weight_kg: 0.18,
    terminal_positions: { inlet_y_offset_mm: 8, outlet_y_offset_mm: 82 },
  },
  "LS_MC22B_CONTACTOR_2P": {
    model_code: "LS MC-22b 2P 40A",
    type: "CONTACTOR",
    brand: "LS Electric",
    width_mm: 45,
    height_mm: 74,
    depth_mm: 80,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15,
    min_clearance_sides_mm: 10,
    heat_dissipation_watts: 7,
    weight_kg: 0.4,
    terminal_positions: { inlet_y_offset_mm: 6, outlet_y_offset_mm: 68 },
  },

  // --- TERMINALS ---
  "PHOENIX_UT4_TERMINAL": {
    model_code: "Phoenix Contact UT 4",
    type: "TERMINAL",
    brand: "Phoenix Contact",
    width_mm: 6.2,
    height_mm: 47,
    depth_mm: 47.5,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 10,
    min_clearance_sides_mm: 0,
    heat_dissipation_watts: 0.1,
    weight_kg: 0.01,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 42 },
  },
};

/**
 * Get device physical spec fallback
 */
export function getComponentSpec(type: string, pole: number = 1, current: number = 16): ComponentSpec {
  const upperType = (type || "").toUpperCase();
  
  if (upperType.includes("MCCB")) {
    if (pole >= 3) return COMPONENT_LIBRARY["ABB_XT1_MCCB_3P"];
    return COMPONENT_LIBRARY["LS_ABN52C_MCCB_2P"];
  }
  if (upperType.includes("PLC")) return COMPONENT_LIBRARY["SIEMENS_S7_1200_PLC"];
  if (upperType.includes("POWER_SUPPLY") || upperType.includes("NGUỒN")) return COMPONENT_LIBRARY["MEANWELL_24V_POWER_SUPPLY"];
  if (upperType.includes("RELAY") || upperType.includes("RƠ LE")) return COMPONENT_LIBRARY["OMRON_MY4N_RELAY"];
  if (upperType.includes("TIMER")) return COMPONENT_LIBRARY["PANASONIC_SUL181D_TIMER"];
  if (upperType.includes("CONTACTOR")) return COMPONENT_LIBRARY["LS_MC22B_CONTACTOR_2P"];
  if (upperType.includes("TERMINAL") || upperType.includes("CẦU ĐẤU")) return COMPONENT_LIBRARY["PHOENIX_UT4_TERMINAL"];

  // Fallback to MCB
  if (pole === 2) return COMPONENT_LIBRARY["GENERIC_MCB_2P"];
  if (pole >= 3) return COMPONENT_LIBRARY["GENERIC_MCB_3P"];
  return COMPONENT_LIBRARY["GENERIC_MCB_1P"];
}
