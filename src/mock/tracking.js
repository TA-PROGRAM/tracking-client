// Domain rules of the legacy tracking system, shared by every module
import db from "./db";
import { ADMIN_ROLES, QR_ADMIN_ROLES } from "./seed/system";
import { beYear, money, thDateShort, num, isoDate, toDate, daysBetween } from "../utils/format";

export { ADMIN_ROLES, QR_ADMIN_ROLES };
export const isAdminRole = (user, roles = ADMIN_ROLES) => roles.includes(Number(user?.role_id));

export const PUBLIC_URL = `${window.location.origin}${window.location.pathname}#/public`;
export const certUrl = (id) => `${PUBLIC_URL}/project-cer/${id}`;
export const qrPrintUrl = (id) => `${PUBLIC_URL}/project-qrcode/${id}`;

// ---------------------------------------------------------------- workflow
export const STEPS = [
  { n: 1, label: "1-โครงการอนุมัติ", short: "อนุมัติโครงการ", to: (id) => `/project/edit/${id}` },
  { n: 2, label: "2-อนุมัติจัดซื้อจัดจ้าง", short: "อนุมัติจัดซื้อ", to: (id) => `/purchase/edit/${id}` },
  { n: 3, label: "3-จัดซื้อจัดจ้าง", short: "จัดซื้อจัดจ้าง", to: (id) => `/supplies/edit/${id}` },
  { n: 4, label: "4-ตรวจรับ", short: "ดำเนินการตรวจรับ", to: (id) => `/contract/edit/${id}` },
  { n: 5, label: "5-การเงิน", short: "การเงิน", to: (id) => `/finance/edit/${id}` },
];

export const stepOf = (p) => {
  if (String(p.contract_approve) === "1") return 5;
  if (String(p.supplies_approve) === "1") return 4;
  if (String(p.purchase_approve) === "1") return 3;
  if (String(p.project_purchase) === "1") return 2;
  return 1;
};

export const APPROVE_W_A = {
  0: { label: "W", color: "yellow" },
  1: { label: "A", color: "green" },
};
export const SUPPLIES_WAC = {
  0: { label: "W", color: "yellow" },
  1: { label: "A", color: "green" },
  2: { label: "C", color: "cyan" },
};

// ---------------------------------------------------------------- finance
export const paidOf = (pid) => db.findSync("project_payment", { project_id: pid, flag: 1 }).reduce((s, r) => s + num(r.payment_amount), 0);
export const hasPayment = (pid) => db.findSync("project_payment", { project_id: pid, flag: 1 }).length > 0;
export const payTotalOf = (p) => (String(p.fine_status) === "1" ? num(p.purchase_winprice) - num(p.fine_pay) : num(p.purchase_winprice));
export const payStatusOf = (p) => {
  const paid = paidOf(p.id);
  if (!paid) return "W";
  return paid >= payTotalOf(p) - 0.005 ? "A" : "P";
};
export const PAY_STATUS = {
  W: { label: "W-รอดำเนินการ", color: "yellow" },
  A: { label: "A-จ่ายเงินเรียบร้อย", color: "green" },
  P: { label: "P-กำลังจ่ายเงิน", color: "cyan" },
};

// ---------------------------------------------------------------- fine
export const fineCalc = (winprice, rate, days) => {
  let perDay = +((num(winprice) * num(rate)) / 100).toFixed(2);
  if (!(perDay > 0)) perDay = 0;
  else if (perDay < 100) perDay = 100;
  return +(perDay * num(days)).toFixed(2);
};

// ---------------------------------------------------------------- budget-year
export const activeByear = () => db.findSync("project_byear", { byear_active: 1 })[0]?.byear || new Date().getFullYear();

// options for the ปีงบ filter: from +up to -down around the session year
export const byearOptions = (byear, up = 3, down = 2, all = true) => {
  const out = all ? [{ label: "ทั้งหมด", value: "" }] : [];
  for (let y = byear + up; y >= byear - down; y--) out.push({ label: String(y + 543), value: y });
  return out;
};

// ---------------------------------------------------------------- generic project filter
// f: { bureau, worktype, expenses_group, expenses_type, budget_type, byear, projectcode, contractnumber, search, road, place }
export const filterProjects = (rows, f, { user, byear, roles = ADMIN_ROLES, yearsWhenAll = 3 } = {}) => {
  const admin = isAdminRole(user, roles);
  return rows.filter((p) => {
    if (String(p.flag) !== "1") return false;
    if (!admin && String(p.bureau_id) !== String(user?.bureau_id)) return false;
    if (f.bureau && String(p.bureau_id) !== String(f.bureau)) return false;
    if (f.worktype && String(p.worktype_id) !== String(f.worktype)) return false;
    if (f.expenses_group && String(p.expenses_group) !== String(f.expenses_group)) return false;
    if (f.expenses_type && String(p.expenses_type) !== String(f.expenses_type)) return false;
    if (f.budget_type && String(p.budget_type) !== String(f.budget_type)) return false;
    if (f.byear) {
      if (String(p.project_byear) !== String(f.byear)) return false;
    } else if (yearsWhenAll) {
      const ys = Array.from({ length: yearsWhenAll }, (_, i) => byear - i);
      if (!ys.includes(Number(p.project_byear))) return false;
    }
    const like = (v, q) => !q || String(v || "").toLowerCase().includes(String(q).toLowerCase());
    if (!like(p.project_code, f.projectcode)) return false;
    if (!like(p.contract_number, f.contractnumber)) return false;
    if (!like(p.project_name, f.search)) return false;
    if (!like(p.road, f.road)) return false;
    if (!like(p.project_place, f.place)) return false;
    if (f.projectdate && p.project_date !== f.projectdate) return false;
    return true;
  });
};

// bureau dropdown limited by role
export const bureauOptions = (user, { all = true, unknown = false, roles = ADMIN_ROLES } = {}) => {
  const admin = isAdminRole(user, roles);
  const rows = db.findSync("bureau", { flag: 1 }).filter((b) => admin || String(b.id) === String(user?.bureau_id));
  const out = rows.map((b) => ({ label: b.name, value: b.id }));
  if (unknown) out.push({ label: "ไม่ระบุหน่วยงาน", value: 99 });
  return all ? [{ label: "ทั้งหมด", value: "" }, ...out] : out;
};

export const lookupOptions = (table, all = "ทั้งหมด") => [
  ...(all ? [{ label: all, value: "" }] : []),
  ...db.findSync(table).filter((r) => r.flag === undefined || String(r.flag) === "1").map((r) => ({ label: r.name, value: r.id })),
];

export const ampurNames = (pid) =>
  db
    .findSync("project_ampur", { project_id: pid, flag: 1 })
    .map((a) => db.getSync("ampur", a.ampur)?.name)
    .filter(Boolean)
    .join(",");

// ---------------------------------------------------------------- audit trail / notify
export const addLog = (project_id, act, user) => db.insert("project_log", { project_id, act, add_date: new Date().toISOString(), add_users: user?.id });

export const notifyLine = (step, p, lines) => {
  const bureau = db.getSync("bureau", p.bureau_id);
  const key = bureau?.[`line_key${step}`];
  const message = lines.join("\n ");
  db.insert("notify_log", { step, project_id: p.id, token: key || "", sent: !!key, message });
  console.info(`[mock LINE notify step ${step}]${key ? "" : " (no token)"}\n${message}`);
};

export const lineHeader = (p) => {
  const bg = db.getSync("budget_type", p.budget_type)?.name || "";
  return { bg, budget: money(p.budget_approve), year: beYear(p.project_byear), start: thDateShort(p.contract_startdate), end: thDateShort(p.contract_enddate), win: db.getSync("company", p.purchase_winname)?.name || "" };
};

// next running project code: {BE year}-{exp group 2d}-{5d}
export const nextProjectCode = (byear, expGroup) => {
  const prefix = `${Number(byear) + 543}-${String(expGroup).padStart(2, "0")}-`;
  const max = db
    .findSync("project")
    .filter((p) => String(p.project_code || "").startsWith(prefix))
    .reduce((m, p) => Math.max(m, Number(p.project_code.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(5, "0")}`;
};

export const userName = (id) => db.getSync("users", id)?.name || "-";

export const projectFiles = (pid, types) => db.findSync("project_files", { project_id: pid, flag: 1 }).filter((f) => !types || types.includes(f.file_type));

// store picked files (from FileInput) as project_files rows
export const saveProjectFiles = async (pid, type, files, user) => {
  for (const f of files || []) {
    await db.insert("project_files", { project_id: pid, file_type: type, name: f.name, size: f.size, url: f.url, add_date: new Date().toISOString(), add_users: user?.id, flag: 1 });
  }
};

// ---------------------------------------------------------------- deliver monitor (contract/deliver)
const todayIso = () => isoDate(new Date());
export const deliverInfo = (p) => {
  const deliver = p.contract_enddate ? isoDate(new Date(toDate(p.contract_enddate).getTime() - 3 * 86400000)) : null;
  const countdate = p.contract_enddate ? daysBetween(p.contract_enddate, todayIso()) : null;
  const overdue = countdate > 0 && !p.contract_realdate && String(p.contract_approve) !== "1" ? countdate : null;
  return { deliver, countdate, overdue, warn: deliver === todayIso() };
};

