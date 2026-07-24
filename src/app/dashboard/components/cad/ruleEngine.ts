import { ComponentMetadata, CabinetZone, ElectricalBlockType } from "./cadTypes";
import { CABINET_TEMPLATES } from "./templateEngine";

export interface PlacementTarget {
  component: ComponentMetadata;
  targetView: "EQUIPMENT_PANEL" | "INNER_DOOR" | "OUTER_DOOR";
  zoneId?: string;
  suggestedX: number;
  suggestedY: number;
}

/**
 * Assigns components to their appropriate electrical zone and target view according to EPLAN/IEC design rules
 */
export function applyDesignRules(
  components: ComponentMetadata[],
  cabinetType: keyof typeof CABINET_TEMPLATES,
  cabinetWidth: number,
  cabinetHeight: number
): PlacementTarget[] {
  const template = CABINET_TEMPLATES[cabinetType] || CABINET_TEMPLATES.INDOOR_2_DOOR;
  const targets: PlacementTarget[] = [];

  // Group components by targetView
  const doorComponents = components.filter(
    (c) =>
      c.type === "VOLT_METER" ||
      c.type === "AMP_METER" ||
      c.type === "MULTI_METER" ||
      c.type === "SELECTOR_SWITCH" ||
      c.type === "PILOT_LAMP" ||
      c.type === "PUSH_BUTTON" ||
      c.type === "EMERGENCY_STOP" ||
      c.type === "HMI"
  );

  const panelComponents = components.filter((c) => !doorComponents.includes(c));

  // 1. Process Door Components (Inner Door Layout)
  const innerDoorRowYMap: Partial<Record<ElectricalBlockType, number>> & Record<string, number> = {
    VOLT_METER: 180,
    AMP_METER: 180,
    MULTI_METER: 180,
    SELECTOR_SWITCH: 180,
    PILOT_LAMP: 380,
    PUSH_BUTTON: 580,
    EMERGENCY_STOP: 580,
    HMI: 300,
    CABINET: 0,
    OUTER_DOOR: 0,
    INNER_DOOR: 0,
    PLATE: 0,
    DIN_RAIL: 0,
    WIRING_DUCT: 0,
    MCCB: 0,
    MCB: 0,
    CONTACTOR: 0,
    RELAY: 0,
    PLC: 0,
    TERMINAL_STRIP: 0,
    FAN_LOUVER: 0,
    BUSBAR_R: 0,
    BUSBAR_S: 0,
    BUSBAR_T: 0,
    BUSBAR_N: 0,
    BUSBAR_PE: 0,
  };

  doorComponents.forEach((comp) => {
    const targetY = innerDoorRowYMap[comp.type] || 380;
    targets.push({
      component: comp,
      targetView: "INNER_DOOR",
      suggestedX: cabinetWidth / 2 - (comp.width ?? comp.width_mm ?? 100) / 2,
      suggestedY: targetY,
    });
  });

  // 2. Process Panel Components (Power Top, Control Center, Terminal Bottom)
  panelComponents.forEach((comp) => {
    let targetZone: CabinetZone | undefined;

    if (comp.type === "MCCB" || comp.type.startsWith("BUSBAR")) {
      targetZone = template.zones.find((z) => z.id === "ZONE_BUSBAR_MAIN");
    } else if (comp.type === "PLC" || comp.type === "RELAY") {
      targetZone = template.zones.find((z) => z.id === "ZONE_AUTOMATION_CONTROL");
    } else if (comp.type === "MCB" || comp.type === "CONTACTOR") {
      targetZone = template.zones.find((z) => z.id === "ZONE_SUB_BREAKER");
    } else if (comp.type === "TERMINAL_STRIP") {
      targetZone = template.zones.find((z) => z.id === "ZONE_TERMINAL_BOTTOM");
    }

    if (!targetZone) {
      targetZone = template.zones[0];
    }

    const zoneCenterY = targetZone.yMin + (targetZone.yMax - targetZone.yMin) / 2;

    const compW = comp.width ?? comp.width_mm ?? 100;
    const compH = comp.height ?? comp.height_mm ?? 100;

    targets.push({
      component: comp,
      targetView: "EQUIPMENT_PANEL",
      zoneId: targetZone.id,
      suggestedX: cabinetWidth / 2 - compW / 2,
      suggestedY: zoneCenterY - compH / 2,
    });
  });

  return targets;
}
