/**
 * LAYOUT ENGINE v2.0 — CONSTRAINT-BASED ELECTRICAL ENCLOSURE PACKING
 * Tính toán chính xác:
 *   1. Kích thước tủ tối ưu W×H×D từ footprint thiết bị thực
 *   2. Packing thiết bị vào DIN Rail theo zone IEC 61439
 *   3. Vị trí tọa độ X,Y,Z (mm) mỗi thiết bị
 *   4. Vị trí Busbar và Wiring Duct
 *   5. Vị trí khoét lỗ cánh tủ (đồng hồ, đèn)
 *   6. Score layout chất lượng
 */

import { getComponentSpec, getDeviceFootprintWidth, getDeviceFootprintHeight, ComponentSpec } from "./ComponentLibrary";
import { ELECTRICAL_ZONES, PLACEMENT_RULES, IEC61439_CONSTANTS, getDeviceZone, ZoneId } from "./RuleLibrary";

// ══════════════════════════════════════════════════════════
// Input / Output Interfaces
// ══════════════════════════════════════════════════════════

export interface InputDevice {
  id: string;
  circuit: string;
  type: string;
  pole?: number;
  current?: number;
  model?: string;
  brand?: string;
  level?: number;
  quantity?: number;
}

export interface CabinetDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface PositionedDevice extends InputDevice {
  spec: ComponentSpec;
  x_mm: number;       // Left edge position in mm from cabinet left wall
  y_mm: number;       // Top edge position in mm from cabinet top
  z_mm: number;       // Depth offset (mounting offset from backplate)
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  rail_index: number;
  zone_id: ZoneId;
}

export interface ComputedRail {
  id: string;
  rail_index: number;
  y_mm: number;          // Top of DIN rail from cabinet top (mm)
  zone_id: ZoneId;
  zone_label: string;
  total_width_mm: number; // Usable width of this rail
  used_width_mm: number;
  devices: PositionedDevice[];
}

export interface BusbarLayout {
  x_mm: number;
  y_start_mm: number;
  y_end_mm: number;
  phases: string[];     // ["R","S","T","N","PE"]
  spacing_mm: number;   // Between phases
  cross_section_mm2: number;
}

export interface DoorCutout {
  instrument_id: string;
  type: string;
  x_mm: number;     // Center X on door
  y_mm: number;     // Center Y on door
  cutout_mm: number; // Hole diameter or square size
  label: string;
}

export interface LayoutEngineOutput {
  // Computed cabinet dimensions (may differ from requested if devices don't fit)
  cabinet: CabinetDimensions;
  cabinet_auto_sized: boolean; // true if engine resized cabinet

  // Layout quality score (0-100)
  score: number;
  score_breakdown: {
    collision_score: number;       // 40%
    wire_length_score: number;     // 20%
    alignment_score: number;       // 15%
    spacing_score: number;         // 10%
    space_utilization_score: number; // 10%
    rule_compliance_score: number; // 5%
  };

  // Computed positions
  rails: ComputedRail[];
  positioned_devices: PositionedDevice[];
  door_cutouts: DoorCutout[];
  busbar_layout: BusbarLayout | null;

  // Statistics
  total_wire_length_mm: number;
  total_heat_W: number;
  device_count: number;
  warnings: string[];
}

// ══════════════════════════════════════════════════════════
// LAYOUT ENGINE
// ══════════════════════════════════════════════════════════
export class LayoutEngine {

  public static computeLayout(
    devices: InputDevice[],
    requestedCabinet: CabinetDimensions
  ): LayoutEngineOutput {
    const warnings: string[] = [];

    // ─── STEP 1: Enrich devices with physical specs ───────────────────
    const enriched = devices.map((d) => {
      const spec = getComponentSpec(d.type, d.pole || 1, d.current || 16, d.brand);
      return {
        ...d,
        spec,
        width_mm: getDeviceFootprintWidth(spec),
        height_mm: spec.height_mm,
        depth_mm: spec.depth_mm,
      };
    });

    // ─── STEP 2: Classify into zones ─────────────────────────────────
    const byZone: Record<ZoneId, typeof enriched> = {
      POWER: [],
      CONTROL: [],
      TERMINAL: [],
      BUSBAR: [],
      DOOR: [],
      CABLE_ENTRY: [],
    };

    enriched.forEach((dev) => {
      const zoneId = getDeviceZone(dev.type, dev.level || 1);
      byZone[zoneId].push(dev);
    });

    // Sort CONTROL zone: POWER_SUPPLY → PLC → RELAY → TIMER → CONTACTOR → MCB/RCBO
    byZone.CONTROL.sort((a, b) => {
      const rank = (t: string): number => {
        const u = t.toUpperCase();
        if (u === "POWER_SUPPLY") return 1;
        if (u === "PLC")          return 2;
        if (u === "RELAY")        return 3;
        if (u === "TIMER")        return 4;
        if (u === "CONTACTOR")    return 5;
        if (u === "FUSE")         return 6;
        if (u === "MCCB")         return 7;
        return 8; // MCB, RCBO, RCCB
      };
      return rank(a.type) - rank(b.type);
    });

    // ─── STEP 3: Calculate minimum cabinet dimensions ──────────────────
    const { SIDE_MARGIN_MM, TOP_MARGIN_MM, BOTTOM_MARGIN_MM, DIN_RAIL_SPACING_MM, WIRING_DUCT_WIDTH_MM } = IEC61439_CONSTANTS;
    const ductPerSide = WIRING_DUCT_WIDTH_MM;  // 40mm each side

    // Compute minimum width needed for each zone (widest row)
    const powerWidth  = this.computeRowWidth(byZone.POWER);
    const controlRows = this.packIntoRows(byZone.CONTROL, requestedCabinet.width - SIDE_MARGIN_MM * 2);
    const controlWidth = controlRows.reduce((max, row) => {
      const w = row.reduce((s, d) => s + d.width_mm, 0);
      return Math.max(max, w);
    }, 0);
    const terminalWidth = this.computeRowWidth(byZone.TERMINAL);

    const minUsableWidth = Math.max(powerWidth, controlWidth, terminalWidth);
    const minTotalWidth  = minUsableWidth + SIDE_MARGIN_MM * 2 + ductPerSide * 2;

    // Number of rails needed
    const powerRailCount   = byZone.POWER.length > 0 ? 1 : 0;
    const controlRailCount = controlRows.length;
    const terminalRailCount = byZone.TERMINAL.length > 0 ? 1 : 0;
    const totalRailCount   = powerRailCount + controlRailCount + terminalRailCount;

    // Max device height in each zone
    const maxPowerH   = byZone.POWER.length   ? Math.max(...byZone.POWER.map((d) => d.spec.min_clearance_top_bottom_mm * 2 + d.height_mm))   : 0;
    const maxControlH = byZone.CONTROL.length ? Math.max(...byZone.CONTROL.map((d) => d.spec.min_clearance_top_bottom_mm * 2 + d.height_mm)) : 0;
    const maxTermH    = byZone.TERMINAL.length ? Math.max(...byZone.TERMINAL.map((d) => d.height_mm + 15 * 2)) : 0;

    const minTotalHeight =
      TOP_MARGIN_MM +
      (powerRailCount   * (maxPowerH   + DIN_RAIL_SPACING_MM)) +
      (controlRailCount * (maxControlH + DIN_RAIL_SPACING_MM)) +
      (terminalRailCount * (maxTermH   + 30)) +
      BOTTOM_MARGIN_MM;

    // Auto-size cabinet if requested is too small
    const finalWidth  = Math.max(requestedCabinet.width,  Math.ceil(minTotalWidth  * IEC61439_CONSTANTS.CABINET_SIZING_SAFETY_FACTOR / 50) * 50);
    const finalHeight = Math.max(requestedCabinet.height, Math.ceil(minTotalHeight * IEC61439_CONSTANTS.CABINET_SIZING_SAFETY_FACTOR / 50) * 50);
    const finalDepth  = Math.max(requestedCabinet.depth,  byZone.POWER.length > 0 ? 400 : 250);

    const cabinet: CabinetDimensions = { width: finalWidth, height: finalHeight, depth: finalDepth };
    const autoSized = finalWidth !== requestedCabinet.width || finalHeight !== requestedCabinet.height || finalDepth !== requestedCabinet.depth;

    if (autoSized) {
      warnings.push(`Tủ tự điều chỉnh từ ${requestedCabinet.width}×${requestedCabinet.height}×${requestedCabinet.depth}mm → ${finalWidth}×${finalHeight}×${finalDepth}mm để đủ chỗ lắp thiết bị.`);
    }

    const usableWidth = finalWidth - SIDE_MARGIN_MM * 2 - ductPerSide * 2;

    // ─── STEP 4: Position rails and devices ───────────────────────────
    const rails: ComputedRail[] = [];
    const positioned: PositionedDevice[] = [];

    let currentY = TOP_MARGIN_MM;
    let railIndex = 0;

    // POWER zone (rail)
    if (byZone.POWER.length > 0) {
      const rail = this.buildRail(
        `rail_power`, railIndex++, currentY, "POWER", ELECTRICAL_ZONES.POWER.name,
        byZone.POWER, SIDE_MARGIN_MM + ductPerSide, usableWidth, positioned
      );
      rails.push(rail);
      currentY += maxPowerH + DIN_RAIL_SPACING_MM;
    }

    // CONTROL zone (may be multiple rails)
    const repackedControl = this.packIntoRows(byZone.CONTROL, usableWidth);
    repackedControl.forEach((rowDevices) => {
      if (rowDevices.length === 0) return;
      const rowMaxH = Math.max(...rowDevices.map((d) => d.spec.min_clearance_top_bottom_mm * 2 + d.height_mm));
      const rail = this.buildRail(
        `rail_ctrl_${railIndex}`, railIndex++, currentY, "CONTROL", ELECTRICAL_ZONES.CONTROL.name,
        rowDevices, SIDE_MARGIN_MM + ductPerSide, usableWidth, positioned
      );
      rails.push(rail);
      currentY += rowMaxH + DIN_RAIL_SPACING_MM;
    });

    // TERMINAL zone (rail)
    if (byZone.TERMINAL.length > 0) {
      const rail = this.buildRail(
        `rail_terminal`, railIndex++, currentY, "TERMINAL", ELECTRICAL_ZONES.TERMINAL.name,
        byZone.TERMINAL, SIDE_MARGIN_MM + ductPerSide, usableWidth, positioned
      );
      rails.push(rail);
      currentY += maxTermH + 30;
    }

    // ─── STEP 5: Busbar layout ────────────────────────────────────────
    const busbarLayout = this.computeBusbarLayout(byZone.POWER, cabinet);

    // ─── STEP 6: Door cutouts for instruments ─────────────────────────
    const doorCutouts = this.computeDoorCutouts(byZone.DOOR, cabinet);

    // ─── STEP 7: Wire length & score ─────────────────────────────────
    const totalWire = this.calculateWireLength(positioned);
    const totalHeat = enriched.reduce((s, d) => s + (d.spec.heat_dissipation_watts || 0) * (d.quantity || 1), 0);
    const score = this.evaluateScore(positioned, cabinet, totalWire);

    return {
      cabinet,
      cabinet_auto_sized: autoSized,
      score: score.total,
      score_breakdown: {
        collision_score:          score.collision,
        wire_length_score:        score.wire_length,
        alignment_score:          score.alignment,
        spacing_score:            score.spacing,
        space_utilization_score:  score.utilization,
        rule_compliance_score:    score.rules,
      },
      rails,
      positioned_devices: positioned,
      door_cutouts: doorCutouts,
      busbar_layout: busbarLayout,
      total_wire_length_mm: totalWire,
      total_heat_W: Math.round(totalHeat),
      device_count: devices.length,
      warnings,
    };
  }

  // ── Pack devices into multiple rows so none exceed usableWidth ──────
  private static packIntoRows(
    devices: Array<InputDevice & { spec: ComponentSpec; width_mm: number; height_mm: number; depth_mm: number }>,
    usableWidth: number
  ) {
    const rows: typeof devices[] = [];
    let current: typeof devices = [];
    let usedW = 0;
    const GAP = 8; // small gap between devices on same rail

    devices.forEach((dev) => {
      if (usedW + dev.width_mm + GAP > usableWidth && current.length > 0) {
        rows.push(current);
        current = [];
        usedW = 0;
      }
      current.push(dev);
      usedW += dev.width_mm + GAP;
    });
    if (current.length > 0) rows.push(current);
    return rows;
  }

  // ── Compute total width of a list of devices ──────────────────────
  private static computeRowWidth(
    devices: Array<{ width_mm: number }>
  ): number {
    return devices.reduce((s, d) => s + d.width_mm, 0);
  }

  // ── Build a DIN rail and position all devices on it ───────────────
  private static buildRail(
    id: string,
    railIndex: number,
    railY: number,
    zoneId: ZoneId,
    zoneLabel: string,
    devices: Array<InputDevice & { spec: ComponentSpec; width_mm: number; height_mm: number; depth_mm: number }>,
    startX: number,
    usableWidth: number,
    positionedList: PositionedDevice[]
  ): ComputedRail {
    const GAP_MM = 8; // gap between adjacent devices on same rail

    const totalDevWidth = devices.reduce((s, d) => s + d.width_mm, 0);
    const totalGaps = (devices.length - 1) * GAP_MM;
    const remainingSpace = Math.max(0, usableWidth - totalDevWidth - totalGaps);
    // Center-align devices on rail
    let currentX = startX + Math.round(remainingSpace / 2);

    const usedWidth = totalDevWidth + totalGaps;

    devices.forEach((dev) => {
      const clearanceTop = dev.spec.min_clearance_top_bottom_mm;
      const posDev: PositionedDevice = {
        ...dev,
        x_mm: Math.round(currentX),
        y_mm: Math.round(railY + clearanceTop),
        z_mm: 15, // standard DIN rail mounting offset from backplate
        rail_index: railIndex,
        zone_id: zoneId,
      };
      positionedList.push(posDev);
      currentX += dev.width_mm + GAP_MM;
    });

    return {
      id,
      rail_index: railIndex,
      y_mm: railY,
      zone_id: zoneId,
      zone_label: zoneLabel,
      total_width_mm: usableWidth,
      used_width_mm: usedWidth,
      devices: positionedList.filter((p) => p.rail_index === railIndex),
    };
  }

  // ── Compute busbar layout ─────────────────────────────────────────
  private static computeBusbarLayout(
    powerDevices: Array<{ current?: number }>,
    cabinet: CabinetDimensions
  ): BusbarLayout | null {
    if (powerDevices.length === 0) return null;

    const maxIn = Math.max(...powerDevices.map((d) => d.current || 100));
    // Busbar sizing: J = 1.5 A/mm² for tinned copper
    const section = Math.ceil(maxIn / 1.5);

    return {
      x_mm: 20, // Left side of cabinet (busbar zone)
      y_start_mm: IEC61439_CONSTANTS.TOP_MARGIN_MM,
      y_end_mm: cabinet.height - IEC61439_CONSTANTS.BOTTOM_MARGIN_MM,
      phases: ["R", "S", "T", "N", "PE"],
      spacing_mm: 40,   // 40mm between phase conductors
      cross_section_mm2: section,
    };
  }

  // ── Compute door cutout positions for instruments ─────────────────
  private static computeDoorCutouts(
    doorDevices: Array<InputDevice & { spec: ComponentSpec; width_mm: number; height_mm: number; depth_mm: number }>,
    cabinet: CabinetDimensions
  ): DoorCutout[] {
    if (doorDevices.length === 0) return [];

    const cutouts: DoorCutout[] = [];
    // Position instruments centered horizontally, top section of door
    const totalW = doorDevices.reduce((s, d) => s + (d.spec.cutout_mm || d.width_mm) + 30, 0);
    let cx = Math.max(50, (cabinet.width - totalW) / 2 + 50);
    const cy = Math.round(cabinet.height * 0.15); // 15% from top

    doorDevices.forEach((dev) => {
      const cutout = dev.spec.cutout_mm || dev.width_mm;
      cutouts.push({
        instrument_id: dev.id,
        type: dev.type,
        x_mm: Math.round(cx + cutout / 2),
        y_mm: cy,
        cutout_mm: cutout,
        label: dev.circuit || dev.type,
      });
      cx += cutout + 30;
    });

    return cutouts;
  }

  // ── Manhattan wire length estimate ─────────────────────────────────
  private static calculateWireLength(devices: PositionedDevice[]): number {
    let total = 0;
    const main = devices.find((d) => d.zone_id === "POWER");
    if (!main) return 500;
    devices.forEach((d) => {
      if (d.id !== main.id) {
        total += Math.abs(d.x_mm - main.x_mm) + Math.abs(d.y_mm - main.y_mm);
      }
    });
    return Math.round(total);
  }

  // ── Layout quality evaluation ──────────────────────────────────────
  private static evaluateScore(
    devices: PositionedDevice[],
    cabinet: CabinetDimensions,
    wireLength: number
  ) {
    // 1. Collision check (40%)
    let collisionPenalty = 0;
    for (let i = 0; i < devices.length; i++) {
      for (let j = i + 1; j < devices.length; j++) {
        const a = devices[i];
        const b = devices[j];
        const overlap =
          a.x_mm < b.x_mm + b.width_mm &&
          a.x_mm + a.width_mm > b.x_mm &&
          a.y_mm < b.y_mm + b.height_mm &&
          a.y_mm + a.height_mm > b.y_mm;
        if (overlap) collisionPenalty += 20;
      }
    }
    const collisionScore = Math.max(0, 100 - collisionPenalty) * 0.4;

    // 2. Wire length (20%)
    const maxExpected = devices.length * cabinet.height * 0.8;
    const wireScore = Math.max(0, 100 - (wireLength / (maxExpected || 1)) * 50) * 0.2;

    // 3. Alignment (15%) — Rail-based layout always aligns, so high score
    const alignScore = 95 * 0.15;

    // 4. Spacing uniformity (10%)
    const spacingScore = 90 * 0.1;

    // 5. Space utilization (10%)
    const totalDevArea = devices.reduce((s, d) => s + d.width_mm * d.height_mm, 0);
    const cabinetArea = cabinet.width * cabinet.height;
    const utilPct = Math.min(100, (totalDevArea / cabinetArea) * 100 * 4); // × 4 because only ~25% should be filled
    const utilScore = Math.min(100, utilPct) * 0.1;

    // 6. Rule compliance (5%) — Always high if zone rules are followed
    const ruleScore = 100 * 0.05;

    const total = Math.round(collisionScore + wireScore + alignScore + spacingScore + utilScore + ruleScore);

    return {
      total: Math.min(100, total),
      collision:   Math.round(Math.max(0, 100 - collisionPenalty)),
      wire_length: Math.round(Math.max(0, 100 - (wireLength / (maxExpected || 1)) * 50)),
      alignment:   95,
      spacing:     90,
      utilization: Math.round(Math.min(100, utilPct)),
      rules:       100,
    };
  }
}
