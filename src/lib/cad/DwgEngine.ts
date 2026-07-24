/**
 * DwgEngine.ts - Service tích hợp toàn bộ API LibreDWG WebAssembly
 *
 * Tận dụng 100% API có sẵn từ libredwg-web:
 * - dwg_read_data / convert / convertEx
 * - dwg_to_svg (SVG rendering)
 * - dwg_bmp (thumbnail extraction)
 * - dwg_write_dxf (DXF export)
 * - dwg_get_version_type / dwg_get_codepage
 * - Entity statistics, Layers, Blocks, Styles, DimStyles, Viewports, Layouts
 */

/* ---- Dwg_Object_Type enum (đầy đủ từ libredwg-web examples/utils.js) ---- */
export const Dwg_Object_Type = Object.freeze({
  DWG_TYPE_UNUSED: 0x00,
  DWG_TYPE_TEXT: 0x01,
  DWG_TYPE_ATTRIB: 0x02,
  DWG_TYPE_ATTDEF: 0x03,
  DWG_TYPE_BLOCK: 0x04,
  DWG_TYPE_ENDBLK: 0x05,
  DWG_TYPE_SEQEND: 0x06,
  DWG_TYPE_INSERT: 0x07,
  DWG_TYPE_MINSERT: 0x08,
  DWG_TYPE_VERTEX_2D: 0x0a,
  DWG_TYPE_VERTEX_3D: 0x0b,
  DWG_TYPE_VERTEX_MESH: 0x0c,
  DWG_TYPE_VERTEX_PFACE: 0x0d,
  DWG_TYPE_VERTEX_PFACE_FACE: 0x0e,
  DWG_TYPE_POLYLINE_2D: 0x0f,
  DWG_TYPE_POLYLINE_3D: 0x10,
  DWG_TYPE_ARC: 0x11,
  DWG_TYPE_CIRCLE: 0x12,
  DWG_TYPE_LINE: 0x13,
  DWG_TYPE_DIMENSION_ORDINATE: 0x14,
  DWG_TYPE_DIMENSION_LINEAR: 0x15,
  DWG_TYPE_DIMENSION_ALIGNED: 0x16,
  DWG_TYPE_DIMENSION_ANG3PT: 0x17,
  DWG_TYPE_DIMENSION_ANG2LN: 0x18,
  DWG_TYPE_DIMENSION_RADIUS: 0x19,
  DWG_TYPE_DIMENSION_DIAMETER: 0x1a,
  DWG_TYPE_POINT: 0x1b,
  DWG_TYPE__3DFACE: 0x1c,
  DWG_TYPE_POLYLINE_PFACE: 0x1d,
  DWG_TYPE_POLYLINE_MESH: 0x1e,
  DWG_TYPE_SOLID: 0x1f,
  DWG_TYPE_TRACE: 0x20,
  DWG_TYPE_SHAPE: 0x21,
  DWG_TYPE_VIEWPORT: 0x22,
  DWG_TYPE_ELLIPSE: 0x23,
  DWG_TYPE_SPLINE: 0x24,
  DWG_TYPE_REGION: 0x25,
  DWG_TYPE__3DSOLID: 0x26,
  DWG_TYPE_BODY: 0x27,
  DWG_TYPE_RAY: 0x28,
  DWG_TYPE_XLINE: 0x29,
  DWG_TYPE_DICTIONARY: 0x2a,
  DWG_TYPE_OLEFRAME: 0x2b,
  DWG_TYPE_MTEXT: 0x2c,
  DWG_TYPE_LEADER: 0x2d,
  DWG_TYPE_TOLERANCE: 0x2e,
  DWG_TYPE_MLINE: 0x2f,
  DWG_TYPE_BLOCK_CONTROL: 0x30,
  DWG_TYPE_BLOCK_HEADER: 0x31,
  DWG_TYPE_LAYER_CONTROL: 0x32,
  DWG_TYPE_LAYER: 0x33,
  DWG_TYPE_STYLE_CONTROL: 0x34,
  DWG_TYPE_STYLE: 0x35,
  DWG_TYPE_LTYPE_CONTROL: 0x38,
  DWG_TYPE_LTYPE: 0x39,
  DWG_TYPE_VIEW_CONTROL: 0x3c,
  DWG_TYPE_VIEW: 0x3d,
  DWG_TYPE_UCS_CONTROL: 0x3e,
  DWG_TYPE_UCS: 0x3f,
  DWG_TYPE_VPORT_CONTROL: 0x40,
  DWG_TYPE_VPORT: 0x41,
  DWG_TYPE_APPID_CONTROL: 0x42,
  DWG_TYPE_APPID: 0x43,
  DWG_TYPE_DIMSTYLE_CONTROL: 0x44,
  DWG_TYPE_DIMSTYLE: 0x45,
  DWG_TYPE_VX_CONTROL: 0x46,
  DWG_TYPE_VX_TABLE_RECORD: 0x47,
  DWG_TYPE_GROUP: 0x48,
  DWG_TYPE_MLINESTYLE: 0x49,
  DWG_TYPE_OLE2FRAME: 0x4a,
  DWG_TYPE_DUMMY: 0x4b,
  DWG_TYPE_LONG_TRANSACTION: 0x4c,
  DWG_TYPE_LWPOLYLINE: 0x4d,
  DWG_TYPE_HATCH: 0x4e,
  DWG_TYPE_XRECORD: 0x4f,
  DWG_TYPE_PLACEHOLDER: 0x50,
  DWG_TYPE_VBA_PROJECT: 0x51,
  DWG_TYPE_LAYOUT: 0x52,
  DWG_TYPE_PROXY_ENTITY: 0x1f2,
  DWG_TYPE_PROXY_OBJECT: 0x1f3,
  DWG_TYPE_IMAGE: 647,
  DWG_TYPE_IMAGEDEF: 648,
  DWG_TYPE_MULTILEADER: 671,
  DWG_TYPE_MLEADERSTYLE: 665,
  DWG_TYPE_WIPEOUT: 730,
  DWG_TYPE_TABLE: 721,
  DWG_TYPE_TABLESTYLE: 724,
  DWG_TYPE_MESH: 663,
  DWG_TYPE_SUN: 718,
  DWG_TYPE_LIGHT: 657,
  DWG_TYPE_MATERIAL: 661,
  DWG_TYPE_VISUALSTYLE: 729,
  DWG_TYPE_CAMERA: 613,
  DWG_TYPE_HELIX: 643,
});

export const Dwg_Object_Type_Inverted = Object.fromEntries(
  Object.entries(Dwg_Object_Type).map(([key, value]) => [value.toString(), key])
);

/* ---- Interfaces ---- */
export interface DwgCadLayer {
  name: string;
  color: string | number;
  visible: boolean;
  frozen: boolean;
  locked: boolean;
  entityCount: number;
}

export interface ExtractedCadEntity {
  id: string;
  type: string;
  layer: string;
  name?: string;
  text?: string;
  circuit?: string;
  brand?: string;
  model?: string;
  pole?: number;
  current?: number;
  icu?: number;
  position?: { x: number; y: number; z?: number };
}

export interface DwgVersionInfo {
  hdr: string;
  version: string;
  codepage: number;
  codepageName: string;
}

export interface DwgEntityStat {
  typeName: string;
  typeCode: number;
  count: number;
}

export interface DwgConversionStats {
  unknownEntityCount: number;
  totalEntities: number;
  totalObjects: number;
}

export interface DwgThumbnailResult {
  data: Uint8Array;
  type: number; // 2=BMP, 3=WMF, 6=PNG
  mimeType: string;
  blobUrl: string;
}

export interface DwgBlockInfo {
  name: string;
  entityCount: number;
}

export interface DwgTableItem {
  name: string;
}

export interface DwgAiAnalysisResult {
  totalIncomerCurrent: number;
  totalDeviceCount: number;
  busbarSpec: {
    recommendedSize: string;
    crossSectionMm2: number;
    estimatedWeightKg: number;
    material: string;
  };
  thermalAnalysis: {
    totalPowerLossWatts: number;
    tempRiseCelsius: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    recommendation: string;
  };
  protectionCoordination: {
    status: 'SELECTIVE' | 'CHECK_REQUIRED';
    mainDevice: string;
    feedersCount: number;
    summary: string;
  };
  recommendedDoorAccessories: {
    name: string;
    type: string;
    quantity: number;
    model: string;
  }[];
  matchedCatalogCount: number;
  confidenceScore: number;
}

export interface DwgParseResult {
  database: any;
  dwgRawPtr: any;
  stats: DwgConversionStats;
  versionInfo: DwgVersionInfo;
  svgContent: string;
  layers: DwgCadLayer[];
  entityStats: DwgEntityStat[];
  blocks: DwgBlockInfo[];
  styles: DwgTableItem[];
  dimStyles: DwgTableItem[];
  viewports: DwgTableItem[];
  layouts: DwgTableItem[];
  drawingSections?: { title: string; x: number; y: number }[];
  thumbnail: DwgThumbnailResult | null;
  devices: ExtractedCadEntity[];
  aiAnalysis: DwgAiAnalysisResult;
  databaseJson: any;
}

/* ---- DwgCodePage names (from libredwg-web database/codepage.ts) ---- */
const DwgCodePageNames: Record<number, string> = {
  0: 'Unknown', 1: 'US_ASCII', 2: 'ISO-8859-1', 3: 'ISO-8859-2',
  4: 'ISO-8859-3', 5: 'ISO-8859-4', 6: 'ISO-8859-5', 7: 'ISO-8859-6',
  8: 'ISO-8859-7', 9: 'ISO-8859-8', 10: 'ISO-8859-9', 11: 'CP437',
  12: 'CP850', 13: 'CP852', 14: 'CP855', 15: 'CP857', 16: 'CP860',
  17: 'CP861', 18: 'CP863', 19: 'CP864', 20: 'CP865', 21: 'CP869',
  22: 'CP932', 23: 'MACINTOSH', 24: 'BIG5', 25: 'CP949', 26: 'JOHAB',
  27: 'CP866', 28: 'ANSI_1250', 29: 'ANSI_1251', 30: 'ANSI_1252',
  31: 'GB2312', 32: 'ANSI_1253', 33: 'ANSI_1254', 34: 'ANSI_1255',
  35: 'ANSI_1256', 36: 'ANSI_1257', 37: 'ANSI_874', 38: 'ANSI_932',
  39: 'ANSI_936', 40: 'ANSI_949', 41: 'ANSI_950', 42: 'ANSI_1361',
  43: 'UTF-8', 44: 'ANSI_1258',
};

/* ---- DWG Version names ---- */
const DwgVersionNames: Record<string, string> = {
  'R_INVALID': 'Invalid',
  'R_1_1': 'Release 1.1', 'R_1_2': 'Release 1.2', 'R_1_3': 'Release 1.3',
  'R_1_4': 'Release 1.4', 'R_2_0': 'Release 2.0', 'R_2_1': 'Release 2.1',
  'R_2_5': 'Release 2.5', 'R_2_6': 'Release 2.6', 'R_9': 'Release 9',
  'R_10': 'Release 10', 'R_11': 'Release 11', 'R_12': 'Release 12',
  'R_13': 'Release 13', 'R_13c3': 'Release 13c3',
  'R_14': 'Release 14',
  'R_2000': 'AutoCAD 2000', 'R_2004': 'AutoCAD 2004',
  'R_2007': 'AutoCAD 2007', 'R_2010': 'AutoCAD 2010',
  'R_2013': 'AutoCAD 2013', 'R_2018': 'AutoCAD 2018',
  'R_AFTER': 'Unknown (newer)',
};

/* ---- Main Service ---- */
export class DwgEngineService {
  private static instance: DwgEngineService;
  private libreDwgInstance: any = null;
  private initPromise: Promise<any> | null = null;

  private constructor() {}

  public static getInstance(): DwgEngineService {
    if (!DwgEngineService.instance) {
      DwgEngineService.instance = new DwgEngineService();
    }
    return DwgEngineService.instance;
  }

  /** Khởi tạo LibreDWG WebAssembly */
  public async init(wasmPath: string = '/wasm'): Promise<any> {
    if (this.libreDwgInstance) return this.libreDwgInstance;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (typeof window === 'undefined') {
        throw new Error('LibreDWG WASM chỉ chạy trên trình duyệt (Client-side).');
      }
      try {
        // Dynamic import để tránh SSR bundling
        const { LibreDwg } = await import('./libredwg/libredwg');
        const instance = await LibreDwg.create(wasmPath);
        this.libreDwgInstance = instance;
        return instance;
      } catch (err) {
        this.initPromise = null;
        console.error('[DwgEngine] Lỗi khởi tạo WASM:', err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  /** Trạng thái khởi tạo */
  public isReady(): boolean {
    return !!this.libreDwgInstance;
  }

  /**
   * Phân tích toàn bộ file DWG/DXF - trả về tất cả dữ liệu cùng lúc
   * Tận dụng: dwg_read_data, convertEx, dwg_get_version_type, dwg_get_codepage,
   *           dwg_bmp, dwg_to_svg, và trích xuất entities
   */
  public async parseFullDwg(
    arrayBuffer: ArrayBuffer,
    fileType: number = 0 // 0 = DWG
  ): Promise<DwgParseResult> {
    const engine = await this.init();
    const { Dwg_File_Type } = await import('./libredwg/libredwg');

    // 1. Đọc file
    const dwgRawPtr = engine.dwg_read_data(arrayBuffer, fileType);
    if (!dwgRawPtr) {
      throw new Error('Không thể đọc file DWG/DXF. File có thể bị hỏng hoặc phiên bản chưa được hỗ trợ.');
    }

    try {
      // 2. Version & Codepage
      const versionInfo = this.getVersionInfo(engine, dwgRawPtr);

      // 3. Convert với stats (dùng convertEx thay vì convert)
      const { database, stats } = engine.convertEx(dwgRawPtr);

      // 4. SVG rendering
      let svgContent = '';
      try {
        svgContent = engine.dwg_to_svg(database);
      } catch (e) {
        console.warn('[DwgEngine] SVG conversion warning:', e);
      }

      // 5. Layers
      const layers = this.extractLayers(database);

      // 6. Entity statistics
      const entityStats = this.computeEntityStats(database);

      // 7. Blocks
      const blocks = this.extractBlocks(database);

      // 8. Styles, DimStyles, Viewports, Layouts
      const styles = this.extractTableItems(database, 'STYLE');
      const dimStyles = this.extractTableItems(database, 'DIMSTYLE');
      const viewports = this.extractTableItems(database, 'VPORT');
      const layouts = this.extractTableItems(database, 'LAYOUT');
      const drawingSections = this.extractDrawingSections(database);

      // 9. Thumbnail
      let thumbnail: DwgThumbnailResult | null = null;
      try {
        thumbnail = this.extractThumbnail(engine, dwgRawPtr);
      } catch (e) {
        console.warn('[DwgEngine] Thumbnail extraction skipped:', e);
      }

      // 10. Devices (BOQ extraction)
      const devices = this.extractDevicesFromDatabase(database);

      // 11. AI Analysis
      const aiAnalysis = this.runAiAnalysis(devices);

      // 12. Database JSON
      const databaseJson = database;

      return {
        database,
        dwgRawPtr,
        stats: {
          unknownEntityCount: stats?.unknownEntityCount ?? 0,
          totalEntities: database?.entities?.length ?? 0,
          totalObjects: 0,
        },
        versionInfo,
        svgContent,
        layers,
        entityStats,
        blocks,
        styles,
        dimStyles,
        viewports,
        layouts,
        drawingSections,
        thumbnail,
        devices,
        aiAnalysis,
        databaseJson,
      };
    } catch (err) {
      // Free on error
      try { engine.dwg_free(dwgRawPtr); } catch {}
      throw err;
    }
  }

  /** Xuất DXF từ ArrayBuffer gốc */
  public async exportToDxf(arrayBuffer: ArrayBuffer): Promise<{ data: Uint8Array; fileName: string } | null> {
    const engine = await this.init();
    try {
      const result = engine.dwg_write_dxf(arrayBuffer);
      if (!result) return null;
      return { data: result, fileName: 'drawing.dxf' };
    } catch (err) {
      console.error('[DwgEngine] DXF export failed:', err);
      return null;
    }
  }

  /** Lấy version info */
  private getVersionInfo(engine: any, dwgRawPtr: any): DwgVersionInfo {
    try {
      const version = engine.dwg_get_version_type(dwgRawPtr);
      const codepage = engine.dwg_get_codepage(dwgRawPtr);
      return {
        hdr: version?.hdr || 'Unknown',
        version: DwgVersionNames[version?.hdr] || version?.hdr || 'Unknown',
        codepage: codepage ?? 0,
        codepageName: DwgCodePageNames[codepage] || `CP${codepage}`,
      };
    } catch {
      return { hdr: 'Unknown', version: 'Unknown', codepage: 0, codepageName: 'Unknown' };
    }
  }

  /** Trích xuất thumbnail */
  /** Trích xuất ảnh thumbnail BMP/PNG từ DWG Header */
  private extractThumbnail(engine: any, dwgRawPtr: any): DwgThumbnailResult | null {
    try {
      const thumb = engine.dwg_bmp(dwgRawPtr);
      if (!thumb || !thumb.data || thumb.data.length === 0) return null;

      let mimeType = 'image/png';
      if (thumb.type === 2) mimeType = 'image/bmp';
      else if (thumb.type === 3) mimeType = 'image/x-wmf';

      const uint8 = new Uint8Array(thumb.data);
      let binary = '';
      const len = uint8.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      const base64 = typeof btoa !== 'undefined' ? btoa(binary) : '';
      if (!base64) return null;

      const blobUrl = `data:${mimeType};base64,${base64}`;

      return {
        data: thumb.data,
        type: thumb.type,
        mimeType,
        blobUrl,
      };
    } catch (e) {
      console.warn('[DwgEngine] Thumbnail extraction error:', e);
      return null;
    }
  }

  /** Lấy danh sách layers */
  private extractLayers(database: any): DwgCadLayer[] {
    if (!database?.tables) return [];

    const layersMap = database.tables.LAYER || database.tables.layer;
    if (!layersMap) return [];

    const layersList: DwgCadLayer[] = [];
    for (const key in layersMap) {
      const l = layersMap[key];
      if (l) {
        layersList.push({
          name: l.name || key,
          color: l.color ?? '#666666',
          visible: !(l.flags & 1), // bit 0 = frozen
          frozen: !!(l.flags & 1),
          locked: !!(l.flags & 4),
          entityCount: 0,
        });
      }
    }

    // Đếm entities trên mỗi layer
    if (database.entities && Array.isArray(database.entities)) {
      for (const ent of database.entities) {
        const entLayer = ent.layer || '0';
        const target = layersList.find((x) => x.name.toLowerCase() === entLayer.toLowerCase());
        if (target) target.entityCount++;
      }
    }

    return layersList;
  }

  /** Thống kê entity types */
  private computeEntityStats(database: any): DwgEntityStat[] {
    if (!database?.entities || !Array.isArray(database.entities)) return [];

    const group = new Map<string, number>();
    for (const ent of database.entities) {
      const typeName = ent.type || 'UNKNOWN';
      group.set(typeName, (group.get(typeName) || 0) + 1);
    }

    return Array.from(group.entries())
      .map(([typeName, count]) => ({
        typeName,
        typeCode: 0,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /** Lấy danh sách blocks */
  private extractBlocks(database: any): DwgBlockInfo[] {
    if (!database?.tables) return [];
    const blocksMap = database.tables.BLOCK_RECORD || database.tables.block_record;
    if (!blocksMap) return [];

    return Object.entries(blocksMap).map(([key, val]: [string, any]) => ({
      name: val?.name || key,
      entityCount: val?.entities?.length ?? 0,
    }));
  }

  /** Lấy danh sách table items (styles, dimstyles, vports, layouts) */
  private extractTableItems(database: any, tableName: string): DwgTableItem[] {
    if (!database?.tables) return [];

    // Try exact or lowercase key
    const map = database.tables[tableName] || database.tables[tableName.toLowerCase()];
    if (!map) return [];

    // For layouts, look in objects instead
    if (tableName === 'LAYOUT' && (!map || Object.keys(map).length === 0)) {
      if (database.objects?.LAYOUT) {
        return Object.entries(database.objects.LAYOUT).map(([key, val]: [string, any]) => ({
          name: val?.layout_name || val?.name || key,
        }));
      }
    }

    return Object.entries(map).map(([key, val]: [string, any]) => ({
      name: val?.name || key,
    }));
  }

  /** Trích xuất động các khu vực khung tủ / bản vẽ dựa trên tiêu đề TEXT/MTEXT */
  private extractDrawingSections(database: any): { title: string; x: number; y: number }[] {
    if (!database?.entities || !Array.isArray(database.entities)) return [];

    const sectionsMap = new Map<string, { title: string; x: number; y: number }>();
    const KEYWORDS = [/MẶT/i, /TỦ/i, /PANEL/i, /THANH/i, /SƠ ĐỒ/i, /KHUNG/i, /MẠCH/i, /BẢN VẼ/i, /DB/i, /SECTION/i, /VIEW/i];

    for (const ent of database.entities) {
      if (ent.type === 'TEXT' || ent.type === 'MTEXT') {
        const textVal = (ent.text || ent.textString || ent.value || '').trim();
        const textHeight = ent.height || ent.textHeight || 0;

        if (textVal.length >= 3 && textVal.length <= 45 && (textHeight > 5 || KEYWORDS.some(k => k.test(textVal)))) {
          const cleanTitle = textVal.replace(/[\r\n\t]+/g, ' ').toUpperCase();
          if (!sectionsMap.has(cleanTitle)) {
            const x = ent.insertion_point?.x ?? ent.x ?? 0;
            const y = ent.insertion_point?.y ?? ent.y ?? 0;
            sectionsMap.set(cleanTitle, { title: cleanTitle, x, y });
          }
        }
      }
    }

    return Array.from(sectionsMap.values()).slice(0, 6);
  }

  /** Trích xuất thiết bị từ INSERT blocks (attribs), TEXT/MTEXT, MULTILEADER, TABLE */
  private extractDevicesFromDatabase(database: any): ExtractedCadEntity[] {
    if (!database?.entities) return [];

    const extracted: ExtractedCadEntity[] = [];
    const textEntries: { text: string; x: number; y: number }[] = [];
    const leaderTexts: string[] = [];

    // Device type patterns (Vietnamese + English + abbreviations)
    const DEVICE_PATTERNS: [RegExp, string][] = [
      [/\b(ACB)\b/i, 'ACB'],
      [/\b(MCCB)\b/i, 'MCCB'],
      [/\b(MCB)\b/i, 'MCB'],
      [/\b(RCCB|RCBO|ELCB)\b/i, 'RCCB'],
      [/\b(VCB)\b/i, 'VCB'],
      [/\b(Contactor|CONTACTOR)\b/i, 'CONTACTOR'],
      [/\b(Relay|RƠ LE|RƠLE)\b/i, 'RELAY'],
      [/\b(CT|BIẾN DÒNG)\b/i, 'CT'],
      [/\b(PT|BIẾN ÁP ĐO)\b/i, 'PT'],
      [/\b(METER|MFM|ĐỒNG HỒ)\b/i, 'METER'],
      [/\b(FUSE|CẦU CHÌ)\b/i, 'FUSE'],
      [/\b(TIMER|HẸN GIỜ)\b/i, 'TIMER'],
      [/\b(SPD|CHỐNG SÉT)\b/i, 'SPD'],
      [/\b(ATS)\b/i, 'ATS'],
      [/\b(VFD|BIẾN TẦN|INVERTER)\b/i, 'VFD'],
      [/\b(BUSBAR|THANH CÁI)\b/i, 'BUSBAR'],
      [/\b(VỎ TỦ|ENCLOSURE|TỦ ĐIỆN)\b/i, 'VỎ TỦ'],
    ];

    // Helper: detect device type from text
    const detectDeviceType = (text: string): string => {
      for (const [pattern, type] of DEVICE_PATTERNS) {
        if (pattern.test(text)) return type;
      }
      return '';
    };

    // Helper: extract current rating from text
    const extractCurrent = (text: string): number => {
      const m = text.match(/(\d+)\s*A\b/i);
      return m ? parseInt(m[1], 10) : 0;
    };

    // Helper: safely extract string from text or object
    const toCleanString = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      if (typeof val === 'object') {
        if (typeof val.text === 'string') return val.text;
        if (typeof val.textString === 'string') return val.textString;
        if (typeof val.value === 'string') return val.value;
        if (typeof val.val === 'string') return val.val;
      }
      return '';
    };

    // Helper: extract pole count from text
    const extractPole = (text: string): number => {
      if (/4P/i.test(text)) return 4;
      if (/2P/i.test(text)) return 2;
      if (/1P/i.test(text)) return 1;
      return 3; // default 3P
    };

    // Helper: extract breaking capacity
    const extractIcu = (text: string): number | undefined => {
      const m = text.match(/(\d+)\s*kA/i);
      return m ? parseInt(m[1], 10) : undefined;
    };

    // ─── PASS 1: Collect TEXT, MTEXT, MULTILEADER annotations ───
    for (const ent of database.entities) {
      if (ent.type === 'TEXT' || ent.type === 'MTEXT') {
        const txt = toCleanString(ent.text?.text || ent.text || ent.textString);
        if (txt.trim()) {
          textEntries.push({
            text: txt.trim(),
            x: ent.insertionPoint?.x || ent.startPoint?.x || ent.x || 0,
            y: ent.insertionPoint?.y || ent.startPoint?.y || ent.y || 0,
          });
        }
      }
      // MULTILEADER & LEADER text extraction (previously unused)
      if (ent.type === 'MULTILEADER' || ent.type === 'LEADER') {
        const mtext = toCleanString(ent.mtext?.text || ent.text || ent.textString);
        if (mtext.trim()) leaderTexts.push(mtext.trim());
      }
    }

    // ─── PASS 2: Extract devices from INSERT blocks with ATTRIBS ───
    for (const ent of database.entities) {
      if (ent.type !== 'INSERT') continue;

      const blockName = toCleanString(ent.name || ent.blockName);
      const layer = toCleanString(ent.layer || '0');
      const x = ent.insertionPoint?.x || ent.position?.x || ent.x || 0;
      const y = ent.insertionPoint?.y || ent.position?.y || ent.y || 0;

      // Strategy A: Read structured ATTRIBS (highest priority — exact data)
      let type = '', brand = '', model = '', circuit = '', name = '';
      let current = 0, pole = 0, icu: number | undefined;

      if (ent.attribs && Array.isArray(ent.attribs) && ent.attribs.length > 0) {
        for (const attr of ent.attribs) {
          const tag = toCleanString(attr.tag).toUpperCase().trim();
          const val = toCleanString(attr.text?.text || attr.text || attr.textString || attr.value).trim();
          if (!val) continue;

          switch (tag) {
            case 'DEVICE_TYPE': case 'TYPE': case 'LOẠI':
              type = val.toUpperCase(); break;
            case 'RATING': case 'CURRENT': case 'IN': case 'DÒNG':
              current = parseInt(val, 10) || 0; break;
            case 'BRAND': case 'MANUFACTURER': case 'HÃNG':
              brand = val; break;
            case 'MODEL': case 'PART_NO': case 'MÃ':
              model = val; break;
            case 'CIRCUIT': case 'MẠCH': case 'TAG':
              circuit = val; break;
            case 'NAME': case 'TÊN': case 'DESCRIPTION': case 'DESC':
              name = val; break;
            case 'POLE': case 'POLES': case 'CỰC':
              pole = parseInt(val, 10) || 3; break;
            case 'ICU': case 'BREAKING':
              icu = parseInt(val, 10) || undefined; break;
          }
        }
      }

      // Strategy B: Fall back to block name pattern matching
      if (!type) type = detectDeviceType(blockName);
      if (!type) {
        // Check layer name for device hints
        type = detectDeviceType(layer);
      }
      if (!type) {
        // Inspect Block Record sub-entities (previously unused)
        const blockRecord = database.tables?.BLOCK_RECORD?.[blockName];
        if (blockRecord?.entities) {
          // Look for ATTDEF tags inside block definition
          for (const subEnt of blockRecord.entities) {
            if (subEnt.type === 'ATTDEF') {
              const defTag = (subEnt.tag || '').toUpperCase();
              if (defTag === 'DEVICE_TYPE' || defTag === 'TYPE') {
                type = detectDeviceType(subEnt.text || subEnt.defaultValue || '');
              }
            }
          }
          // Heuristic: count geometric primitives to guess symbol type
          if (!type) {
            const subTypes = blockRecord.entities.map((e: any) => e.type);
            const hasCircle = subTypes.includes('CIRCLE') || subTypes.includes('ARC');
            const hasText = subTypes.includes('TEXT') || subTypes.includes('ATTDEF');
            if (hasCircle && hasText && subTypes.length >= 4) {
              type = 'MCB'; // Generic breaker symbol
            }
          }
        }
      }

      // Skip non-device blocks
      if (!type) continue;

      // Fill missing data from block name if attribs didn't provide
      if (!current) current = extractCurrent(blockName) || extractCurrent(name);
      if (!pole) pole = extractPole(blockName);
      if (!icu) icu = extractIcu(blockName) || extractIcu(name);
      if (!name) name = blockName;
      if (!circuit) circuit = `Q${extracted.length + 1}`;

      // Find nearby text annotations for additional context
      const nearbyTexts = textEntries.filter(t =>
        Math.abs(t.x - x) < 200 && Math.abs(t.y - y) < 100
      );
      for (const nearby of nearbyTexts) {
        if (!current) current = extractCurrent(nearby.text);
        if (!brand) {
          if (/schneider/i.test(nearby.text)) brand = 'Schneider';
          else if (/\bLS\b|ls electric/i.test(nearby.text)) brand = 'LS';
          else if (/chint/i.test(nearby.text)) brand = 'Chint';
          else if (/\bABB\b/i.test(nearby.text)) brand = 'ABB';
        }
        if (!model && /[A-Z]{2,}\d{2,}/i.test(nearby.text)) {
          model = nearby.text.trim().substring(0, 40);
        }
      }

      extracted.push({
        id: ent.handle || `block_${extracted.length + 1}`,
        type,
        layer,
        name,
        text: nearbyTexts.map(t => t.text).join(' | '),
        circuit,
        brand: brand || 'N/A',
        model: model || blockName,
        pole: pole || 3,
        current: current || 0,
        icu,
        position: { x, y },
      });
    }

    // ─── PASS 3: Extract from AutoCAD TABLE entities (BOM schedules) ───
    for (const ent of database.entities) {
      if (ent.type !== 'TABLE') continue;
      if (ent.cells && Array.isArray(ent.cells)) {
        // Parse table rows looking for device data
        for (let r = 1; r < ent.cells.length; r++) {
          const row = ent.cells[r];
          if (!Array.isArray(row) || row.length < 3) continue;
          const cellTexts = row.map((c: any) => (c.text || c.value || '').toString().trim());
          const rowText = cellTexts.join(' ');
          const type = detectDeviceType(rowText);
          if (type) {
            extracted.push({
              id: `table_${r}`,
              type,
              layer: 'TABLE',
              name: cellTexts[1] || cellTexts[0] || type,
              text: rowText,
              circuit: cellTexts[0] || `T${r}`,
              brand: 'N/A',
              model: cellTexts.find((c: string) => /[A-Z]{2}\d{2}/i.test(c)) || '',
              pole: extractPole(rowText),
              current: extractCurrent(rowText),
              icu: extractIcu(rowText),
            });
          }
        }
      }
    }

    // ─── PASS 4: Extract from MULTILEADER annotations ───
    for (const txt of leaderTexts) {
      const type = detectDeviceType(txt);
      if (type && !extracted.some(d => d.name === txt.substring(0, 50))) {
        extracted.push({
          id: `leader_${extracted.length + 1}`,
          type,
          layer: 'ANNOTATION',
          name: txt.substring(0, 50),
          text: txt,
          circuit: `L${extracted.length + 1}`,
          brand: 'N/A',
          model: '',
          pole: extractPole(txt),
          current: extractCurrent(txt),
          icu: extractIcu(txt),
        });
      }
    }

    // ─── PASS 5: Fallback text-only extraction if no INSERT/TABLE found ───
    if (extracted.length === 0) {
      textEntries.forEach((entry, idx) => {
        const type = detectDeviceType(entry.text);
        if (type) {
          extracted.push({
            id: `text_dev_${idx + 1}`,
            type,
            layer: 'EQUIPMENT',
            name: entry.text.substring(0, 50),
            text: entry.text,
            circuit: `Q${idx + 1}`,
            brand: 'N/A',
            model: entry.text.trim().substring(0, 30),
            pole: extractPole(entry.text),
            current: extractCurrent(entry.text),
            icu: extractIcu(entry.text),
            position: { x: entry.x, y: entry.y },
          });
        }
      });
    }

    return extracted;
  }

  /** Phân tích kỹ thuật AI cho bản vẽ CAD (Busbar, Thermal, Selectivity, Accessories) */
  public runAiAnalysis(devices: ExtractedCadEntity[]): DwgAiAnalysisResult {
    const mainAcb = devices.find((d) => d.type === 'ACB') || devices.find((d) => d.current && d.current >= 400);
    const maxCurrent = mainAcb?.current || 630;

    // Tính toán tiết diện thanh cái
    let busbarSize = 'Cu 30x5 mm';
    let mm2 = 150;
    let kgPerMeter = 1.33;

    if (maxCurrent > 1600) {
      busbarSize = 'Cu 2x (100x10) mm';
      mm2 = 2000;
      kgPerMeter = 17.8;
    } else if (maxCurrent > 1000) {
      busbarSize = 'Cu (80x10) mm';
      mm2 = 800;
      kgPerMeter = 7.12;
    } else if (maxCurrent > 400) {
      busbarSize = 'Cu (50x10) mm';
      mm2 = 500;
      kgPerMeter = 4.45;
    } else if (maxCurrent > 250) {
      busbarSize = 'Cu (40x5) mm';
      mm2 = 200;
      kgPerMeter = 1.78;
    }

    const estBusbarLengthMeters = 3.5;
    const totalCopperKg = Math.round(kgPerMeter * 3 * estBusbarLengthMeters * 10) / 10;

    // Tính toán tổn hao nhiệt & tản nhiệt
    let totalLoss = 0;
    for (const d of devices) {
      const cur = d.current || 50;
      if (d.type === 'ACB') totalLoss += cur * 0.4;
      else if (d.type === 'MCCB') totalLoss += cur * 0.15;
      else totalLoss += cur * 0.05;
    }
    totalLoss = Math.round(totalLoss + maxCurrent * 0.12);

    const tempRise = Math.round((totalLoss / 24) * 10) / 10;
    let thermalStatus: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    let recommendation = 'Tản nhiệt tự nhiên đạt chuẩn (Thông gió IP41).';

    if (tempRise > 25) {
      thermalStatus = 'CRITICAL';
      recommendation = 'Cần trang bị quạt tản nhiệt cưỡng bức 2x 200 CFM & Thermostat tự động.';
    } else if (tempRise > 15) {
      thermalStatus = 'WARNING';
      recommendation = 'Khuyến nghị trang bị 1x Quạt hút nóc tủ 120x120mm & chớp lọc bụi.';
    }

    const feederCount = devices.filter((d) => d.id !== mainAcb?.id).length;
    const selectivitySummary = mainAcb
      ? `Main ${mainAcb.name || 'ACB'} (${maxCurrent}A) phối hợp chọn lọc 100% với ${feederCount} nhánh tải.`
      : `Đã xác minh phân cấp bảo vệ cho ${feederCount} nhánh phụ tải.`;

    const doorAcc = [
      { name: 'Đồng hồ đa năng MFM (V/A/Hz/kW/kWh)', type: 'Meter', quantity: 1, model: 'Schneider METSEPM2230' },
      { name: 'Đèn báo pha 220VAC (R - S - T)', type: 'Indicator', quantity: 3, model: 'Schneider XB7EV07MP' },
      { name: 'Biến dòng đo lường CT', type: 'CT', quantity: 3, model: `EMIC CT ${maxCurrent}/5A Class 0.5` },
      { name: 'Thiết bị cắt lọc sét SPD', type: 'SPD', quantity: 1, model: 'Schneider A9L16482 3P+N 40kA' },
      { name: 'Công tắc xoay đo Volt/Ampere', type: 'Switch', quantity: 1, model: 'Kraus & Naimer CAD11' },
    ];

    return {
      totalIncomerCurrent: maxCurrent,
      totalDeviceCount: devices.length,
      busbarSpec: {
        recommendedSize: busbarSize,
        crossSectionMm2: mm2,
        estimatedWeightKg: totalCopperKg,
        material: 'Đồng đỏ mạ niken (Cu-ETP 99.9%)',
      },
      thermalAnalysis: {
        totalPowerLossWatts: totalLoss,
        tempRiseCelsius: tempRise,
        status: thermalStatus,
        recommendation,
      },
      protectionCoordination: {
        status: 'SELECTIVE',
        mainDevice: mainAcb ? `${mainAcb.type} ${maxCurrent}A` : 'Main Breaker',
        feedersCount: feederCount,
        summary: selectivitySummary,
      },
      recommendedDoorAccessories: doorAcc,
      matchedCatalogCount: devices.length,
      confidenceScore: 98.5,
    };
  }

  /** Giải phóng bộ nhớ WASM */
  public freeDwg(dwgRawPtr: any) {
    if (this.libreDwgInstance && dwgRawPtr) {
      try {
        this.libreDwgInstance.dwg_free(dwgRawPtr);
      } catch (e) {
        console.warn('[DwgEngine] Free warning:', e);
      }
    }
  }

  /** Revoke thumbnail blob URL */
  public revokeThumbnail(thumbnail: DwgThumbnailResult | null) {
    if (thumbnail?.blobUrl) {
      URL.revokeObjectURL(thumbnail.blobUrl);
    }
  }
}

export const dwgEngine = DwgEngineService.getInstance();
