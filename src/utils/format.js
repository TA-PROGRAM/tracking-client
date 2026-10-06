// Thai formatting helpers (Buddhist year, money)
const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export const toDate = (v) => {
  if (!v || v === "0000-00-00") return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// 2026-10-06 -> 06 ต.ค. 2569
export const thDate = (v, { full = false, time = false } = {}) => {
  const d = toDate(v);
  if (!d) return "-";
  const m = full ? TH_MONTHS_FULL[d.getMonth()] : TH_MONTHS[d.getMonth()];
  let s = `${String(d.getDate()).padStart(2, "0")} ${m} ${d.getFullYear() + 543}`;
  if (time) s += ` ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} น.`;
  return s;
};

// 06/10/2569
export const thDateShort = (v) => {
  const d = toDate(v);
  if (!d) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
};

export const isoDate = (v) => {
  const d = toDate(v);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const money = (v, digits = 2) => {
  const n = Number(v);
  if (v === null || v === undefined || v === "" || Number.isNaN(n)) return "-";
  return n.toLocaleString("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const num = (v) => Number(String(v ?? 0).replace(/,/g, "")) || 0;

export const beYear = (y) => (y ? Number(y) + 543 : "-");

// Thai fiscal year: Oct–Sep. Returns Christian year of the fiscal year end.
export const fiscalYearOf = (v) => {
  const d = toDate(v) || new Date();
  return d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear();
};

export const daysBetween = (a, b) => {
  const d1 = toDate(a);
  const d2 = toDate(b);
  if (!d1 || !d2) return null;
  return Math.round((d2 - d1) / 86400000);
};

export const percent = (part, whole) => (num(whole) ? (num(part) / num(whole)) * 100 : 0);

// Thai baht text (บาทถ้วน) for printed documents
export const bahtText = (input) => {
  const n = Number(input);
  if (Number.isNaN(n)) return "";
  const digit = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const unit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  const read = (s) => {
    let out = "";
    const len = s.length;
    for (let i = 0; i < len; i++) {
      const d = Number(s[i]);
      const pos = len - i - 1;
      if (d === 0) continue;
      if (pos % 6 === 1 && d === 2) out += "ยี่";
      else if (pos % 6 === 1 && d === 1) out += "";
      else if (pos % 6 === 0 && d === 1 && len > 1 && i > 0) out += "เอ็ด";
      else out += digit[d];
      out += unit[pos % 6];
      if (pos > 0 && pos % 6 === 0) out += "ล้าน";
    }
    return out;
  };
  const [b, s = "00"] = Math.abs(n).toFixed(2).split(".");
  let text = (b === "0" ? "ศูนย์" : read(b)) + "บาท";
  text += s === "00" ? "ถ้วน" : read(s) + "สตางค์";
  return (n < 0 ? "ลบ" : "") + text;
};
