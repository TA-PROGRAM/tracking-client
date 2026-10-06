// Printable "รายงานจำนวนโครงการที่ครบกำหนดส่งมอบงาน" (replaces mPDF deliver-pdf.php)
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import db from "../../mock/db";
import { thDate, thDateShort } from "../../utils/format";
import { deliverInfo } from "../../mock/tracking";

export const DeliverPrint = ({ visible, onHide, rows, start, end }) => {
  const print = () => {
    const html = document.getElementById("deliver-print-area")?.innerHTML || "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Project Tracking</title><style>body{font-family:Sarabun,Tahoma,sans-serif;font-size:13px;padding:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:4px 6px;vertical-align:top}th{background:#f1f5f9}h3,p{text-align:center;margin:4px 0}.sig{margin-top:40px;text-align:right}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };
  return (
    <Dialog header="ปริ้น PDF" visible={visible} onHide={onHide} style={{ width: "70rem", maxWidth: "95vw" }} footer={<Button icon="pi pi-print" label="พิมพ์" onClick={print} />}>
      <div id="deliver-print-area" className="text-sm">
        <h3 className="text-center text-lg font-bold">รายงานจำนวนโครงการที่ครบกำหนดส่งมอบงาน</h3>
        <p className="text-center">
          ตั้งแต่วันที่ {thDate(start)} ถึงวันที่ {thDate(end)} จำนวน {rows.length} โครงการ
        </p>
        <p className="mb-3 text-center">ข้อมูล ณ วันที่ {thDate(new Date())}</p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th colSpan={8} className="border p-1">ข้อมูลโครงการทั้งหมด อบจ.นครราชสีมา</th>
            </tr>
            <tr>
              {["ลำดับ", "หน่วยงาน", "ปีงบ", "ชื่อโครงการ", "เลขที่สัญญา", "ก่อนวันครบกำหนด 3 วัน", "กำหนดส่งมอบงาน", "เกินกำหนดส่งมอบงาน (วัน)"].map((h) => (
                <th key={h} className="border bg-slate-50 p-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const d = deliverInfo(p);
              return (
                <tr key={p.id}>
                  <td className="border p-1 text-center">{i + 1}</td>
                  <td className="border p-1">{db.getSync("bureau", p.bureau_id)?.name}</td>
                  <td className="border p-1 text-center">{p.project_byear + 543}</td>
                  <td className="border p-1">{p.project_name}</td>
                  <td className="border p-1">{p.contract_number}</td>
                  <td className="border p-1 text-center">{thDateShort(d.deliver)}</td>
                  <td className="border p-1 text-center">{thDateShort(p.contract_enddate)}</td>
                  <td className="border p-1 text-center">{d.overdue ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="sig mt-10 text-right leading-8">
          ลงชื่อ : ..................................................
          <br />( .................................................. )
          <br />
          วัน/เดือน/ปี : ..........................
        </div>
      </div>
    </Dialog>
  );
};
