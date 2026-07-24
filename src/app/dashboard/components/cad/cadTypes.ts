export type ViewType = "FRONT" | "DOOR" | "EQUIPMENT" | "SIDE" | "TOP" | "BOTTOM" | "SECTION";
export type CabinetType = "MSB_FORM_2B" | "FORM_2B_MSB" | "INDOOR_2DOOR" | "INDOOR_2_DOOR" | "OUTDOOR_2_DOOR" | "OUTDOOR_2DOOR" | "WALL_MOUNT_1_DOOR" | "WALL_MOUNT_1DOOR" | "FACADE_DB_1P" | "HORIZONTAL_DB" | "VERTICAL_PAN_VDB";

export interface CabinetZone {
  id: string;
  name: string;
  yMin: number;
  yMax: number;
  targetTypes?: string[];
  preferredHeight?: number;
}

export type ElectricalBlockType = 
  | "MCCB" 
  | "MCB" 
  | "ACB" 
  | "PLC" 
  | "RELAY" 
  | "TIMER" 
  | "CONTACTOR" 
  | "TERMINAL" 
  | "TERMINAL_STRIP" 
  | "SPD" 
  | "BUSBAR"
  | "BUSBAR_R"
  | "BUSBAR_S"
  | "BUSBAR_T"
  | "BUSBAR_N"
  | "BUSBAR_PE"
  | "VOLT_METER"
  | "AMP_METER"
  | "MULTI_METER"
  | "SELECTOR_SWITCH"
  | "PILOT_LAMP"
  | "PUSH_BUTTON"
  | "EMERGENCY_STOP"
  | "HMI"
  | "CABINET"
  | "OUTER_DOOR"
  | "INNER_DOOR"
  | "PLATE"
  | "DIN_RAIL"
  | "WIRING_DUCT"
  | "FAN_LOUVER";

export interface ProjectInfo {
  projectName: string;
  customer: string;
  drawingTitle: string;
  drawingNumber: string;
  scale: string;
  sheetSize: string;
  designer?: string;
  approver?: string;
  material?: string;
  paintColor?: string;
  date?: string;
  revision?: string;
}

export interface CabinetDimensions {
  width: number;
  height: number;
  depth: number;
  type?: CabinetType;
  plinthHeight?: number;
  sheetMetalThickness?: number;
  color?: string;
}

// BƯỚC 1: ELECTRICAL GRAPH (AI Extract Topology - Pure Electrical Connections)
export interface ElectricalConnection {
  from: string;
  to: string;
  signalType?: "POWER" | "CONTROL" | "SIGNAL";
  cableSpec?: string;
}

export interface ElectricalGraph {
  devices: DeviceSpec[];
  connections: ElectricalConnection[];
}

// BƯỚC 3: DESIGN JSON (AI Output - Design Intent WITHOUT X, Y Coordinates!)
export interface DesignDeviceIntent {
  id: string;
  type: ElectricalBlockType;
  preferredZone?: "POWER" | "CONTROL" | "TERMINAL";
  circuit?: string;
  current?: number;
  model?: string;
  brand?: string;
}

export interface DesignJSON {
  projectInfo: ProjectInfo;
  cabinet: CabinetDimensions;
  electricalGraph?: ElectricalGraph;
  devices: DesignDeviceIntent[];
}

// BƯỚC 6: LAYOUT JSON (Computed by Engine WITH exact X, Y, Z, W, H, D Coordinates!)
export interface PositionedDevice {
  id: string;
  type: ElectricalBlockType;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  zone: string;
  mountType: "din_rail" | "backplate" | "door";
  circuit?: string;
  current?: number;
}

export interface LayoutJSON {
  cabinet: CabinetDimensions;
  positionedDevices: PositionedDevice[];
  score: number;
  collisions: number;
  totalWireLength: number;
}

export interface DeviceSpec {
  id: string;
  type: string;
  circuit?: string;
  current?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface ComponentMetadata {
  model_code: string;
  type: ElectricalBlockType;
  brand: string;
  width_mm?: number;
  height_mm?: number;
  depth_mm?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export interface CADObject {
  id: string;
  type: string;
  blockType?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  layer?: string;
  label?: string;
}

export interface PanelJSON {
  projectInfo?: ProjectInfo;
  cabinet?: CabinetDimensions;
  devices?: DeviceSpec[];
  components?: any[];
}

export interface CADEntity {
  type: "RECT" | "LINE" | "CIRCLE" | "TEXT";
  x: number;
  y: number;
  w?: number;
  h?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  text?: string;
  color?: string;
}

export interface CADView {
  title: string;
  viewType: ViewType;
  entities: CADEntity[];
}

export interface CADDocument {
  title: string;
  metadata?: {
    projectName?: string;
    drawingTitle?: string;
    drawingNumber?: string;
    scale?: string;
    sheetSize?: string;
    customer?: string;
    material?: string;
    paintColor?: string;
  };
  projections?: any[];
  bomTable?: any[];
  views: CADView[];
}
