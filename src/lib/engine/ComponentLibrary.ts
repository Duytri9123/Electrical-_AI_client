/**
 * COMPONENT LIBRARY — ELECTRICAL SWITCHGEAR & CONTROLGEAR PHYSICAL SPECS v2.0
 * Cơ sở dữ liệu footprint vật lý thiết bị điện từ catalog nhà sản xuất.
 * Tiêu chuẩn: IEC 60947, IEC 60439, IEC 61439 (Enclosure)
 * 
 * Nguồn dữ liệu: LS Electric Catalog 2024, ABB Catalog 2024, Schneider Catalog 2024,
 *               CHINT Catalog 2024, EMIC Catalog, Phoenix Contact Catalog
 */

export interface ComponentSpec {
  model_code: string;
  type: "MCCB" | "MCB" | "ACB" | "CONTACTOR" | "TIMER" | "FUSE" | "PLC"
      | "POWER_SUPPLY" | "RELAY" | "TERMINAL" | "SPD" | "BUSBAR" | "DIN_RAIL"
      | "WIRING_DUCT" | "ENCLOSURE" | "VOLTMETER" | "AMMETER" | "PILOT_LAMP"
      | "RCBO" | "RCCB";
  brand: string;
  // Physical dimensions (mm)
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  // Mounting
  mount_type: "din_rail" | "backplate" | "busbar" | "door_panel" | "chassis";
  // Clearances per IEC 61439 (mm)
  min_clearance_top_bottom_mm: number;
  min_clearance_sides_mm: number;
  // Electrical
  In_A?: number;
  Icu_kA?: number;
  pole?: number;
  // Physical
  heat_dissipation_watts: number;
  weight_kg: number;
  // Terminal offset for wiring (from top of device)
  terminal_positions: {
    inlet_y_offset_mm: number;
    outlet_y_offset_mm: number;
  };
  // Door cutout (for instruments on door panel)
  cutout_mm?: number;
  // Price VND (thị trường 2024)
  price_vnd?: number;
}

export const COMPONENT_LIBRARY: Record<string, ComponentSpec> = {

  // ═══════════════════════════════════════════════════════
  // LS ELECTRIC — ACB (Air Circuit Breaker)
  // ═══════════════════════════════════════════════════════
  "LS_ACB_630_4P": {
    model_code: "LS ABS 630b 4P", type: "ACB", brand: "LS Electric",
    width_mm: 280, height_mm: 370, depth_mm: 305,
    mount_type: "chassis",
    min_clearance_top_bottom_mm: 80, min_clearance_sides_mm: 50,
    In_A: 630, Icu_kA: 65, pole: 4,
    heat_dissipation_watts: 450, weight_kg: 38,
    terminal_positions: { inlet_y_offset_mm: 20, outlet_y_offset_mm: 350 },
    price_vnd: 42000000,
  },
  "LS_ACB_1000_4P": {
    model_code: "LS ABS 1000b 4P", type: "ACB", brand: "LS Electric",
    width_mm: 350, height_mm: 420, depth_mm: 330,
    mount_type: "chassis",
    min_clearance_top_bottom_mm: 100, min_clearance_sides_mm: 60,
    In_A: 1000, Icu_kA: 65, pole: 4,
    heat_dissipation_watts: 680, weight_kg: 55,
    terminal_positions: { inlet_y_offset_mm: 25, outlet_y_offset_mm: 395 },
    price_vnd: 68000000,
  },
  "LS_ACB_1600_4P": {
    model_code: "LS ABS 1600b 4P", type: "ACB", brand: "LS Electric",
    width_mm: 420, height_mm: 500, depth_mm: 380,
    mount_type: "chassis",
    min_clearance_top_bottom_mm: 120, min_clearance_sides_mm: 80,
    In_A: 1600, Icu_kA: 85, pole: 4,
    heat_dissipation_watts: 1100, weight_kg: 85,
    terminal_positions: { inlet_y_offset_mm: 30, outlet_y_offset_mm: 470 },
    price_vnd: 125000000,
  },

  // ═══════════════════════════════════════════════════════
  // LS ELECTRIC — MCCB
  // ═══════════════════════════════════════════════════════
  "LS_ABN52c_2P": {
    model_code: "LS ABN52c 2P", type: "MCCB", brand: "LS Electric",
    width_mm: 54, height_mm: 130, depth_mm: 60,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 10,
    In_A: 50, Icu_kA: 10, pole: 2,
    heat_dissipation_watts: 7.5, weight_kg: 0.75,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 120 },
    price_vnd: 980000,
  },
  "LS_ABN52c_3P": {
    model_code: "LS ABN52c 3P", type: "MCCB", brand: "LS Electric",
    width_mm: 75, height_mm: 130, depth_mm: 60,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 10,
    In_A: 50, Icu_kA: 10, pole: 3,
    heat_dissipation_watts: 10.5, weight_kg: 1.0,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 120 },
    price_vnd: 1250000,
  },
  "LS_ABN103c_3P": {
    model_code: "LS ABN103c 3P", type: "MCCB", brand: "LS Electric",
    width_mm: 105, height_mm: 142, depth_mm: 70,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 15,
    In_A: 100, Icu_kA: 18, pole: 3,
    heat_dissipation_watts: 16, weight_kg: 1.6,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 130 },
    price_vnd: 1750000,
  },
  "LS_ABN103c_4P": {
    model_code: "LS ABN103c 4P", type: "MCCB", brand: "LS Electric",
    width_mm: 140, height_mm: 142, depth_mm: 70,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 15,
    In_A: 100, Icu_kA: 18, pole: 4,
    heat_dissipation_watts: 20, weight_kg: 2.1,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 130 },
    price_vnd: 2350000,
  },
  "LS_ABN203c_3P": {
    model_code: "LS ABN203c 3P", type: "MCCB", brand: "LS Electric",
    width_mm: 105, height_mm: 170, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 30, min_clearance_sides_mm: 20,
    In_A: 200, Icu_kA: 25, pole: 3,
    heat_dissipation_watts: 28, weight_kg: 2.4,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 155 },
    price_vnd: 2750000,
  },
  "LS_ABN403c_3P": {
    model_code: "LS ABN403c 3P", type: "MCCB", brand: "LS Electric",
    width_mm: 140, height_mm: 222, depth_mm: 103,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 25,
    In_A: 400, Icu_kA: 35, pole: 3,
    heat_dissipation_watts: 55, weight_kg: 5.2,
    terminal_positions: { inlet_y_offset_mm: 20, outlet_y_offset_mm: 200 },
    price_vnd: 4850000,
  },
  "LS_ABN403c_4P": {
    model_code: "LS ABN403c 4P", type: "MCCB", brand: "LS Electric",
    width_mm: 185, height_mm: 222, depth_mm: 103,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 25,
    In_A: 400, Icu_kA: 35, pole: 4,
    heat_dissipation_watts: 68, weight_kg: 6.5,
    terminal_positions: { inlet_y_offset_mm: 20, outlet_y_offset_mm: 200 },
    price_vnd: 6250000,
  },
  "LS_ABS403b_4P": {
    model_code: "LS ABS403b 4P", type: "MCCB", brand: "LS Electric",
    width_mm: 210, height_mm: 270, depth_mm: 145,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 50, min_clearance_sides_mm: 30,
    In_A: 400, Icu_kA: 42, pole: 4,
    heat_dissipation_watts: 80, weight_kg: 8.5,
    terminal_positions: { inlet_y_offset_mm: 20, outlet_y_offset_mm: 250 },
    price_vnd: 8500000,
  },

  // ═══════════════════════════════════════════════════════
  // LS ELECTRIC — MCB (iS60)
  // ═══════════════════════════════════════════════════════
  "LS_MCB_1P": {
    model_code: "LS iS60 1P", type: "MCB", brand: "LS Electric",
    width_mm: 18, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 60, Icu_kA: 6, pole: 1,
    heat_dissipation_watts: 2, weight_kg: 0.11,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 68000,
  },
  "LS_MCB_2P": {
    model_code: "LS iS60 2P", type: "MCB", brand: "LS Electric",
    width_mm: 36, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 60, Icu_kA: 6, pole: 2,
    heat_dissipation_watts: 3.5, weight_kg: 0.20,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 135000,
  },
  "LS_MCB_3P": {
    model_code: "LS iS60 3P", type: "MCB", brand: "LS Electric",
    width_mm: 54, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 60, Icu_kA: 6, pole: 3,
    heat_dissipation_watts: 5, weight_kg: 0.28,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 195000,
  },
  "LS_MCB_4P": {
    model_code: "LS iS60 4P", type: "MCB", brand: "LS Electric",
    width_mm: 72, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 60, Icu_kA: 6, pole: 4,
    heat_dissipation_watts: 7, weight_kg: 0.38,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 265000,
  },

  // LS ELECTRIC — RCBO
  "LS_RCBO_1PN_30mA": {
    model_code: "LS RKP 1P+N 30mA", type: "RCBO", brand: "LS Electric",
    width_mm: 36, height_mm: 87, depth_mm: 70,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 32, Icu_kA: 6, pole: 2,
    heat_dissipation_watts: 3, weight_kg: 0.22,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 80 },
    price_vnd: 420000,
  },

  // LS ELECTRIC — Contactor (MC series)
  "LS_MC_12b": {
    model_code: "LS MC-12b 12A", type: "CONTACTOR", brand: "LS Electric",
    width_mm: 45, height_mm: 72, depth_mm: 72,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 5,
    In_A: 12, pole: 3,
    heat_dissipation_watts: 5, weight_kg: 0.35,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 65 },
    price_vnd: 285000,
  },
  "LS_MC_22b": {
    model_code: "LS MC-22b 22A", type: "CONTACTOR", brand: "LS Electric",
    width_mm: 45, height_mm: 74, depth_mm: 80,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 5,
    In_A: 22, pole: 3,
    heat_dissipation_watts: 7, weight_kg: 0.40,
    terminal_positions: { inlet_y_offset_mm: 6, outlet_y_offset_mm: 68 },
    price_vnd: 380000,
  },
  "LS_MC_40a": {
    model_code: "LS MC-40a 40A", type: "CONTACTOR", brand: "LS Electric",
    width_mm: 60, height_mm: 88, depth_mm: 90,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 20, min_clearance_sides_mm: 8,
    In_A: 40, pole: 3,
    heat_dissipation_watts: 12, weight_kg: 0.72,
    terminal_positions: { inlet_y_offset_mm: 8, outlet_y_offset_mm: 80 },
    price_vnd: 680000,
  },
  "LS_MC_65a": {
    model_code: "LS MC-65a 65A", type: "CONTACTOR", brand: "LS Electric",
    width_mm: 75, height_mm: 105, depth_mm: 105,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 10,
    In_A: 65, pole: 3,
    heat_dissipation_watts: 18, weight_kg: 1.2,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 95 },
    price_vnd: 1250000,
  },

  // ═══════════════════════════════════════════════════════
  // ABB — MCBs, MCCBs, Contactors
  // ═══════════════════════════════════════════════════════
  "ABB_S200_MCB_1P": {
    model_code: "ABB S201 C", type: "MCB", brand: "ABB",
    width_mm: 18, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 1,
    heat_dissipation_watts: 2, weight_kg: 0.12,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 95000,
  },
  "ABB_S200_MCB_2P": {
    model_code: "ABB S202 C", type: "MCB", brand: "ABB",
    width_mm: 36, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 2,
    heat_dissipation_watts: 3.5, weight_kg: 0.23,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 185000,
  },
  "ABB_S200_MCB_3P": {
    model_code: "ABB S203 C", type: "MCB", brand: "ABB",
    width_mm: 54, height_mm: 81, depth_mm: 68,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 3,
    heat_dissipation_watts: 5, weight_kg: 0.32,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 75 },
    price_vnd: 275000,
  },
  "ABB_T1B_MCCB_3P": {
    model_code: "ABB T1B 160 3P", type: "MCCB", brand: "ABB",
    width_mm: 76, height_mm: 130, depth_mm: 70,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 30, min_clearance_sides_mm: 15,
    In_A: 160, Icu_kA: 16, pole: 3,
    heat_dissipation_watts: 14, weight_kg: 1.5,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 120 },
    price_vnd: 1850000,
  },
  "ABB_T3N_MCCB_3P": {
    model_code: "ABB T3N 250 3P", type: "MCCB", brand: "ABB",
    width_mm: 105, height_mm: 161, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 20,
    In_A: 250, Icu_kA: 36, pole: 3,
    heat_dissipation_watts: 32, weight_kg: 2.5,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
    price_vnd: 3850000,
  },
  "ABB_T4N_MCCB_4P": {
    model_code: "ABB T4N 250 4P", type: "MCCB", brand: "ABB",
    width_mm: 140, height_mm: 161, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 20,
    In_A: 250, Icu_kA: 36, pole: 4,
    heat_dissipation_watts: 40, weight_kg: 3.2,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
    price_vnd: 5200000,
  },

  // ═══════════════════════════════════════════════════════
  // SCHNEIDER — NSX MCCB, iC60N MCB
  // ═══════════════════════════════════════════════════════
  "SCHNEIDER_NSX100N_3P": {
    model_code: "Schneider NSX100N 3P", type: "MCCB", brand: "Schneider",
    width_mm: 105, height_mm: 161, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 20,
    In_A: 100, Icu_kA: 50, pole: 3,
    heat_dissipation_watts: 18, weight_kg: 2.2,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
    price_vnd: 3250000,
  },
  "SCHNEIDER_NSX160N_3P": {
    model_code: "Schneider NSX160N 3P", type: "MCCB", brand: "Schneider",
    width_mm: 105, height_mm: 161, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 20,
    In_A: 160, Icu_kA: 50, pole: 3,
    heat_dissipation_watts: 22, weight_kg: 2.4,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
    price_vnd: 4850000,
  },
  "SCHNEIDER_NSX250N_4P": {
    model_code: "Schneider NSX250N 4P", type: "MCCB", brand: "Schneider",
    width_mm: 140, height_mm: 161, depth_mm: 86,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 40, min_clearance_sides_mm: 20,
    In_A: 250, Icu_kA: 50, pole: 4,
    heat_dissipation_watts: 38, weight_kg: 3.5,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 145 },
    price_vnd: 8500000,
  },
  "SCHNEIDER_IC60N_MCB_1P": {
    model_code: "Schneider iC60N 1P", type: "MCB", brand: "Schneider",
    width_mm: 18, height_mm: 85, depth_mm: 74,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 1,
    heat_dissipation_watts: 2, weight_kg: 0.13,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 78 },
    price_vnd: 88000,
  },
  "SCHNEIDER_IC60N_MCB_3P": {
    model_code: "Schneider iC60N 3P", type: "MCB", brand: "Schneider",
    width_mm: 54, height_mm: 85, depth_mm: 74,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 3,
    heat_dissipation_watts: 5.5, weight_kg: 0.35,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 78 },
    price_vnd: 265000,
  },
  "SCHNEIDER_LC1D_CONTACTOR_3P": {
    model_code: "Schneider LC1D25 3P 25A", type: "CONTACTOR", brand: "Schneider",
    width_mm: 45, height_mm: 82, depth_mm: 77,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 5,
    In_A: 25, pole: 3,
    heat_dissipation_watts: 8, weight_kg: 0.46,
    terminal_positions: { inlet_y_offset_mm: 6, outlet_y_offset_mm: 75 },
    price_vnd: 485000,
  },

  // ═══════════════════════════════════════════════════════
  // CHINT — MCCB NXM, NM8
  // ═══════════════════════════════════════════════════════
  "CHINT_NXM100S_3P": {
    model_code: "CHINT NXM-100S 3P", type: "MCCB", brand: "CHINT",
    width_mm: 100, height_mm: 148, depth_mm: 78,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 15,
    In_A: 100, Icu_kA: 25, pole: 3,
    heat_dissipation_watts: 14, weight_kg: 1.7,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 135 },
    price_vnd: 1250000,
  },
  "CHINT_NXM250S_4P": {
    model_code: "CHINT NXM-250S 4P", type: "MCCB", brand: "CHINT",
    width_mm: 140, height_mm: 185, depth_mm: 95,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 35, min_clearance_sides_mm: 20,
    In_A: 250, Icu_kA: 35, pole: 4,
    heat_dissipation_watts: 35, weight_kg: 3.2,
    terminal_positions: { inlet_y_offset_mm: 15, outlet_y_offset_mm: 170 },
    price_vnd: 2850000,
  },
  "CHINT_NB1_MCB_1P": {
    model_code: "CHINT NB1-63 1P", type: "MCB", brand: "CHINT",
    width_mm: 18, height_mm: 80, depth_mm: 66,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 1,
    heat_dissipation_watts: 2, weight_kg: 0.10,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 74 },
    price_vnd: 42000,
  },
  "CHINT_NB1_MCB_3P": {
    model_code: "CHINT NB1-63 3P", type: "MCB", brand: "CHINT",
    width_mm: 54, height_mm: 80, depth_mm: 66,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 0,
    In_A: 63, Icu_kA: 6, pole: 3,
    heat_dissipation_watts: 5, weight_kg: 0.28,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 74 },
    price_vnd: 125000,
  },

  // ═══════════════════════════════════════════════════════
  // SPD — Surge Protection Device
  // ═══════════════════════════════════════════════════════
  "SPD_LS_3P": {
    model_code: "LS LSPD 3P+N", type: "SPD", brand: "LS Electric",
    width_mm: 72, height_mm: 90, depth_mm: 60,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 20, min_clearance_sides_mm: 10,
    heat_dissipation_watts: 2.5, weight_kg: 0.38,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 82 },
    price_vnd: 1250000,
  },

  // ═══════════════════════════════════════════════════════
  // CONTROL — PLC, Power Supply, Relay, Timer
  // ═══════════════════════════════════════════════════════
  "SIEMENS_S7_1200_PLC": {
    model_code: "Siemens S7-1200 CPU 1214C", type: "PLC", brand: "Siemens",
    width_mm: 110, height_mm: 100, depth_mm: 75,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 25, min_clearance_sides_mm: 15,
    heat_dissipation_watts: 15, weight_kg: 0.45,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 90 },
    price_vnd: 12500000,
  },
  "MEANWELL_24V_POWER_SUPPLY": {
    model_code: "Mean Well NDR-120-24", type: "POWER_SUPPLY", brand: "Mean Well",
    width_mm: 40, height_mm: 125, depth_mm: 113,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 30, min_clearance_sides_mm: 15,
    heat_dissipation_watts: 14, weight_kg: 0.6,
    terminal_positions: { inlet_y_offset_mm: 10, outlet_y_offset_mm: 115 },
    price_vnd: 1850000,
  },
  "OMRON_MY4N_RELAY": {
    model_code: "Omron MY4N-D2 24VDC", type: "RELAY", brand: "Omron",
    width_mm: 27, height_mm: 78, depth_mm: 64,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 10, min_clearance_sides_mm: 5,
    heat_dissipation_watts: 1.5, weight_kg: 0.08,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 70 },
    price_vnd: 185000,
  },
  "PANASONIC_SUL181D_TIMER": {
    model_code: "Panasonic SUL181d 24H", type: "TIMER", brand: "Panasonic",
    width_mm: 53.5, height_mm: 90, depth_mm: 60,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 15, min_clearance_sides_mm: 5,
    heat_dissipation_watts: 3, weight_kg: 0.18,
    terminal_positions: { inlet_y_offset_mm: 8, outlet_y_offset_mm: 82 },
    price_vnd: 350000,
  },

  // ═══════════════════════════════════════════════════════
  // DOOR INSTRUMENTS
  // ═══════════════════════════════════════════════════════
  "EMIC_V72_VOLTMETER": {
    model_code: "EMIC V72-2009", type: "VOLTMETER", brand: "EMIC",
    width_mm: 72, height_mm: 72, depth_mm: 65,
    mount_type: "door_panel",
    min_clearance_top_bottom_mm: 20, min_clearance_sides_mm: 20,
    heat_dissipation_watts: 2, weight_kg: 0.25,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 65 },
    cutout_mm: 67,
    price_vnd: 285000,
  },
  "EMIC_A72_AMMETER": {
    model_code: "EMIC A72-2009", type: "AMMETER", brand: "EMIC",
    width_mm: 72, height_mm: 72, depth_mm: 65,
    mount_type: "door_panel",
    min_clearance_top_bottom_mm: 20, min_clearance_sides_mm: 20,
    heat_dissipation_watts: 2, weight_kg: 0.25,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 65 },
    cutout_mm: 67,
    price_vnd: 285000,
  },
  "PILOT_LAMP_22MM": {
    model_code: "Đèn báo LED 22mm 220V", type: "PILOT_LAMP", brand: "EMIC",
    width_mm: 22, height_mm: 22, depth_mm: 40,
    mount_type: "door_panel",
    min_clearance_top_bottom_mm: 10, min_clearance_sides_mm: 10,
    heat_dissipation_watts: 0.5, weight_kg: 0.05,
    terminal_positions: { inlet_y_offset_mm: 3, outlet_y_offset_mm: 18 },
    cutout_mm: 22,
    price_vnd: 45000,
  },

  // ═══════════════════════════════════════════════════════
  // TERMINALS & ACCESSORIES
  // ═══════════════════════════════════════════════════════
  "PHOENIX_UT4_TERMINAL": {
    model_code: "Phoenix UT 4 Terminal", type: "TERMINAL", brand: "Phoenix Contact",
    width_mm: 6.2, height_mm: 47, depth_mm: 47.5,
    mount_type: "din_rail",
    min_clearance_top_bottom_mm: 10, min_clearance_sides_mm: 0,
    heat_dissipation_watts: 0.1, weight_kg: 0.01,
    terminal_positions: { inlet_y_offset_mm: 5, outlet_y_offset_mm: 42 },
    price_vnd: 18000,
  },

  // DIN RAIL
  "DIN_RAIL_35MM": {
    model_code: "DIN Rail 35mm EN60715", type: "DIN_RAIL", brand: "Generic",
    width_mm: 35, height_mm: 7.5, depth_mm: 1.2,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 0, min_clearance_sides_mm: 0,
    heat_dissipation_watts: 0, weight_kg: 0.08,
    terminal_positions: { inlet_y_offset_mm: 0, outlet_y_offset_mm: 7 },
    price_vnd: 35000,
  },

  // WIRING DUCT
  "WIRING_DUCT_40x60": {
    model_code: "Panduit F4x6IW6-A 40×60mm", type: "WIRING_DUCT", brand: "Panduit",
    width_mm: 40, height_mm: 60, depth_mm: 40,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 0, min_clearance_sides_mm: 0,
    heat_dissipation_watts: 0, weight_kg: 0.2,
    terminal_positions: { inlet_y_offset_mm: 0, outlet_y_offset_mm: 60 },
    price_vnd: 95000,
  },
  "WIRING_DUCT_60x60": {
    model_code: "Panduit F6x6IW6-A 60×60mm", type: "WIRING_DUCT", brand: "Panduit",
    width_mm: 60, height_mm: 60, depth_mm: 60,
    mount_type: "backplate",
    min_clearance_top_bottom_mm: 0, min_clearance_sides_mm: 0,
    heat_dissipation_watts: 0, weight_kg: 0.3,
    terminal_positions: { inlet_y_offset_mm: 0, outlet_y_offset_mm: 60 },
    price_vnd: 140000,
  },
};

/**
 * Get device physical spec - with brand-aware and current-aware matching.
 * Priority: exact model match → brand+type+pole → type+pole → generic fallback
 */
export function getComponentSpec(
  type: string,
  pole: number = 1,
  current: number = 16,
  brand?: string
): ComponentSpec {
  const upperType = (type || "").toUpperCase();
  const upperBrand = (brand || "").toUpperCase();

  // === ACB ===
  if (upperType === "ACB") {
    if (current >= 1000) return COMPONENT_LIBRARY["LS_ACB_1000_4P"];
    return COMPONENT_LIBRARY["LS_ACB_630_4P"];
  }

  // === MCCB — Brand-aware ===
  if (upperType === "MCCB") {
    if (upperBrand.includes("SCHNEIDER")) {
      if (pole >= 4) return COMPONENT_LIBRARY["SCHNEIDER_NSX250N_4P"];
      if (current >= 160) return COMPONENT_LIBRARY["SCHNEIDER_NSX160N_3P"];
      return COMPONENT_LIBRARY["SCHNEIDER_NSX100N_3P"];
    }
    if (upperBrand.includes("ABB")) {
      if (pole >= 4) return COMPONENT_LIBRARY["ABB_T4N_MCCB_4P"];
      if (current >= 160) return COMPONENT_LIBRARY["ABB_T3N_MCCB_3P"];
      return COMPONENT_LIBRARY["ABB_T1B_MCCB_3P"];
    }
    if (upperBrand.includes("CHINT")) {
      if (pole >= 4) return COMPONENT_LIBRARY["CHINT_NXM250S_4P"];
      return COMPONENT_LIBRARY["CHINT_NXM100S_3P"];
    }
    // LS Electric (default)
    if (current >= 400) return pole >= 4 ? COMPONENT_LIBRARY["LS_ABN403c_4P"] : COMPONENT_LIBRARY["LS_ABN403c_3P"];
    if (current >= 200) return COMPONENT_LIBRARY["LS_ABN203c_3P"];
    if (current >= 100) return pole >= 4 ? COMPONENT_LIBRARY["LS_ABN103c_4P"] : COMPONENT_LIBRARY["LS_ABN103c_3P"];
    return pole >= 3 ? COMPONENT_LIBRARY["LS_ABN52c_3P"] : COMPONENT_LIBRARY["LS_ABN52c_2P"];
  }

  // === MCB — Brand-aware ===
  if (upperType === "MCB" || upperType === "RCBO" || upperType === "RCCB") {
    if (upperType === "RCBO") return COMPONENT_LIBRARY["LS_RCBO_1PN_30mA"];
    if (upperBrand.includes("ABB")) {
      if (pole >= 3) return COMPONENT_LIBRARY["ABB_S200_MCB_3P"];
      if (pole === 2) return COMPONENT_LIBRARY["ABB_S200_MCB_2P"];
      return COMPONENT_LIBRARY["ABB_S200_MCB_1P"];
    }
    if (upperBrand.includes("SCHNEIDER")) {
      if (pole >= 3) return COMPONENT_LIBRARY["SCHNEIDER_IC60N_MCB_3P"];
      return COMPONENT_LIBRARY["SCHNEIDER_IC60N_MCB_1P"];
    }
    if (upperBrand.includes("CHINT")) {
      if (pole >= 3) return COMPONENT_LIBRARY["CHINT_NB1_MCB_3P"];
      return COMPONENT_LIBRARY["CHINT_NB1_MCB_1P"];
    }
    // LS Electric (default)
    if (pole >= 4) return COMPONENT_LIBRARY["LS_MCB_4P"];
    if (pole === 3) return COMPONENT_LIBRARY["LS_MCB_3P"];
    if (pole === 2) return COMPONENT_LIBRARY["LS_MCB_2P"];
    return COMPONENT_LIBRARY["LS_MCB_1P"];
  }

  // === SPD ===
  if (upperType === "SPD") return COMPONENT_LIBRARY["SPD_LS_3P"];

  // === CONTACTOR ===
  if (upperType === "CONTACTOR") {
    if (upperBrand.includes("SCHNEIDER")) return COMPONENT_LIBRARY["SCHNEIDER_LC1D_CONTACTOR_3P"];
    if (current >= 65) return COMPONENT_LIBRARY["LS_MC_65a"];
    if (current >= 40) return COMPONENT_LIBRARY["LS_MC_40a"];
    if (current >= 22) return COMPONENT_LIBRARY["LS_MC_22b"];
    return COMPONENT_LIBRARY["LS_MC_12b"];
  }

  // === PLC ===
  if (upperType === "PLC") return COMPONENT_LIBRARY["SIEMENS_S7_1200_PLC"];

  // === POWER SUPPLY ===
  if (upperType === "POWER_SUPPLY") return COMPONENT_LIBRARY["MEANWELL_24V_POWER_SUPPLY"];

  // === RELAY ===
  if (upperType === "RELAY") return COMPONENT_LIBRARY["OMRON_MY4N_RELAY"];

  // === TIMER ===
  if (upperType === "TIMER") return COMPONENT_LIBRARY["PANASONIC_SUL181D_TIMER"];

  // === INSTRUMENTS ===
  if (upperType === "VOLTMETER") return COMPONENT_LIBRARY["EMIC_V72_VOLTMETER"];
  if (upperType === "AMMETER") return COMPONENT_LIBRARY["EMIC_A72_AMMETER"];
  if (upperType === "PILOT_LAMP") return COMPONENT_LIBRARY["PILOT_LAMP_22MM"];

  // === TERMINAL ===
  if (upperType === "TERMINAL") return COMPONENT_LIBRARY["PHOENIX_UT4_TERMINAL"];

  // === DIN RAIL / DUCT ===
  if (upperType === "DIN_RAIL") return COMPONENT_LIBRARY["DIN_RAIL_35MM"];
  if (upperType === "WIRING_DUCT") return COMPONENT_LIBRARY["WIRING_DUCT_40x60"];

  // === Fallback to MCB ===
  if (pole === 2) return COMPONENT_LIBRARY["LS_MCB_2P"];
  if (pole >= 3) return COMPONENT_LIBRARY["LS_MCB_3P"];
  return COMPONENT_LIBRARY["LS_MCB_1P"];
}

/** Get total footprint width a device takes on DIN rail (device + clearance sides) */
export function getDeviceFootprintWidth(spec: ComponentSpec): number {
  return spec.width_mm + spec.min_clearance_sides_mm * 2;
}

/** Get total footprint height a device takes vertically (device + top/bottom clearance) */
export function getDeviceFootprintHeight(spec: ComponentSpec): number {
  return spec.height_mm + spec.min_clearance_top_bottom_mm * 2;
}
