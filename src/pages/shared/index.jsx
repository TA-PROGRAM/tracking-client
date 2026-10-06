// Components shared by the workflow modules (project, purchase, supplies, contract, finance, qrcode)
import React, { useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import db from "../../mock/db";
import { Badge, Card, FieldInput, FieldLabel, FileLinks, Info, confirmDelete, alertSuccess, Btn } from "../../components/kit";
import { thDate, thDateShort, money, beYear } from "../../utils/format";
import { STEPS, stepOf, userName, projectFiles, byearOptions, bureauOptions, lookupOptions, ampurNames } from "../../mock/tracking";
import { useAuth } from "../../role-access/authContext";

export const Modal = ({ visible, onHide, title, children, footer, width = "56rem" }) => (
  <Dialog header={title} visible={visible} onHide={onHide} style={{ width, maxWidth: "95vw" }} footer={footer} modal dismissableMask draggable={false}>
    {children}
  </Dialog>
);

// step ribbon shown on edit cards
export const StepRibbon = ({ n, tone = "red" }) => (
  <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white ${tone === "red" ? "bg-rose-600" : "bg-blue-600"}`}>{n}</span>
);

export const StepBadge = ({ p }) => {
  const history = useHistory();
  const n = stepOf(p);
  return (
    <button type="button" title={STEPS[n - 1].label} onClick={(e) => { e.stopPropagation(); history.push(STEPS[n - 1].to(p.id)); }} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200">
      {n}
    </button>
  );
};

// W/A/C letter badges
const LETTER = {
  W: { icon: "pi pi-hourglass", color: "yellow" },
  A: { icon: "pi pi-check-square", color: "green" },
  C: { icon: "pi pi-hourglass", color: "cyan" },
  P: { icon: "pi pi-money-bill", color: "cyan" },
  N: { icon: "pi pi-times-circle", color: "red" },
};
export const Letter = ({ v }) => {
  const s = LETTER[v] || LETTER.W;
  return (
    <Badge color={s.color}>
      <i className={`${s.icon} mr-1 text-[10px]`} />
      {v}
    </Badge>
  );
};
export const approveLetter = (v) => (String(v) === "1" ? "A" : "W");
export const suppliesLetter = (v) => (String(v) === "1" ? "A" : String(v) === "2" ? "C" : "W");

export const PurchaseApproveBadge = ({ value }) => {
  const r = db.getSync("purchase_approve", value ?? "") || db.getSync("purchase_approve", "");
  return (
    <Badge color={r.color}>
      <i className={`${r.icon.split(" ").slice(0, 2).join(" ")} mr-1 text-[10px]`} />
      {r.sign}
    </Badge>
  );
};

// read-only panel on the left of every workflow edit page
export const ProjectInfoPanel = ({ p, extra }) => {
  if (!p) return null;
  return (
    <Card title="ข้อมูลโครงการ" icon="pi pi-list">
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-800">{p.project_name}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Info label="งาน" value={db.getSync("work_type", p.worktype_id)?.name} />
          <Info label="หมวดค่าใช้จ่าย" value={db.getSync("expenses_group", p.expenses_group)?.name} />
          <Info label="ประเภทค่าใช้จ่าย" value={db.getSync("expenses_type", p.expenses_type)?.name} />
          <Info label="รหัสโครงการ" value={p.project_code} />
          <Info label="วันที่โครงการ" value={thDateShort(p.project_date)} />
          <Info label="งบประมาณอนุมัติ" value={`${money(p.budget_approve)} บาท`} />
          <Info label="หน่วยงาน" value={db.getSync("bureau", p.bureau_id)?.name} />
          <Info label="ปีงบ" value={beYear(p.project_byear)} />
          <Info label="อำเภอ" value={ampurNames(p.id) || "-"} />
          <Info label="ถนน" value={p.road || "-"} className="sm:col-span-3" />
          <Info label="สถานที่" value={p.project_place || "-"} className="sm:col-span-3" />
        </div>
        {extra}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <i className="pi pi-list text-pink-600" />
            สถานะโครงการ
          </div>
          <StatusTimeline projectId={p.id} />
        </div>
      </div>
    </Card>
  );
};

export const SimpleTable = ({ head, rows, empty = "ไม่มีข้อมูล" }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200">
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          {head.map((h, i) => (
            <th key={i} className={`whitespace-nowrap px-3 py-2 text-left font-semibold ${h.className || ""}`}>
              {h.label ?? h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 align-top ${head[j]?.className || ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={head.length} className="py-6 text-center text-slate-400">
              {empty}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const StatusTimeline = ({ projectId }) => {
  const rows = db.findSync("project_status", { project_id: projectId, flag: 1 }).sort((a, b) => a.status_numb - b.status_numb);
  return <SimpleTable head={["ลำดับ", "วันที่", "ดำเนินการ", "เพิ่มเติม"]} rows={rows.map((r) => [r.status_numb, thDateShort(r.status_date), db.getSync("project_status_type", r.status_id)?.name, r.status_remark || "-"])} />;
};

// attached files table (project_files) with soft-delete
export const FilesTable = ({ projectId, types, showUser = true, onChange, readOnly }) => {
  const [, force] = useState(0);
  const rows = projectFiles(projectId, types);
  const del = async (f) => {
    if (!(await confirmDelete("ต้องการยกเลิกรายการ"))) return;
    await db.update("project_files", f.id, { flag: 0 });
    force((x) => x + 1);
    onChange?.();
  };
  return (
    <SimpleTable
      head={["ลำดับ", "วันที่อัพโหลด", "ประเภทไฟล์", "ชื่อไฟล์", { label: "ดาวน์โหลด", className: "text-center" }, ...(readOnly ? [] : [{ label: "จัดการ", className: "text-center" }])]}
      rows={rows.map((f, i) => [
        i + 1,
        <div key="d">
          {thDateShort(f.add_date)}
          {showUser && <div className="text-xs text-slate-400">{userName(f.add_users)}</div>}
        </div>,
        db.getSync("files_type", f.file_type)?.name,
        f.name,
        f.url ? (
          <a key="a" href={f.url} download={f.name} target="_blank" className="text-emerald-600">
            <i className="pi pi-download" />
          </a>
        ) : (
          <i key="a" className="pi pi-download text-slate-300" title="ไฟล์ตัวอย่าง (mock)" />
        ),
        ...(readOnly
          ? []
          : [
              <button key="x" type="button" title="ลบข้อมูล" className="text-rose-600" onClick={() => del(f)}>
                <i className="pi pi-trash" />
              </button>,
            ]),
      ])}
    />
  );
};

// board members (project_board) table + add modal
export const BoardSection = ({ projectId, user, readOnly, onLog }) => {
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const blank = () => ({ name: "", cid: "", type: null });
  const [rows, setRows] = useState([blank(), blank(), blank(), blank()]);
  const list = db.findSync("project_board", { project_id: projectId, flag: 1 }).sort((a, b) => a.type - b.type);
  const typeOpts = db.findSync("board_type").map((t) => ({ label: t.name, value: t.id }));

  const save = async () => {
    for (const r of rows.filter((x) => x.name.trim())) await db.insert("project_board", { project_id: projectId, ...r, flag: 1, add_users: user?.id });
    await onLog?.("บันทึกกรรมการ");
    setOpen(false);
    setRows([blank(), blank(), blank(), blank()]);
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };
  const del = async (r) => {
    if (!(await confirmDelete("ต้องการยกเลิกรายการ"))) return;
    await db.update("project_board", r.id, { flag: 0 });
    force((x) => x + 1);
  };

  return (
    <Card
      title="รายชื่อกรรมการ"
      icon="pi pi-users"
      actions={!readOnly && <Btn tone="info" icon="pi pi-plus" label="เพิ่มกรรมการ" onClick={() => setOpen(true)} />}
    >
      <SimpleTable
        head={["ลำดับ", "ประเภท", "ชื่อ", { label: "เลขบัตร", className: "text-center" }, ...(readOnly ? [] : [{ label: "จัดการ", className: "text-center" }])]}
        rows={list.map((r, i) => [
          i + 1,
          db.getSync("board_type", r.type)?.name,
          r.name,
          r.cid,
          ...(readOnly
            ? []
            : [
                <button key="d" type="button" className="text-rose-600" onClick={() => del(r)}>
                  <i className="pi pi-trash" />
                </button>,
              ]),
        ])}
      />
      <Modal
        visible={open}
        onHide={() => setOpen(false)}
        title="บันทึกกรรมการ"
        footer={
          <div className="flex justify-end gap-2">
            <Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(false)} />
          </div>
        }
      >
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-12">
              <div className="md:col-span-6">
                {i === 0 && <FieldLabel label="ชื่อ-สกุล" />}
                <FieldInput field={{ type: "text", placeholder: "ชื่อ-สกุล" }} value={r.name} onChange={(v) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
              </div>
              <div className="md:col-span-3">
                {i === 0 && <FieldLabel label="เลขบัตร" />}
                <FieldInput field={{ type: "text", placeholder: "เลขบัตร", maxLength: 13 }} value={r.cid} onChange={(v) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, cid: v } : x)))} />
              </div>
              <div className="md:col-span-3">
                {i === 0 && <FieldLabel label="ประเภท" />}
                <FieldInput field={{ type: "select", options: typeOpts, placeholder: "ระบุ" }} value={r.type} onChange={(v) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, type: v } : x)))} />
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={save} />
            <Btn tone="info" icon="pi pi-plus" label="เพิ่มแถว" onClick={() => setRows((rs) => [...rs, blank()])} />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

// generic filter bar for the workflow lists
// fields: array of keys from FILTER_DEFS or custom {name,label,type,options}
export const FilterBar = ({ fields, value, onChange, onSearch, roles }) => {
  const { user, byear } = useAuth();
  const defs = useMemo(
    () => ({
      bureau: { name: "bureau", label: "หน่วยงาน", type: "select", options: bureauOptions(user, { roles }) },
      bureau99: { name: "bureau", label: "หน่วยงาน", type: "select", options: bureauOptions(user, { unknown: true, roles }) },
      worktype: { name: "worktype", label: "งาน", type: "select", options: lookupOptions("work_type") },
      expenses_group: { name: "expenses_group", label: "หมวดรายจ่าย", type: "select", options: lookupOptions("expenses_group") },
      expenses_type: { name: "expenses_type", label: "ประเภทรายจ่าย", type: "select", options: lookupOptions("expenses_type") },
      budget_type: { name: "budget_type", label: "งบประมาณ", type: "select", options: lookupOptions("budget_type", "ระบุ") },
      byear: { name: "byear", label: "ปีงบ", type: "select", options: byearOptions(byear) },
      byear5: { name: "byear", label: "ปีงบ", type: "select", options: byearOptions(byear, 2, 2) },
      projectcode: { name: "projectcode", label: "รหัสโครงการ", type: "text", placeholder: "รหัสโครงการ" },
      contractnumber: { name: "contractnumber", label: "เลขที่สัญญา", type: "text", placeholder: "เลขที่สัญญา" },
      search: { name: "search", label: "ชื่อโครงการ", type: "text", placeholder: "ชื่อโครงการ" },
      road: { name: "road", label: "ถนน", type: "text", placeholder: "ถนน" },
      place: { name: "place", label: "สถานที่", type: "text", placeholder: "สถานที่" },
      projectdate: { name: "projectdate", label: "วันที่รับโครงการ", type: "date" },
    }),
    [user, byear, roles],
  );
  const list = fields.map((f) => (typeof f === "string" ? defs[f] : f));
  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.();
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {list.map((f) => (
          <div key={f.name}>
            <FieldLabel label={f.label} />
            <FieldInput field={{ ...f, required: true }} value={value[f.name] ?? (f.type === "select" ? "" : "")} onChange={(v) => onChange({ ...value, [f.name]: v ?? "" })} />
          </div>
        ))}
        <div className="flex items-end gap-2">
          <Button type="submit" size="small" icon="pi pi-search" label="ค้นหา" className="rounded-xl" />
          <Button type="button" size="small" outlined severity="secondary" icon="pi pi-refresh" className="rounded-xl" title="ล้างค่า" onClick={() => onChange({})} />
        </div>
      </div>
    </form>
  );
};

export const BackButton = ({ to, label = "ย้อนกลับ" }) => {
  const history = useHistory();
  return <Button size="small" outlined severity="secondary" icon="pi pi-chevron-left" label={label} className="rounded-xl" onClick={() => (to ? history.push(to) : history.goBack())} />;
};

export const fmtDate = thDate;
export { FileLinks };
