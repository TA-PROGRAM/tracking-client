import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const dateFormatLong = (date, export_type) => {
  if (export_type == "รายวัน") {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
    });
  }
};

const dateFormatShort = (date) => {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = (date.getFullYear() + 543).toString();

  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day}/${month}/${year} ${time}`;
};

export const ExportExcel = async (data, date, export_type) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  //row1
  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value =
    export_type === "รายวัน"
      ? `รายงานกล้อง CCTV วันที่ ${dateFormatLong(date, export_type)}`
      : `รายงานกล้อง CCTV เดือน ${dateFormatLong(date, export_type)}`;

  worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell("A1").font = { bold: true };
  worksheet.getRow(1).height = 30;
  //row2
  worksheet.mergeCells("A2:E2");
  //row3 header
  const headerRow = worksheet.addRow(["ลำดับ", "ไซต์", "กล้อง", "เวลาออฟไลน์", "เวลากลับมาออนไลน์"]);
  worksheet.getRow(headerRow.number).height = 30;

  const sortedData = [...(data ?? [])].sort((a, b) => {
    const dateA = new Date(a.offline_date).getTime();
    const dateB = new Date(b.offline_date).getTime();
    return dateA - dateB;
  });

  //table
  sortedData?.forEach((item, index) => {
    worksheet.addRow([
      index + 1,
      item.site_name ?? "-",
      item.device_name ?? "-",
      formatDateTime(item.offline_date) ?? "-",
      formatDateTime(item.online_date) ?? "-",
    ]);
  });

  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (rowNumber > 2) {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
      if (rowNumber === 3) {
        cell.font = { bold: true };
      }
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
  });

  worksheet.columns = [
    { width: 15 }, // A
    { width: 40 }, // B
    { width: 40 }, // C
    { width: 25 }, // D
    { width: 25 }, // E
  ];
  const fileName =
    export_type === "รายวัน"
      ? `รายงานกล้อง CCTV วันที่ ${dateFormatShort(date)}.xlsx`
      : `รายงานกล้อง CCTV เดือน ${dateFormatLong(date, export_type)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, fileName);
};

export default ExportExcel;
