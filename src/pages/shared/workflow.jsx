// Building blocks shared by the step 2–5 workflow modules
import React, { useState } from "react";
import { Button } from "primereact/button";
import { Card, Btn, FormBuilder, useForm, alertSuccess, Info } from "../../components/kit";
import { Modal } from "./index";
import db from "../../mock/db";
import { userName } from "../../mock/tracking";
import { thDateShort } from "../../utils/format";

export const name = (t, id) => db.getSync(t, id)?.name || "-";

// common project columns used by every workflow list
export const baseColumns = () => [
  { header: "ลำดับ", type: "index" },
  { header: "หน่วยงาน", body: (p) => name("bureau", p.bureau_id), style: { minWidth: "8rem" } },
  { header: "งาน", body: (p) => name("work_type", p.worktype_id), style: { minWidth: "7rem" } },
  { header: "หมวดรายจ่าย", body: (p) => name("expenses_group", p.expenses_group), style: { minWidth: "6rem" } },
  { header: "ประเภทรายจ่าย", body: (p) => name("expenses_type", p.expenses_type), style: { minWidth: "7rem" } },
  { field: "project_code", header: "รหัสโครงการ", body: (p) => <span className="whitespace-nowrap">{p.project_code}</span> },
  { field: "project_byear", header: "ปีงบ", body: (p) => p.project_byear + 543 },
  { field: "project_name", header: "ชื่อโครงการ", body: (p) => <span className="font-medium text-slate-800">{p.project_name}</span>, style: { minWidth: "18rem" } },
];

export const baseExcel = () => [
  { header: "ลำดับ", type: "index" },
  { header: "หน่วยงาน", value: (p) => name("bureau", p.bureau_id), width: 24 },
  { header: "งาน", value: (p) => name("work_type", p.worktype_id), width: 18 },
  { header: "หมวดรายจ่าย", value: (p) => name("expenses_group", p.expenses_group), width: 14 },
  { header: "ประเภทรายจ่าย", value: (p) => name("expenses_type", p.expenses_type), width: 18 },
  { header: "รหัสโครงการ", field: "project_code", width: 16 },
  { header: "ปีงบ", value: (p) => p.project_byear + 543 },
  { header: "ชื่อโครงการ", field: "project_name", width: 60 },
];

export const FILTERS_STD = ["bureau", "worktype", "expenses_group", "expenses_type", "budget_type"];
export const FILTERS_TAIL = ["byear", "projectcode", "contractnumber", "search"];

export const IconAction = ({ icon, title, onClick, color = "text-blue-600" }) => (
  <button
    type="button"
    title={title}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`mx-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 ${color}`}
  >
    <i className={icon} />
  </button>
);

// approval card used by purchase/supplies/contract approve pages
// cfg: { title, field, dateField, userField, options:[{label,value}], successText, blockText, blocked, onSaved(values) }
export const ApprovalCard = ({ p, cfg, user, onChange }) => {
  const [open, setOpen] = useState(false);
  const schema = [
    { name: "date", label: cfg.dateLabel || "วันที่", type: "date", col: 6, required: true, msg: "กรุณาระบุวันที่" },
    { name: "status", label: cfg.statusLabel, type: "select", col: 6, required: true, options: cfg.options },
  ];
  const { values, setValues, errors, check } = useForm(schema);
  const openModal = () => {
    setValues({ date: p[cfg.dateField] || new Date().toISOString().slice(0, 10), status: p[cfg.field] || "0" });
    setOpen(true);
  };
  const save = async () => {
    if (!check()) return;
    await db.update("project", p.id, { [cfg.field]: values.status, [cfg.dateField]: values.date, [cfg.userField]: user.id, edit_users: user.id });
    await cfg.onSaved?.(values);
    setOpen(false);
    await alertSuccess("บันทึกสำเร็จ");
    onChange?.();
  };
  const cur = cfg.viewOptions?.find((o) => String(o.value) === String(p[cfg.field] || "0")) || cfg.options.find((o) => String(o.value) === String(p[cfg.field] || "0"));
  return (
    <Card
      title={cfg.title}
      icon="pi pi-verified"
      actions={
        <>
          {cfg.extraActions}
          {cfg.blocked ? (
            <Button size="small" icon="pi pi-plus" label={cfg.buttonLabel || cfg.title} disabled className="rounded-xl" />
          ) : (
            <Btn tone="info" icon="pi pi-plus" label={cfg.buttonLabel || cfg.title} onClick={openModal} />
          )}
        </>
      }
    >
      <div className="space-y-4">
        {cfg.blocked && cfg.blockText && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <i className="pi pi-exclamation-triangle" />
            {cfg.blockText}
          </div>
        )}
        {cfg.warnText && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <i className="pi pi-exclamation-triangle" />
            {cfg.warnText}
          </div>
        )}
        {String(p[cfg.field]) === "1" && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <i className="pi pi-check-circle" />
            {cfg.successText}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Info label="วันที่อนุมัติ" value={thDateShort(p[cfg.dateField])} />
          <Info label={cfg.statusLabel} value={cur?.label} />
          <Info label="ผู้อนุมัติ" value={p[cfg.userField] ? userName(p[cfg.userField]) : "-"} />
        </div>
        {cfg.children}
      </div>
      <Modal visible={open} onHide={() => setOpen(false)} title={cfg.modalTitle || cfg.title} width="40rem" footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(false)} />}>
        <FormBuilder fields={schema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-4">
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={save} />
        </div>
      </Modal>
    </Card>
  );
};
