import { CADDocument } from "./cadTypes";

export function exportDocumentToDXF(doc: CADDocument): string {
  let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;

  doc.views.forEach((view, vIdx) => {
    const offsetX = vIdx * 250;

    view.entities.forEach((ent) => {
      if (ent.type === "RECT" && ent.w && ent.h) {
        const x1 = ent.x + offsetX;
        const y1 = ent.y;
        const x2 = x1 + ent.w;
        const y2 = y1 + ent.h;

        dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y1}\n`;
        dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
        dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y2}\n11\n${x1}\n21\n${y2}\n`;
        dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y2}\n11\n${x1}\n21\n${y1}\n`;
      } else if (ent.type === "TEXT" && ent.text) {
        dxf += `0\nTEXT\n8\n0\n10\n${ent.x + offsetX}\n20\n${ent.y}\n40\n5.0\n1\n${ent.text}\n`;
      }
    });
  });

  dxf += `0\nENDSEC\n0\nEOF\n`;
  return dxf;
}
