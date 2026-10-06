import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { certUrl, qrPrintUrl } from "../../mock/tracking";

export const ProjectQr = ({ id, size = 300 }) => <QRCodeCanvas value={certUrl(id)} size={size} includeMargin level="M" />;

export const QrBlock = ({ p }) =>
  String(p.qrcode_gen) === "1" ? (
    <div className="space-y-2 rounded-2xl border border-slate-200 p-4 text-sm">
      <div>
        <div className="font-semibold text-slate-700">QRCODE</div>
        URL :{" "}
        <a href={certUrl(p.id)} target="_blank" className="break-all text-blue-600 hover:underline">
          {certUrl(p.id)}
        </a>
      </div>
      <div>
        <div className="font-semibold text-slate-700">พิมพ์ QRCODE</div>
        URL :{" "}
        <a href={qrPrintUrl(p.id)} target="_blank" className="break-all text-blue-600 hover:underline">
          {qrPrintUrl(p.id)}
        </a>
      </div>
      <ProjectQr id={p.id} />
    </div>
  ) : (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-400">ยังไม่ได้สร้าง qrcode</div>
  );
