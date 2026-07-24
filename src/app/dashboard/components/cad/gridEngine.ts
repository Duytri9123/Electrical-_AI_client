import { CADObject, CabinetType } from "./cadTypes";
import { CABINET_TEMPLATES } from "./templateEngine";

export interface GridInfrastructure {
  busbars: CADObject[];
  dinRails: CADObject[];
  wiringDucts: CADObject[];
  mountingPlate: CADObject;
  outerDoorFrame: CADObject;
  innerDoorFrame: CADObject;
}

/**
 * Calculates Infrastructure Grid (DIN Rails, Slotted Ducts, Busbars, Plates) deterministically
 */
export function generateInfrastructureGrid(
  width: number,
  height: number,
  depth: number,
  cabinetType: CabinetType,
  currentRating: number = 250
): GridInfrastructure {
  const template = CABINET_TEMPLATES[cabinetType] || CABINET_TEMPLATES.INDOOR_2_DOOR;
  const plateWidth = width - 80;
  const plateHeight = height - 100;
  const plateX = 40;
  const plateY = 50;

  // 1. Tấm Panel (Backplate)
  const mountingPlate: CADObject = {
    id: "mounting-plate-main",
    type: "rect",
    blockType: "PLATE",
    x: plateX,
    y: plateY,
    w: plateWidth,
    h: plateHeight,
    stroke: "#64748b",
    strokeWidth: 2,
    fill: "#0f172a",
    layer: "cabinet",
    label: `TẤM PANEL GÁ THIẾT BỊ (${plateWidth}x${plateHeight}mm)`,
  };

  // 2. Khung Cánh Ngoài & Cánh Trong
  const outerDoorFrame: CADObject = {
    id: "outer-door-main",
    type: "rect",
    blockType: "OUTER_DOOR",
    x: 5,
    y: 5,
    w: width - 10,
    h: height - 10,
    stroke: "#0284c7",
    strokeWidth: 2.5,
    fill: "transparent",
    layer: "cabinet",
    label: `MẶT CÁNH NGOÀI (${width}x${height}mm)`,
  };

  const innerDoorFrame: CADObject = {
    id: "inner-door-main",
    type: "rect",
    blockType: "INNER_DOOR",
    x: 47,
    y: 50,
    w: width - 94,
    h: height - 100,
    stroke: "#38bdf8",
    strokeWidth: 2,
    fill: "transparent",
    layer: "cabinet",
    label: `MẶT CÁNH TRONG MẬT ME (${width - 94}x${height - 100}mm)`,
  };

  // 3. Hệ Thanh Cái Đồng (Busbar System) R-S-T-N-PE
  const busbars: CADObject[] = [];
  const busbarY = plateY + 30;
  const busbarW = plateWidth - 80;
  const busbarH = currentRating > 400 ? 40 : 30;
  const busbarGap = currentRating > 400 ? 45 : 35;

  const phases = [
    { type: "BUSBAR_R", color: "#ef4444", label: "THANH CÁI PHA R (ĐỎ)" },
    { type: "BUSBAR_S", color: "#f59e0b", label: "THANH CÁI PHA S (VÀNG)" },
    { type: "BUSBAR_T", color: "#3b82f6", label: "THANH CÁI PHA T (XANH DƯƠNG)" },
    { type: "BUSBAR_N", color: "#1e293b", label: "THANH CÁI TRUNG TÍNH N (ĐEN)" },
    { type: "BUSBAR_PE", color: "#22c55e", label: "THANH CÁI TIẾP ĐỊA PE (XANH LÁ)" },
  ] as const;

  phases.forEach((p, idx) => {
    busbars.push({
      id: `busbar-${p.type.toLowerCase()}`,
      type: "busbar",
      blockType: p.type,
      x: plateX + 40,
      y: busbarY + idx * busbarGap,
      w: busbarW,
      h: busbarH,
      stroke: p.color,
      strokeWidth: 2,
      fill: p.color,
      layer: "busbar",
      label: `${p.label} - ${currentRating}A E-Cu`,
    });
  });

  // 4. Máng Nhựa Đi Dây Dọc (Vertical Ducts Left & Right)
  const wiringDucts: CADObject[] = [];
  const ductW = 40;

  // Máng dọc bên trái & bên phải
  wiringDucts.push({
    id: "duct-vert-left",
    type: "rect",
    blockType: "WIRING_DUCT",
    x: plateX + 10,
    y: plateY + 180,
    w: ductW,
    h: plateHeight - 240,
    stroke: "#94a3b8",
    strokeWidth: 1.5,
    fill: "#1e293b",
    layer: "cabinet",
    label: `MÁNG DỌC TRÁI ${ductW}x60mm`,
  });

  wiringDucts.push({
    id: "duct-vert-right",
    type: "rect",
    blockType: "WIRING_DUCT",
    x: plateX + plateWidth - 10 - ductW,
    y: plateY + 180,
    w: ductW,
    h: plateHeight - 240,
    stroke: "#94a3b8",
    strokeWidth: 1.5,
    fill: "#1e293b",
    layer: "cabinet",
    label: `MÁNG DỌC PHẢI ${ductW}x60mm`,
  });

  // 5. Thanh Ray DIN TS35 & Máng Nhựa Ngang (Horizontal Ducts)
  const dinRails: CADObject[] = [];
  const railStartX = plateX + 10 + ductW + 10;
  const railW = plateWidth - 20 - 2 * ductW - 20;

  // Lấy các vùng gá gá ray
  const dinZones = (template?.zones || []).filter(
    (z) => z.id === "ZONE_AUTOMATION_CONTROL" || z.id === "ZONE_SUB_BREAKER" || z.id === "ZONE_TERMINAL_BOTTOM"
  );

  dinZones.forEach((zone, index) => {
    const zoneCenterY = zone.yMin + (zone.yMax - zone.yMin) / 2;

    // Ray DIN 1
    dinRails.push({
      id: `din-rail-${index + 1}-a`,
      type: "rect",
      blockType: "DIN_RAIL",
      x: railStartX,
      y: zoneCenterY - 20,
      w: railW,
      h: 35,
      stroke: "#cbd5e1",
      strokeWidth: 1.5,
      fill: "#475569",
      layer: "cabinet",
      label: `RAY DIN TS35 - HÀNG 0${index + 1}`,
    });

    // Máng nhựa ngang bảo vệ phía dưới ray
    wiringDucts.push({
      id: `duct-horiz-${index + 1}`,
      type: "rect",
      blockType: "WIRING_DUCT",
      x: railStartX,
      y: zoneCenterY + 45,
      w: railW,
      h: ductW,
      stroke: "#94a3b8",
      strokeWidth: 1.5,
      fill: "#1e293b",
      layer: "cabinet",
      label: `MÁNG NGANG ${ductW}x60mm`,
    });
  });

  return {
    busbars,
    dinRails,
    wiringDucts,
    mountingPlate,
    outerDoorFrame,
    innerDoorFrame,
  };
}
