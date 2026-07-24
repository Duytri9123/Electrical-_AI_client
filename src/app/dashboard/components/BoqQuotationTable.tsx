import React, { useState, useEffect } from "react";
import lsCatalogData from "@/data/ls_catalog.json";

export interface BoqItem {
  id: string;
  group: string;
  name: string;
  model_code: string;
  brand: string;
  unit: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

interface BoqQuotationTableProps {
  devices: any[];
  projectName?: string;
  onUpdateDevice?: (index: number, field: string, value: any) => void;
}

export default function BoqQuotationTable({
  devices,
  projectName,
  onUpdateDevice,
}: BoqQuotationTableProps) {
  const [vatRate, setVatRate] = useState<number>(8);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [showQuotationInfoModal, setShowQuotationInfoModal] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const fromIdx = boqItems.findIndex((it) => it.id === draggedItemId);
    const toIdx = boqItems.findIndex((it) => it.id === targetId);

    if (fromIdx < 0 || toIdx < 0) return;

    const updated = [...boqItems];
    const [movedItem] = updated.splice(fromIdx, 1);
    if (updated[toIdx]) {
      movedItem.group = updated[toIdx].group;
    }
    updated.splice(toIdx, 0, movedItem);

    setBoqItems(updated);
    setDraggedItemId(null);
  };

  const today = new Date();

  // Sample Seller & Buyer Information (Defaults set to CÔNG TY A and CÔNG TY B)
  const [sellerInfo, setSellerInfo] = useState({
    logoUrl: "",
    companyName: "CÔNG TY A",
    address: "Số 1, Đường ABC, Phường XYZ, Hà Nội.",
    mst: "0101234567",
    phone: "0988.123.456",
    email: "contact@congtya.com",
    contactPerson: "Nguyễn Văn A - Trưởng phòng kinh doanh",
    contactMobile: "0988123456",
  });

  const [buyerInfo, setBuyerInfo] = useState({
    customerName: "CÔNG TY B",
    mst: "0309876543",
    contactPerson: "Trần Văn B",
    contactMobile: "0912345678",
    address: "Số 88, Đường DEF, Phường MNO, TP. Hồ Chí Minh.",
  });

  const [quotationInfo, setQuotationInfo] = useState({
    projectName: projectName || "DB FACADE 12F",
    quoteNo: "PO: 170626TD630A-3/DGP-PG",
    city: "Hà Nội",
    day: String(today.getDate()).padStart(2, "0"),
    month: String(today.getMonth() + 1).padStart(2, "0"),
    year: String(today.getFullYear()),
    author: "Kỹ sư Báo Giá",
  });

  // Sync projectName prop when changed from drawing analysis
  useEffect(() => {
    if (projectName && projectName.trim() !== "") {
      setQuotationInfo((prev) => ({ ...prev, projectName: projectName }));
    }
  }, [projectName]);

  const [paymentInfo, setPaymentInfo] = useState({
    stk: "385656868",
    bank: "Ngân hàng TMCP Quân Đội - chi nhánh Thủ Đô (MB Bank)",
    beneficiary: "CÔNG TY A",
  });

  // Load saved seller/buyer preferences from localStorage if available
  useEffect(() => {
    try {
      const savedSeller = localStorage.getItem("boq_seller_info");
      if (savedSeller) setSellerInfo(JSON.parse(savedSeller));

      const savedBuyer = localStorage.getItem("boq_buyer_info");
      if (savedBuyer) setBuyerInfo(JSON.parse(savedBuyer));

      const savedPayment = localStorage.getItem("boq_payment_info");
      if (savedPayment) setPaymentInfo(JSON.parse(savedPayment));

      const savedQuote = localStorage.getItem("boq_quote_meta");
      if (savedQuote) setQuotationInfo((prev) => ({ ...prev, ...JSON.parse(savedQuote) }));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save changes to localStorage on update
  const savePreferences = (newSeller = sellerInfo, newBuyer = buyerInfo, newPayment = paymentInfo, newQuote = quotationInfo) => {
    try {
      localStorage.setItem("boq_seller_info", JSON.stringify(newSeller));
      localStorage.setItem("boq_buyer_info", JSON.stringify(newBuyer));
      localStorage.setItem("boq_payment_info", JSON.stringify(newPayment));
      localStorage.setItem("boq_quote_meta", JSON.stringify(newQuote));
    } catch {
      // Ignore storage errors
    }
  };

  // Real BOQ Items
  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);

  useEffect(() => {
    if (!devices || devices.length === 0) {
      setBoqItems([]);
      return;
    }

    // STRICT DIRECTIVE: EXCLUDE LABOR ITEMS (NHÂN CÔNG). ONLY PUSH PHYSICAL MATERIALS!
    const filteredDevices = devices.filter((d) => {
      const uName = (d.name || d.circuit || "").toUpperCase();
      return !uName.includes("NHÂN CÔNG") && !uName.includes("LABOR");
    });

    const mapped: BoqItem[] = filteredDevices.map((d, idx) => {
      let group = d.group;
      if (!group) {
        const type = (d.type || "").toUpperCase();
        const level = d.level ?? 1;
        if (type.includes("ENCLOSURE") || type.includes("VỎ TỦ") || type.includes("ĐỒNG")) {
          group = "Vỏ tủ + phụ kiện";
        } else if (level === 0 || type === "ACB" || (d.circuit || "").toLowerCase().includes("tổng")) {
          group = "Đầu vào";
        } else if ((d.circuit || "").toLowerCase().includes("làm mát") || (d.circuit || "").toLowerCase().includes("quạt")) {
          group = "Làm mát cho ngăn tủ rack";
        } else {
          group = "Đầu ra";
        }
      }

      const defaultName = d.circuit
        ? `${d.circuit} (${d.type || 'MCCB'} ${d.current ? d.current + 'A' : ''})`
        : `${d.type || 'MCCB'} ${d.pole || 3}P ${d.current ? d.current + 'A' : ''} ${d.icu ? d.icu + 'kA' : ''}`.trim();

      const modelCode = d.model || d.model_code || "";
      let matchedCatalogPrice = d.unit_price;

      if (!matchedCatalogPrice && modelCode) {
        const cleanCode = modelCode.toLowerCase().trim();
        const catalogHit = lsCatalogData.devices.find(
          (cat: any) => cat.ma && cat.ma.toLowerCase().trim() === cleanCode
        ) || lsCatalogData.devices.find(
          (cat: any) => cat.ma && (cleanCode.includes(cat.ma.toLowerCase()) || cat.ma.toLowerCase().includes(cleanCode))
        );
        if (catalogHit && catalogHit.g) {
          matchedCatalogPrice = catalogHit.g;
        }
      }

      return {
        id: d.id || `boq-item-${idx}-${Date.now()}`,
        group,
        name: d.name || defaultName,
        model_code: modelCode || `${d.type || 'CB'}-${d.current || '250'}A`,
        brand: d.brand || "LS",
        unit: d.unit || "Cái",
        quantity: d.quantity || 1,
        unit_price: matchedCatalogPrice || (d.current ? d.current * 12500 : 450000),
        notes: d.notes || (d.icu ? `Icu ${d.icu}` : ""),
      };
    });

    setBoqItems(mapped);
  }, [devices]);

  // Handle single item property change
  const handleItemChange = (id: string, field: keyof BoqItem, val: any) => {
    setBoqItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Add empty line item DIRECTLY BELOW selected row
  const handleAddLineItem = () => {
    const newId = `boq-item-custom-${Date.now()}`;
    
    // Find index of currently selected row
    const selectedIdx = selectedRowId ? boqItems.findIndex((it) => it.id === selectedRowId) : -1;
    const targetGroup = selectedIdx >= 0 ? boqItems[selectedIdx].group : (boqItems[0]?.group || "Đầu ra");
    
    const newItem: BoqItem = {
      id: newId,
      group: targetGroup,
      name: "",
      model_code: "",
      brand: "",
      unit: "Cái",
      quantity: 1,
      unit_price: 0,
      notes: "",
    };

    setBoqItems((prev) => {
      if (selectedIdx >= 0) {
        // Insert new empty row directly below selected row
        const updated = [...prev];
        updated.splice(selectedIdx + 1, 0, newItem);
        return updated;
      } else {
        // Append at end if no row selected
        return [...prev, newItem];
      }
    });

    // Select the new empty row automatically
    setSelectedRowId(newId);
  };

  // Add a new section / category group without browser prompt
  const handleAddCategoryGroup = () => {
    const categoryName = "Vật tư & Phụ kiện bổ sung";
    
    const newId = `boq-item-custom-${Date.now()}`;
    const newItem: BoqItem = {
      id: newId,
      group: categoryName,
      name: "",
      model_code: "",
      brand: "",
      unit: "Bộ",
      quantity: 1,
      unit_price: 0,
      notes: "",
    };

    setBoqItems((prev) => [...prev, newItem]);
    setSelectedRowId(newId);
  };

  // Remove line item
  const handleRemoveLineItem = (id: string) => {
    setBoqItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedRowId === id) setSelectedRowId(null);
  };

  // Calculate totals
  const totalBeforeTax = boqItems.reduce(
    (sum, item) => sum + (item.quantity * item.unit_price),
    0
  );
  const vatAmount = Math.round(totalBeforeTax * (vatRate / 100));
  const totalAfterTax = totalBeforeTax + vatAmount;

  // Format VND currency
  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(num));
  };

  // Group unique categories
  const categories = Array.from(new Set(boqItems.map((item) => item.group)));

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Generate and download a REAL .pdf file directly to browser downloads folder
  const handleDownloadPdf = async () => {
    const element = document.getElementById("printable-quotation");
    if (!element) return;

    setDownloadingPdf(true);
    try {
      if (!(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Script load error"));
          document.body.appendChild(script);
        });
      }

      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        const fileName = `Bao_Gia_${(quotationInfo.projectName || "Du_An").replace(/[/\\?%*:|"<>]/g, "_")}.pdf`;
        const opt = {
          margin: [8, 8, 8, 8],
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, windowWidth: 1200 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    } catch (err) {
      console.error("Failed to generate PDF download:", err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Handle Logo Upload File Selection
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const logoData = uploadEvent.target?.result as string;
        const updated = { ...sellerInfo, logoUrl: logoData };
        setSellerInfo(updated);
        savePreferences(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  // Computed Date string
  const dateFormattedString = `${quotationInfo.city || "Hà Nội"}, ngày ${quotationInfo.day || "17"} tháng ${quotationInfo.month || "06"} năm ${quotationInfo.year || "2026"}`;

  // Export Excel Functionality with Exact BOQ Table Colors & Times New Roman Styling
  const handleExportExcel = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><style>
        body, table, th, td { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #334155; padding: 6px; text-align: left; vertical-align: middle; }
        th { background-color: #f59e0b; color: #000000; font-weight: bold; text-align: center; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; color: #000000; }
        .meta-table td { border: none; padding: 3px 6px; }
        .group-header { background-color: #f1f5f9; font-weight: bold; color: #000000; }
        .summary-top-row { background-color: #10b981; font-weight: bold; color: #000000; }
        .total-row { font-weight: bold; background-color: #f8fafc; color: #000000; }
        .grand-total-row { font-weight: bold; background-color: #fbbf24; color: #000000; font-size: 12pt; }
        .item-name { font-weight: normal; }
        .item-price { font-weight: normal; text-align: right; }
        .item-total { font-weight: bold; text-align: right; }
      </style></head>
      <body>
        <div class="title">BÁO GIÁ XÁC NHẬN ĐẶT HÀNG</div>
        <table class="meta-table">
          <tr><td style="text-align:left;font-weight:bold;">${quotationInfo.quoteNo}</td><td colspan="3" style="text-align:right;font-style:italic;">${dateFormattedString}</td></tr>
        </table>
        <br/>
        <table class="meta-table">
          <tr><td style="font-weight:bold;width:15%;">BÊN GỬI:</td><td style="font-weight:bold;width:35%;">${sellerInfo.companyName}</td><td style="font-weight:bold;width:15%;">BÊN NHẬN:</td><td style="font-weight:bold;width:35%;">${buyerInfo.customerName}</td></tr>
          <tr><td>Mã số thuế:</td><td>${sellerInfo.mst}</td><td>Mã số thuế:</td><td>${buyerInfo.mst}</td></tr>
          <tr><td>Số điện thoại:</td><td>${sellerInfo.phone}</td><td>Người liên hệ:</td><td>${buyerInfo.contactPerson}</td></tr>
          <tr><td>Liên hệ:</td><td>${sellerInfo.contactPerson}</td><td>Số di động:</td><td>${buyerInfo.contactMobile}</td></tr>
          <tr><td>Email:</td><td>${sellerInfo.email}</td><td>Địa chỉ:</td><td>${buyerInfo.address}</td></tr>
        </table>
        <br/>
        <p style="font-style:italic;font-size:10pt;">Cảm ơn Quý khách đã chọn sản phẩm của Công ty chúng tôi. Theo yêu cầu của Quý khách, Chúng tôi hân hạnh gửi tới Quý khách bảng chào giá vật tư, thiết bị như sau:</p>
        <br/>
        <table>
          <thead>
            <tr>
              <th style="width:40px;">STT</th>
              <th style="width:300px;">MÔ TẢ CHI TIẾT SẢN PHẨM</th>
              <th style="width:140px;">MÃ HÀNG</th>
              <th style="width:80px;">XUẤT XỨ</th>
              <th style="width:60px;">ĐƠN VỊ</th>
              <th style="width:80px;">SỐ LƯỢNG</th>
              <th style="width:120px;">ĐƠN GIÁ (VNĐ)</th>
              <th style="width:130px;">THÀNH TIỀN (VNĐ)</th>
              <th style="width:160px;">GHI CHÚ</th>
            </tr>
          </thead>
          <tbody>
            <tr class="summary-top-row">
              <td style="text-align:center;">1</td>
              <td>${quotationInfo.projectName}</td>
              <td>—</td><td style="text-align:center;">VN</td><td style="text-align:center;">Tủ</td>
              <td style="text-align:center;">1.00</td>
              <td style="text-align:right;">${formatVnd(totalBeforeTax)}</td>
              <td style="text-align:right;">${formatVnd(totalBeforeTax)}</td>
              <td>Tủ hoàn thiện</td>
            </tr>
    `;

    categories.forEach((cat) => {
      tableHtml += `<tr class="group-header"><td colspan="9"><b>* ${cat}</b></td></tr>`;
      const catItems = boqItems.filter((it) => it.group === cat);
      catItems.forEach((it) => {
        const rowTotal = it.quantity * it.unit_price;
        tableHtml += `
          <tr>
            <td style="text-align:center;">+</td>
            <td class="item-name">${it.name}</td>
            <td style="font-weight:normal;">${it.model_code}</td>
            <td style="text-align:center;font-weight:normal;">${it.brand}</td>
            <td style="text-align:center;font-weight:normal;">${it.unit}</td>
            <td style="text-align:center;font-weight:normal;">${it.quantity}</td>
            <td class="item-price">${formatVnd(it.unit_price)}</td>
            <td class="item-total">${formatVnd(rowTotal)}</td>
            <td style="font-style:italic;font-weight:normal;">${it.notes}</td>
          </tr>
        `;
      });
    });

    tableHtml += `
            <tr class="total-row"><td colspan="7" style="text-align:right;"><b>TỔNG GIÁ TRỊ TRƯỚC THUẾ</b></td><td style="text-align:right;"><b>${formatVnd(totalBeforeTax)}</b></td><td>VNĐ</td></tr>
            <tr class="total-row"><td colspan="7" style="text-align:right;"><b>THUẾ GTGT (${vatRate}%)</b></td><td style="text-align:right;"><b>${formatVnd(vatAmount)}</b></td><td>VNĐ</td></tr>
            <tr class="grand-total-row"><td colspan="7" style="text-align:right;"><b>TỔNG GIÁ TRỊ SAU THUẾ</b></td><td style="text-align:right;"><b>${formatVnd(totalAfterTax)}</b></td><td>VNĐ</td></tr>
          </tbody>
        </table>
        <br/><br/>
        <table class="meta-table">
          <tr><td style="font-bold;text-align:center;width:50%;">Xác nhận của KHÁCH HÀNG</td><td style="font-bold;text-align:center;width:50%;">Đại diện Công ty</td></tr>
          <tr><td style="font-style:italic;text-align:center;">(Ký tên và đóng dấu)</td><td style="font-style:italic;text-align:center;">(Người lập báo giá)</td></tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Gia_${quotationInfo.projectName.replace(/[/\\?%*:|"<>]/g, "_")}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col space-y-5 p-4 sm:p-6 font-sans">
      
      {/* CSS PRINT STYLES FOR STRICT A4 PDF EXPORT (COLOR PRESERVED & EXACT MARGINS & NO TOP GAP) */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm 8mm 10mm;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-quotation, #printable-quotation * {
            visibility: visible !important;
          }
          #printable-quotation {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
            transform: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
      
      {/* ── CARD THÔNG TIN BÁO GIÁ XÁC NHẬN ĐẶT HÀNG ──── */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
        {/* Header with Title + Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-base">📋</span>
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              THÔNG TIN BÁO GIÁ XÁC NHẬN ĐẶT HÀNG
            </h3>
          </div>

          {/* Action Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs shadow-xs">
              <span className="text-slate-600 font-bold">Thuế GTGT:</span>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value={8}>8%</option>
                <option value={10}>10%</option>
                <option value={0}>0%</option>
              </select>
            </div>

            {/* BUTTON 1: THÔNG TIN BÁO GIÁ (MODAL FORM) */}
            <button
              onClick={() => setShowQuotationInfoModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>📋 Thông tin báo giá</span>
            </button>

            {/* BUTTON 2: PREVIEW & XUẤT PDF */}
            <button
              onClick={() => setShowPdfPreview(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>📄 Preview & Xuất PDF</span>
            </button>

            {/* BUTTON 3: XUẤT EXCEL */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <span>📥 Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Header Bar with Insert Row Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📊</span>
          <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
            BẢNG BÁO GIÁ SẢN PHẨM / VẬT TƯ THIẾT BỊ TỦ ĐIỆN
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddCategoryGroup}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            title="Thêm danh mục / mục mới vào bảng báo giá"
          >
            <span>📁</span>
            <span>Thêm mục</span>
          </button>

          <button
            onClick={handleAddLineItem}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            title="Bấm để chèn dòng rỗng mới"
          >
            <span>➕</span>
            <span>Thêm dòng rỗng</span>
          </button>
        </div>
      </div>

      {/* Main BOQ Table (NO ROUNDED CORNERS - RECTANGULAR EDGES 100%) */}
      {boqItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-none space-y-2">
          <div className="text-3xl">📑</div>
          <div className="text-sm font-bold text-slate-700">Chưa có dữ liệu thiết bị bóc tách</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vui lòng tải lên sơ đồ bản vẽ SLD ở mục <b>📄 SLD Reader</b> hoặc nhấn nút <b>"+ Thêm dòng rỗng"</b> ở góc phải để tự tạo bảng báo giá thủ công.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-slate-400 rounded-none shadow-sm">
          <table 
            className="w-full text-left text-xs border-collapse"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            <thead>
              {/* Header Yellow Bar (SHARP 90-DEGREE CORNERS - BOLD HEADERS) */}
              <tr className="bg-amber-400 text-slate-950 font-bold border-b-2 border-slate-500 uppercase text-[11.5px] rounded-none">
                <th className="p-2.5 w-10 text-center border-r border-slate-400 rounded-none font-bold">STT</th>
                <th className="p-2.5 min-w-[260px] border-r border-slate-400 rounded-none font-bold">MÔ TẢ CHI TIẾT SẢN PHẨM</th>
                <th className="p-2.5 w-32 border-r border-slate-400 rounded-none font-bold">MÃ HÀNG</th>
                <th className="p-2.5 w-24 border-r border-slate-400 rounded-none text-center font-bold">XUẤT XỨ</th>
                <th className="p-2.5 w-20 text-center border-r border-slate-400 rounded-none font-bold">ĐƠN VỊ</th>
                <th className="p-2.5 w-24 text-center border-r border-slate-400 rounded-none font-bold">SỐ LƯỢNG</th>
                <th className="p-2.5 w-28 text-right border-r border-slate-400 rounded-none font-bold">ĐƠN GIÁ (VNĐ)</th>
                <th className="p-2.5 w-28 text-right border-r border-slate-400 rounded-none font-bold">THÀNH TIỀN (VNĐ)</th>
                <th className="p-2.5 min-w-[200px] border-r border-slate-400 rounded-none font-bold">GHI CHÚ</th>
                <th className="p-2.5 w-12 text-center rounded-none font-bold">XÓA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-900 bg-white">
              {/* Top Level Summary Row: TỦ ĐIỆN DỰ ÁN (BOLD) */}
              <tr className="bg-emerald-500 text-slate-950 font-bold text-xs border-b border-emerald-700">
                <td className="p-2 text-center border-r border-emerald-700 font-bold">1</td>
                <td className="p-2 border-r border-emerald-700 uppercase tracking-wide font-bold">
                  <input
                    type="text"
                    value={quotationInfo.projectName}
                    onChange={(e) => setQuotationInfo({ ...quotationInfo, projectName: e.target.value })}
                    className="bg-transparent border-none font-bold focus:outline-none w-full text-slate-950 uppercase"
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}
                  />
                </td>
                <td className="p-2 border-r border-emerald-700 font-normal">—</td>
                <td className="p-2 border-r border-emerald-700 font-bold text-center">VN</td>
                <td className="p-2 text-center border-r border-emerald-700 font-bold">Tủ</td>
                <td className="p-2 text-center border-r border-emerald-700 font-bold">1.00</td>
                <td className="p-2 text-right border-r border-emerald-700 font-bold">
                  {formatVnd(totalBeforeTax)}
                </td>
                <td className="p-2 text-right border-r border-emerald-700 font-bold text-slate-950">
                  {formatVnd(totalBeforeTax)}
                </td>
                <td colSpan={2} className="p-2 italic text-[11px] font-bold text-slate-950">Vỏ tủ + phụ kiện + thiết bị đấu nối complete</td>
              </tr>

              {categories.map((catName, catIdx) => {
                const groupItems = boqItems.filter((it) => it.group === catName);
                if (groupItems.length === 0) return null;

                return (
                  <React.Fragment key={catName}>
                    {/* Group Category Header (BOLD) */}
                    <tr className="bg-slate-100 font-bold text-slate-950 text-[11.5px] border-y border-slate-350">
                      <td className="p-2 text-center text-slate-600 border-r border-slate-300 font-bold">*</td>
                      <td colSpan={9} className="p-2 uppercase text-slate-950 tracking-wide font-bold">
                        {catName}
                      </td>
                    </tr>

                    {/* Group Items (CLICKABLE ROW - HIGHLIGHTED WHEN SELECTED) */}
                    {groupItems.map((item, itemIdx) => {
                      const rowTotal = item.quantity * item.unit_price;
                      const isSelected = item.id === selectedRowId;
                      const sttLabel = `${catIdx + 1}.${itemIdx + 1}`;

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => {
                            if (isSelected) {
                              setSelectedRowId(null);
                            } else {
                              setSelectedRowId(item.id);
                            }
                          }}
                          draggable={isSelected}
                          onDragStart={(e) => {
                            if (!isSelected) return;
                            handleDragStart(e, item.id);
                          }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected 
                              ? "bg-amber-100/90 ring-2 ring-blue-500 font-bold" 
                              : "hover:bg-amber-50/60"
                          }`}
                        >
                          <td className={`p-2 text-center border-r border-slate-300 font-mono text-[11px] ${isSelected ? "cursor-grab active:cursor-grabbing text-blue-700 font-extrabold text-sm" : "text-slate-500 font-medium"}`}>
                            {isSelected ? (
                              <span
                                className="text-blue-700 font-black text-sm select-none"
                                title="Click để tắt chọn | Nhấn giữ icon để kéo di chuyển dòng"
                              >
                                ⋮⋮
                              </span>
                            ) : (
                              "+"
                            )}
                          </td>

                          {/* Mô tả chi tiết (REGULAR NORMAL 400 WEIGHT - EDITABLE) */}
                          <td className="p-2 border-r border-slate-300 min-w-[260px]">
                            <textarea
                              rows={item.name.length > 30 ? 2 : 1}
                              value={item.name}
                              placeholder="Nhập mô tả chi tiết vật tư..."
                              onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:ring-1 focus:ring-amber-400 focus:outline-none resize-none text-xs leading-tight font-normal text-slate-900 break-words"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Mã hàng (REGULAR NORMAL WEIGHT) */}
                          <td className="p-2 border-r border-slate-300">
                            <input
                              type="text"
                              value={item.model_code}
                              placeholder="Mã hàng..."
                              onChange={(e) => handleItemChange(item.id, "model_code", e.target.value)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none text-[11.5px] text-slate-800 font-normal"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Xuất xứ / Hãng (REGULAR NORMAL WEIGHT) */}
                          <td className="p-2 border-r border-slate-300">
                            <input
                              type="text"
                              value={item.brand}
                              placeholder="Xuất xứ..."
                              onChange={(e) => handleItemChange(item.id, "brand", e.target.value)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none font-normal text-slate-800 text-center"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Đơn vị (REGULAR NORMAL WEIGHT) */}
                          <td className="p-2 border-r border-slate-300 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none text-center font-normal text-slate-800"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Số lượng (REGULAR NORMAL WEIGHT) */}
                          <td className="p-2 border-r border-slate-300 text-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none text-center font-normal text-slate-900"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Đơn giá (REGULAR NORMAL WEIGHT) */}
                          <td className="p-2 border-r border-slate-300 text-right">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none text-right font-normal text-slate-900"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Thành tiền (BOLD WEIGHT FOR TOTALS) */}
                          <td className="p-2 text-right border-r border-slate-300 font-bold text-slate-950">
                            {formatVnd(rowTotal)}
                          </td>

                          {/* Ghi chú (ITALIC REGULAR WEIGHT - MULTILINE TEXTAREA) */}
                          <td className="p-2 border-r border-slate-300 min-w-[200px]">
                            <textarea
                              rows={item.notes && item.notes.length > 20 ? 2 : 1}
                              value={item.notes}
                              placeholder="Ghi chú..."
                              onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                              className="w-full bg-transparent border-none focus:bg-amber-50 focus:outline-none text-[11.5px] text-slate-700 italic font-normal resize-none overflow-hidden leading-tight break-words"
                              style={{ fontFamily: "'Times New Roman', Times, serif" }}
                            />
                          </td>

                          {/* Action Delete */}
                          <td className="p-2 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLineItem(item.id);
                              }}
                              className="w-5 h-5 inline-flex items-center justify-center text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
                              title="Xóa dòng này"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Totals Summary Footer (BOLD WEIGHT) */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-950 border-t-2 border-slate-400">
                <td colSpan={7} className="p-2.5 text-right font-bold uppercase border-r border-slate-300">
                  TỔNG GIÁ TRỊ TRƯỚC THUẾ
                </td>
                <td className="p-2.5 text-right font-bold text-emerald-800 text-sm border-r border-slate-300">
                  {formatVnd(totalBeforeTax)}
                </td>
                <td colSpan={2} className="p-2.5 font-bold text-slate-700">VNĐ</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-300">
                <td colSpan={7} className="p-2.5 text-right font-bold uppercase border-r border-slate-300">
                  THUẾ GTGT ({vatRate}%)
                </td>
                <td className="p-2.5 text-right font-bold text-amber-800 border-r border-slate-300">
                  {formatVnd(vatAmount)}
                </td>
                <td colSpan={2} className="p-2.5 text-slate-700 font-bold">VNĐ</td>
              </tr>
              <tr className="bg-amber-400 text-slate-950 font-bold text-sm border-t-2 border-slate-500">
                <td colSpan={7} className="p-3 text-right uppercase tracking-wider border-r border-slate-400 font-bold">
                  TỔNG GIÁ TRỊ SAU THUẾ
                </td>
                <td className="p-3 text-right font-bold text-base border-r border-slate-400 text-slate-950">
                  {formatVnd(totalAfterTax)}
                </td>
                <td colSpan={2} className="p-3 text-xs text-slate-950 font-bold">VNĐ</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── MODAL 1: CẤU HÌNH THÔNG TIN BÁO GIÁ & LOGO CÔNG TY ──────────────────────────── */}
      {showQuotationInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-none shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center border-b border-slate-700 rounded-none">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📋</span>
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  CẤU HÌNH THÔNG TIN BÁO GIÁ & LOGO DOANH NGHIỆP
                </h3>
              </div>
              <button
                onClick={() => setShowQuotationInfoModal(false)}
                className="text-slate-400 hover:text-white font-bold text-base p-1 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] text-xs text-slate-800">
              
              {/* SECTION 1: LOGO & THÔNG TIN BÊN BÁN (BÊN GỬI) */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
                <h4 className="font-black text-xs text-blue-700 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center space-x-2">
                  <span>🏢</span>
                  <span>1. THÔNG TIN BÊN BÁN (BÊN GỬI BÁO GIÁ) & LOGO</span>
                </h4>

                {/* Logo Uploader / URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-white p-3 border border-slate-200 rounded-lg">
                  <div className="sm:col-span-1 flex flex-col items-center justify-center space-y-2">
                    <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-1">
                      {sellerInfo.logoUrl ? (
                        <img src={sellerInfo.logoUrl} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-center text-slate-400">
                          <span className="text-2xl block">🖼️</span>
                          <span className="text-[10px] font-bold">Chưa có Logo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700">TẢI LOGO CÔNG TY (PNG / JPG)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <div className="text-[10.5px] text-slate-400 italic">hoặc dán đường dẫn Logo URL bên dưới:</div>
                    <input
                      type="text"
                      placeholder="https://domain.com/logo.png"
                      value={sellerInfo.logoUrl}
                      onChange={(e) => {
                        const updated = { ...sellerInfo, logoUrl: e.target.value };
                        setSellerInfo(updated);
                        savePreferences(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono text-[11px] rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Seller Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">TÊN CÔNG TY BÊN BÁN</label>
                    <input
                      type="text"
                      value={sellerInfo.companyName}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, companyName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MÃ SỐ THUẾ (MST)</label>
                    <input
                      type="text"
                      value={sellerInfo.mst}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, mst: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">ĐỊA CHỈ TRỤ SỞ</label>
                    <input
                      type="text"
                      value={sellerInfo.address}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, address: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-medium text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NGƯỜI LẬP BÁO GIÁ / CHỨC VỤ</label>
                    <input
                      type="text"
                      value={sellerInfo.contactPerson}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, contactPerson: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SỐ DI ĐỘNG BÊN BÁN</label>
                    <input
                      type="text"
                      value={sellerInfo.contactMobile}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, contactMobile: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SỐ ĐIỆN THOẠI CÔNG TY</label>
                    <input
                      type="text"
                      value={sellerInfo.phone}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-medium text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">EMAIL CÔNG TY</label>
                    <input
                      type="text"
                      value={sellerInfo.email}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-medium text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN BÊN MUA (KHÁCH HÀNG) & ĐƠN HÀNG & NGÀY THÁNG */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
                <h4 className="font-black text-xs text-emerald-700 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center space-x-2">
                  <span>👤</span>
                  <span>2. THÔNG TIN KHÁCH HÀNG (BÊN NHẬN), NGÀY LẬP & DỰ ÁN</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">TÊN DỰ ÁN / TỦ ĐIỆN</label>
                    <input
                      type="text"
                      value={quotationInfo.projectName}
                      onChange={(e) => setQuotationInfo({ ...quotationInfo, projectName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SỐ PO / SỐ BÁO GIÁ</label>
                    <input
                      type="text"
                      value={quotationInfo.quoteNo}
                      onChange={(e) => setQuotationInfo({ ...quotationInfo, quoteNo: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono font-bold text-blue-700 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* EXPLICIT DATE PICKER / DAY-MONTH-YEAR INPUTS */}
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[10.5px]">NGÀY</label>
                      <input
                        type="text"
                        value={quotationInfo.day}
                        onChange={(e) => setQuotationInfo({ ...quotationInfo, day: e.target.value })}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-300 font-bold text-center rounded-lg focus:border-blue-600 focus:outline-none text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[10.5px]">THÁNG</label>
                      <input
                        type="text"
                        value={quotationInfo.month}
                        onChange={(e) => setQuotationInfo({ ...quotationInfo, month: e.target.value })}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-300 font-bold text-center rounded-lg focus:border-blue-600 focus:outline-none text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[10.5px]">NĂM</label>
                      <input
                        type="text"
                        value={quotationInfo.year}
                        onChange={(e) => setQuotationInfo({ ...quotationInfo, year: e.target.value })}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-300 font-bold text-center rounded-lg focus:border-blue-600 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">TÊN CÔNG TY KHÁCH HÀNG</label>
                    <input
                      type="text"
                      value={buyerInfo.customerName}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, customerName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MÃ SỐ THUẾ KHÁCH HÀNG</label>
                    <input
                      type="text"
                      value={buyerInfo.mst}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, mst: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">ĐỊA CHỈ KHÁCH HÀNG</label>
                    <input
                      type="text"
                      value={buyerInfo.address}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-medium text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NGƯỜI NHẬN BÁO GIÁ</label>
                    <input
                      type="text"
                      value={buyerInfo.contactPerson}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, contactPerson: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SỐ DI ĐỘNG KHÁCH HÀNG</label>
                    <input
                      type="text"
                      value={buyerInfo.contactMobile}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, contactMobile: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ĐỊA DANH KÝ VĂN BẢN</label>
                    <input
                      type="text"
                      value={quotationInfo.city}
                      onChange={(e) => setQuotationInfo({ ...quotationInfo, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TÀI KHOẢN NGÂN HÀNG THANH TOÁN */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
                <h4 className="font-black text-xs text-amber-700 uppercase tracking-wide border-b border-slate-200 pb-2 flex items-center space-x-2">
                  <span>💳</span>
                  <span>3. THÔNG TIN CHUYỂN KHOẢN NGÂN HÀNG</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SỐ TÀI KHOẢN (STK)</label>
                    <input
                      type="text"
                      value={paymentInfo.stk}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, stk: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono font-bold text-blue-700 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NGÂN HÀNG MỞ TÀI KHOẢN</label>
                    <input
                      type="text"
                      value={paymentInfo.bank}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, bank: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">TÊN ĐƠN VỊ HƯỞNG THỤ</label>
                    <input
                      type="text"
                      value={paymentInfo.beneficiary}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, beneficiary: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-bold text-slate-900 rounded-lg focus:border-blue-600 focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  savePreferences();
                  setShowQuotationInfoModal(false);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none text-xs shadow-md transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>✔ Lưu & Áp dụng vào Preview / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: QUOTATION PREVIEW & PDF PRINTING (SHARP 90-DEGREE SQUARE CORNERS FOR HEADER & CONTAINER) ──────────── */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex flex-col justify-start items-center overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
          
          {/* SEAMLESS STICKY TOP CONTROL BAR (100% SQUARE SHARP CORNERS - ROUNDED NONE) */}
          <div className="sticky top-0 z-50 w-full max-w-4xl bg-slate-900 text-white p-3 px-6 flex justify-between items-center rounded-none shadow-xl print:hidden border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📄</span>
              <h3 className="font-bold text-sm uppercase tracking-wide">
                XEM TRƯỚC BÁO GIÁ A4 (TIMES NEW ROMAN)
              </h3>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* EDIT BUTTON INSIDE PREVIEW BAR */}
              <button
                onClick={() => setShowQuotationInfoModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Bấm để chỉnh sửa Logo, tên công ty, thông tin khách hàng, số PO và ngày tháng"
              >
                <span>✏️ Chỉnh sửa thông tin</span>
              </button>

              {/* EXPORT DIRECT PDF FILE BUTTON */}
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white font-bold rounded-none text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Tải trực tiếp file báo giá dạng file PDF về máy tính"
              >
                <span>{downloadingPdf ? "⏳ Đang tạo PDF..." : "📥 Tải file PDF"}</span>
              </button>

              {/* NATIVE PRINT DIALOG BUTTON */}
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-none text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                title="In trực tiếp ra máy in hoặc trình in hệ điều hành"
              >
                <span>🖨️ In ấn</span>
              </button>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-none text-xs transition-all cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>
          </div>

          {/* Printable Page Wrapper Container (100% Square Sharp Corners - Rounded None) */}
          <div className="bg-white border-x border-b border-slate-300 shadow-2xl w-full max-w-4xl flex flex-col rounded-none mb-6 print:mb-0 print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
            
            {/* Print Body Document (A4 Page canvas: exact margins & clean Times New Roman styling) */}
            <div 
              id="printable-quotation" 
              className="p-8 sm:p-12 text-slate-950 text-xs leading-normal bg-white print:p-0"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              
              {/* Header Logo & Seller Info */}
              <div className="flex justify-between items-start border-b border-slate-400 pb-4 mb-4">
                <div className="flex items-center space-x-4">
                  {sellerInfo.logoUrl ? (
                    <img src={sellerInfo.logoUrl} alt="Logo Công Ty" className="max-h-16 max-w-[180px] object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-400 font-bold text-slate-950 flex flex-col items-center justify-center border-2 border-slate-900 text-center leading-tight">
                      <span className="text-xl tracking-tighter font-bold">DGP</span>
                      <span className="text-[7.5px] font-bold">DUY GIA PHÁT</span>
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-sm uppercase text-slate-950">
                      {sellerInfo.companyName}
                    </div>
                    {/* MST & SĐT ARE ON SEPARATE LINES (NOT COMBINED) */}
                    <div className="text-[11px] text-slate-800 leading-tight mt-0.5 space-y-0.5">
                      <div><b>Địa chỉ:</b> {sellerInfo.address}</div>
                      <div><b>MST:</b> {sellerInfo.mst}</div>
                      <div><b>Số điện thoại:</b> {sellerInfo.phone}</div>
                      <div><b>Email:</b> {sellerInfo.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotation Title & Date (CLEAN WITHOUT UNNECESSARY REDUNDANT HORIZONTAL LINES) */}
              <div className="text-center my-4 space-y-1.5">
                <h1 className="text-base font-bold uppercase text-slate-950 tracking-wider">
                  BÁO GIÁ XÁC NHẬN ĐẶT HÀNG
                </h1>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 px-1 italic">
                  <span>{quotationInfo.quoteNo}</span>
                  <span>{dateFormattedString}</span>
                </div>
              </div>

              {/* Seller & Buyer Info Tables (Two Columns Clean Layout) */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-400 py-3 mb-4 text-[11.5px] page-break-inside-avoid">
                {/* Seller Side */}
                <div className="border-r border-slate-300 pr-3 space-y-1">
                  <div className="font-bold underline uppercase text-slate-950">Bên gửi:</div>
                  <div className="font-bold text-slate-950">{sellerInfo.companyName}</div>
                  <div><b>MS thuế / MS Doanh Nghiệp:</b> {sellerInfo.mst}</div>
                  <div><b>Liên hệ:</b> {sellerInfo.contactPerson}</div>
                  <div><b>Số di động:</b> {sellerInfo.contactMobile}</div>
                  <div><b>E-mail:</b> {sellerInfo.email}</div>
                </div>

                {/* Buyer Side */}
                <div className="pl-1 space-y-1">
                  <div className="font-bold underline uppercase text-slate-950">Bên nhận:</div>
                  <div className="font-bold text-slate-950">{buyerInfo.customerName}</div>
                  <div><b>MS thuế / MS Doanh Nghiệp:</b> {buyerInfo.mst}</div>
                  <div><b>Người liên hệ:</b> {buyerInfo.contactPerson}</div>
                  <div><b>Số di động:</b> {buyerInfo.contactMobile}</div>
                  <div><b>Địa chỉ:</b> {buyerInfo.address}</div>
                </div>
              </div>

              <p className="italic text-[11px] text-slate-800 mb-3">
                Cảm ơn Quý khách đã chọn sản phẩm của Công ty chúng tôi. Theo yêu cầu của Quý khách, Chúng tôi hân hạnh gửi tới Quý khách bảng chào giá vật tư, thiết bị như sau:
              </p>

              <h2 className="font-bold text-xs uppercase mb-2">I - BẢNG GIÁ SẢN PHẨM</h2>

              {/* PDF Printable Table */}
              <div className="overflow-x-auto">
                <table 
                  className="w-full border-collapse border-2 border-slate-900 text-[11px] mb-4"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  <thead>
                    <tr className="bg-amber-400 text-slate-950 font-bold border-b-2 border-slate-900 uppercase">
                      <th className="border border-slate-900 p-1.5 text-center w-8 font-bold">TT</th>
                      <th className="border border-slate-900 p-1.5 min-w-[180px] font-bold">MÔ TẢ CHI TIẾT</th>
                      <th className="border border-slate-900 p-1.5 w-24 font-bold">MÃ HÀNG</th>
                      <th className="border border-slate-900 p-1.5 w-14 text-center font-bold">XUẤT XỨ</th>
                      <th className="border border-slate-900 p-1.5 w-12 text-center font-bold">ĐƠN VỊ</th>
                      <th className="border border-slate-900 p-1.5 w-14 text-center font-bold">SỐ LƯỢNG</th>
                      <th className="border border-slate-900 p-1.5 w-24 text-right font-bold">ĐƠN GIÁ</th>
                      <th className="border border-slate-900 p-1.5 w-24 text-right font-bold">THÀNH TIỀN</th>
                      <th className="border border-slate-900 p-1.5 min-w-[110px] font-bold">GHI CHÚ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Top Level Summary Row: TỦ ĐIỆN DỰ ÁN */}
                    <tr className="bg-emerald-400 text-slate-950 font-bold border-b border-slate-900">
                      <td className="border border-slate-900 p-1.5 text-center font-bold">1</td>
                      <td className="border border-slate-900 p-1.5 font-bold uppercase">{quotationInfo.projectName}</td>
                      <td className="border border-slate-900 p-1.5 font-normal">—</td>
                      <td className="border border-slate-900 p-1.5 text-center font-bold">VN</td>
                      <td className="border border-slate-900 p-1.5 text-center font-bold">Tủ</td>
                      <td className="border border-slate-900 p-1.5 text-center font-bold">1.00</td>
                      <td className="border border-slate-900 p-1.5 text-right font-bold">{formatVnd(totalBeforeTax)}</td>
                      <td className="border border-slate-900 p-1.5 text-right font-bold">{formatVnd(totalBeforeTax)}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">Tủ hoàn thiện</td>
                    </tr>

                    {categories.map((cat) => {
                      const catItems = boqItems.filter((it) => it.group === cat);
                      if (catItems.length === 0) return null;
                      return (
                        <React.Fragment key={cat}>
                          <tr className="bg-slate-100 font-bold border-b border-slate-900">
                            <td className="border border-slate-900 p-1 text-center font-bold">*</td>
                            <td colSpan={8} className="border border-slate-900 p-1 font-bold uppercase">
                              {cat}
                            </td>
                          </tr>
                          {catItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-300 font-normal">
                              <td className="border border-slate-900 p-1 text-center font-normal">+</td>
                              <td className="border border-slate-900 p-1 font-normal text-slate-950">{item.name}</td>
                              <td className="border border-slate-900 p-1 font-normal text-slate-800">{item.model_code}</td>
                              <td className="border border-slate-900 p-1 text-center font-normal text-slate-800">{item.brand}</td>
                              <td className="border border-slate-900 p-1 text-center font-normal text-slate-800">{item.unit}</td>
                              <td className="border border-slate-900 p-1 text-center font-normal text-slate-950">{item.quantity}</td>
                              <td className="border border-slate-900 p-1 text-right font-normal text-slate-950">{formatVnd(item.unit_price)}</td>
                              <td className="border border-slate-900 p-1 text-right font-bold text-slate-950">{formatVnd(item.quantity * item.unit_price)}</td>
                              <td className="border border-slate-900 p-1 italic font-normal text-slate-700 text-[10px]">{item.notes}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t border-slate-900 bg-slate-50">
                      <td colSpan={7} className="border border-slate-900 p-1.5 text-right uppercase font-bold">TỔNG GIÁ TRỊ TRƯỚC THUẾ</td>
                      <td className="border border-slate-900 p-1.5 text-right font-bold">{formatVnd(totalBeforeTax)}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">VNĐ</td>
                    </tr>
                    <tr className="font-bold border-t border-slate-900 bg-slate-50">
                      <td colSpan={7} className="border border-slate-900 p-1.5 text-right uppercase font-bold">THUẾ GTGT ({vatRate}%)</td>
                      <td className="border border-slate-900 p-1.5 text-right font-bold">{formatVnd(vatAmount)}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">VNĐ</td>
                    </tr>
                    <tr className="font-bold border-t-2 border-slate-900 bg-amber-400">
                      <td colSpan={7} className="border border-slate-900 p-1.5 text-right uppercase font-bold">TỔNG GIÁ TRỊ SAU THUẾ</td>
                      <td className="border border-slate-900 p-1.5 text-right font-bold text-slate-950">{formatVnd(totalAfterTax)}</td>
                      <td className="border border-slate-900 p-1.5 font-bold text-slate-950">VNĐ</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Section II: GHI CHÚ */}
              <div className="space-y-1 text-[11px] text-slate-800 mb-4 page-break-inside-avoid">
                <h3 className="font-bold text-xs uppercase text-slate-950">II - GHI CHÚ</h3>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Báo giá chưa bao gồm phí vận chuyển.</li>
                  <li>Báo giá này có hiệu lực 7 ngày kể từ ngày báo giá.</li>
                  <li>Tiến độ thực hiện tính bắt đầu từ lúc nhận được tiền tạm ứng của Quý khách.</li>
                  <li>Thời gian thực hiện không bao gồm ngày nghỉ lễ, thời gian chờ Quý khách phê duyệt phương án.</li>
                  <li>Thanh toán 100% giá trị ngay sau khi có thông báo giao hàng, trước khi bàn giao hàng hóa tại xưởng.</li>
                  <li>Sản phẩm được báo giá và thi công theo quy cách của {sellerInfo.companyName || "bên bán"}.</li>
                  <li>Thời gian bảo hành: Sản phẩm được bảo hành 12 tháng.</li>
                </ul>
              </div>

              {/* Section III: THANH TOÁN */}
              <div className="space-y-1 text-[11px] text-slate-800 mb-6 page-break-inside-avoid">
                <h3 className="font-bold text-xs uppercase text-slate-950">III - THANH TOÁN</h3>
                <div>- Phương thức thanh toán: Chuyển khoản</div>
                <div>- Tạm ứng 50% ngay sau khi ký hợp đồng</div>
                <div>- Thanh toán 100% giá trị ngay sau khi có thông báo giao hàng, trước khi bàn giao hàng hóa tại kho bên bán.</div>
                <div>- <b>STK:</b> {paymentInfo.stk}</div>
                <div>- <b>Ngân hàng:</b> {paymentInfo.bank}</div>
                <div>- <b>Người hưởng thụ:</b> {paymentInfo.beneficiary}</div>
              </div>

              {/* Signatures Footer */}
              <div className="grid grid-cols-2 text-center font-bold text-xs pt-4 border-t border-slate-300 page-break-inside-avoid">
                <div>
                  <div>Xác nhận của KHÁCH HÀNG</div>
                  <div className="text-[10.5px] font-normal italic text-slate-600 mt-0.5">(Ký tên và đóng dấu)</div>
                  <div className="h-16"></div>
                </div>
                <div>
                  <div>Đại diện Công ty</div>
                  <div className="text-[10.5px] font-normal italic text-slate-600 mt-0.5">(Người lập báo giá)</div>
                  <div className="h-16"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
