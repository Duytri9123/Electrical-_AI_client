import { CADDocument, PanelJSON } from "./cadTypes";

export function generateCadDocumentFromPanel(panelJSON?: PanelJSON): CADDocument {
  const projName = panelJSON?.projectInfo?.projectName || "TỦ ĐIỆN PHÂN PHỐI 630A";
  
  return {
    title: projName,
    views: [
      {
        title: "EQUIPMENT VIEW",
        viewType: "EQUIPMENT",
        entities: [
          { type: "RECT", x: 0, y: 0, w: 160, h: 320, color: "cyan" },
          { type: "TEXT", x: 80, y: 20, text: "MAIN BUSBAR 1600A", color: "yellow" },
        ],
      },
      {
        title: "1ST DOOR VIEW",
        viewType: "DOOR",
        entities: [
          { type: "RECT", x: 0, y: 0, w: 160, h: 320, color: "cyan" },
          { type: "TEXT", x: 80, y: 20, text: "SAFETY GLASS", color: "green" },
        ],
      },
    ],
  };
}
