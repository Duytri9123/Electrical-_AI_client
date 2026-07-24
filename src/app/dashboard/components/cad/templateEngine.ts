import { CabinetType, CabinetZone, ElectricalBlockType } from "./cadTypes";

export interface CabinetTemplate {
  type: CabinetType;
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  hasInnerDoor: boolean;
  hasOuterDoorGlass: boolean;
  hasSideLouvers: boolean;
  hasTopFan: boolean;
  hasBottomGlandPlate: boolean;
  plinthHeight: number;
  zones: CabinetZone[];
  innerDoorRows: {
    y: number;
    title: string;
    allowedTypes: ElectricalBlockType[];
  }[];
}

export const CABINET_TEMPLATES: Partial<Record<CabinetType, CabinetTemplate>> & Record<string, CabinetTemplate> = {
  INDOOR_2_DOOR: {
    type: "INDOOR_2_DOOR",
    name: "Tủ Điện 2 Cánh Trong Nhà (Tiêu chuẩn 1.5mm)",
    defaultWidth: 800,
    defaultHeight: 1500,
    defaultDepth: 500,
    hasInnerDoor: true,
    hasOuterDoorGlass: true,
    hasSideLouvers: true,
    hasTopFan: true,
    hasBottomGlandPlate: true,
    plinthHeight: 100,
    zones: [
      {
        id: "ZONE_BUSBAR_MAIN",
        name: "Power & Main Switch Zone (MCCB / Busbars)",
        yMin: 80,
        yMax: 350,
        targetTypes: ["MCCB", "BUSBAR_R", "BUSBAR_S", "BUSBAR_T", "BUSBAR_N", "BUSBAR_PE"],
        preferredHeight: 270,
      },
      {
        id: "ZONE_AUTOMATION_CONTROL",
        name: "Automation & Control Zone (PLC / Relays / Power Supply)",
        yMin: 360,
        yMax: 700,
        targetTypes: ["PLC", "HMI", "RELAY"],
        preferredHeight: 340,
      },
      {
        id: "ZONE_SUB_BREAKER",
        name: "Sub-Breakers & Starters Zone (MCB / Contactors)",
        yMin: 710,
        yMax: 1100,
        targetTypes: ["MCB", "CONTACTOR"],
        preferredHeight: 390,
      },
      {
        id: "ZONE_TERMINAL_BOTTOM",
        name: "Terminal Block & Gland Zone (X1 Bottom Strip)",
        yMin: 1110,
        yMax: 1350,
        targetTypes: ["TERMINAL_STRIP"],
        preferredHeight: 240,
      },
    ],
    innerDoorRows: [
      {
        y: 180,
        title: "Row 1: Metering (Voltmeter, Ammeter, Selectors)",
        allowedTypes: ["VOLT_METER", "AMP_METER", "MULTI_METER", "SELECTOR_SWITCH"],
      },
      {
        y: 380,
        title: "Row 2: Annunciator & Phase Indicator (R-S-T Lamps)",
        allowedTypes: ["PILOT_LAMP"],
      },
      {
        y: 580,
        title: "Row 3: Control Buttons (Start/Stop/Emergency)",
        allowedTypes: ["PUSH_BUTTON", "EMERGENCY_STOP"],
      },
    ],
  },
  OUTDOOR_2_DOOR: {
    type: "OUTDOOR_2_DOOR",
    name: "Tủ Điện 2 Cánh Ngoài Trời (Mái che mưa & Xốp cách nhiệt)",
    defaultWidth: 900,
    defaultHeight: 1800,
    defaultDepth: 600,
    hasInnerDoor: true,
    hasOuterDoorGlass: false,
    hasSideLouvers: true,
    hasTopFan: true,
    hasBottomGlandPlate: true,
    plinthHeight: 100,
    zones: [
      {
        id: "ZONE_BUSBAR_MAIN",
        name: "Main Incomer Zone (ACB / MCCB & Heavy Busbars)",
        yMin: 100,
        yMax: 450,
        targetTypes: ["MCCB", "BUSBAR_R", "BUSBAR_S", "BUSBAR_T", "BUSBAR_N", "BUSBAR_PE"],
        preferredHeight: 350,
      },
      {
        id: "ZONE_SUB_BREAKER",
        name: "Distribution Feeders Zone (MCCB / MCB Branch)",
        yMin: 460,
        yMax: 950,
        targetTypes: ["MCCB", "MCB", "CONTACTOR"],
        preferredHeight: 490,
      },
      {
        id: "ZONE_AUTOMATION_CONTROL",
        name: "Control & Relay Protection Zone",
        yMin: 960,
        yMax: 1350,
        targetTypes: ["PLC", "RELAY"],
        preferredHeight: 390,
      },
      {
        id: "ZONE_TERMINAL_BOTTOM",
        name: "Heavy Duty Terminal Zone",
        yMin: 1360,
        yMax: 1650,
        targetTypes: ["TERMINAL_STRIP"],
        preferredHeight: 290,
      },
    ],
    innerDoorRows: [
      {
        y: 200,
        title: "Row 1: Heavy Metering (Multimeters & CT Selectors)",
        allowedTypes: ["MULTI_METER", "VOLT_METER", "AMP_METER", "SELECTOR_SWITCH"],
      },
      {
        y: 420,
        title: "Row 2: Status Pilot Lamps",
        allowedTypes: ["PILOT_LAMP"],
      },
      {
        y: 640,
        title: "Row 3: Local Control Station",
        allowedTypes: ["PUSH_BUTTON", "EMERGENCY_STOP"],
      },
    ],
  },
  WALL_MOUNT_1_DOOR: {
    type: "WALL_MOUNT_1_DOOR",
    name: "Tủ Điện 1 Cánh Treo Tường (Wall Mount Box)",
    defaultWidth: 600,
    defaultHeight: 800,
    defaultDepth: 250,
    hasInnerDoor: false,
    hasOuterDoorGlass: false,
    hasSideLouvers: false,
    hasTopFan: false,
    hasBottomGlandPlate: true,
    plinthHeight: 0,
    zones: [
      {
        id: "ZONE_MAIN",
        name: "Main Incomer (MCCB)",
        yMin: 60,
        yMax: 220,
        targetTypes: ["MCCB"],
        preferredHeight: 160,
      },
      {
        id: "ZONE_BRANCH",
        name: "Branch Circuits (MCB & Relay)",
        yMin: 230,
        yMax: 550,
        targetTypes: ["MCB", "CONTACTOR", "RELAY"],
        preferredHeight: 320,
      },
      {
        id: "ZONE_TERMINAL",
        name: "Terminal Block",
        yMin: 560,
        yMax: 700,
        targetTypes: ["TERMINAL_STRIP"],
        preferredHeight: 140,
      },
    ],
    innerDoorRows: [],
  },
  FORM_2B_MSB: {
    type: "FORM_2B_MSB",
    name: "Tủ Điện Phân Phối Form 2b (Chuyên dụng nhà máy)",
    defaultWidth: 1000,
    defaultHeight: 2000,
    defaultDepth: 800,
    hasInnerDoor: true,
    hasOuterDoorGlass: true,
    hasSideLouvers: true,
    hasTopFan: true,
    hasBottomGlandPlate: true,
    plinthHeight: 100,
    zones: [
      {
        id: "ZONE_BUSBAR_TOP",
        name: "Top Busbar Chamber (1000A - 2500A)",
        yMin: 80,
        yMax: 350,
        targetTypes: ["BUSBAR_R", "BUSBAR_S", "BUSBAR_T", "BUSBAR_N", "BUSBAR_PE"],
        preferredHeight: 270,
      },
      {
        id: "ZONE_MCCB_MAIN",
        name: "Main Circuit Breaker Chamber",
        yMin: 360,
        yMax: 850,
        targetTypes: ["MCCB"],
        preferredHeight: 490,
      },
      {
        id: "ZONE_MCCB_BRANCH",
        name: "Branch Distribution Breakers",
        yMin: 860,
        yMax: 1550,
        targetTypes: ["MCCB", "MCB", "CONTACTOR"],
        preferredHeight: 690,
      },
      {
        id: "ZONE_TERMINAL_BOTTOM",
        name: "Bottom Cable Termination Chamber",
        yMin: 1560,
        yMax: 1850,
        targetTypes: ["TERMINAL_STRIP"],
        preferredHeight: 290,
      },
    ],
    innerDoorRows: [
      {
        y: 220,
        title: "Metering & Power Quality Analyzer",
        allowedTypes: ["MULTI_METER", "VOLT_METER", "AMP_METER", "SELECTOR_SWITCH"],
      },
      {
        y: 450,
        title: "Protection Indicators & Alarms",
        allowedTypes: ["PILOT_LAMP"],
      },
    ],
  },
};
