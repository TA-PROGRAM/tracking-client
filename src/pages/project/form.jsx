import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Checkbox } from "primereact/checkbox";
import { Page, Card, FormBuilder, Btn, alertSuccess, alertError, useForm } from "../../components/kit";
import { BackButton, StepRibbon } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { addLog, nextProjectCode, lookupOptions } from "../../mock/tracking";

const sections = (isEdit) => [
  {
    title: "ข้อมูลโครงการ",
    icon: "pi pi-list",
    fields: [
      { name: "project_code", label: "รหัสโครงการ", type: "text", disabled: true, col: 4, placeholder: "สร้างอัตโนมัติเมื่อบันทึก" },
      { name: "project_date", label: "วันที่โครงการ", type: "date", col: 4 },
      { name: "project_byear", label: "ปีงบ", type: "select", col: 4, required: true, options: () => db.findSync("project_byear").slice().sort((a, b) => b.byear - a.byear).map((y) => ({ label: String(y.byear + 543), value: y.byear })) },
      { name: "project_startdate", label: "วันที่เริ่ม", type: "date", col: 4 },
      { name: "project_enddate", label: "วันที่สิ้นสุด", type: "date", col: 4 },
      { name: "project_refid", label: "โครงการในแผน", type: "select", col: 4, options: () => [{ label: "ไม่มีโครงการในแผน", value: 0 }, ...db.findSync("project_plan_main", { flag: 1 }).map((p) => ({ label: `[${p.project_byear + 543}] ${p.project_name}`, value: p.id }))] },
      { name: "project_name", label: "ชื่อโครงการ", type: "textarea", rows: 4, col: 12, required: true },
      { name: "bureau_id", label: "หน่วยงานรับผิดชอบ", type: "select", col: 4, options: lookupOptions("bureau", false) },
      { name: "worktype_id", label: "งาน", type: "select", col: 4, required: true, options: lookupOptions("work_type", false) },
      { name: "expenses_group", label: "หมวดค่าใช้จ่าย", type: "select", col: 4, required: true, options: lookupOptions("expenses_group", false), disabled: isEdit, help: isEdit ? "ใช้สร้างรหัสโครงการ (แก้ไขไม่ได้)" : "ใช้สร้างรหัสโครงการ" },
      { name: "expenses_type", label: "ประเภทค่าใช้จ่าย", type: "select", col: 4, required: true, options: lookupOptions("expenses_type", false) },
      { name: "budget_type", label: "งบประมาณ", type: "select", col: 4, options: lookupOptions("budget_type", false) },
      { name: "budget_approve", label: "งบประมาณอนุมัติ", type: "money", col: 4 },
      { name: "road", label: "ถนน", type: "text", col: 12 },
      { name: "project_place", label: "สถานที่", type: "textarea", rows: 2, col: 12 },
    ],
  },
  {
    title: "ข้อมูลจัดซื้อจัดจ้าง",
    icon: "pi pi-shopping-cart",
    fields: [
      { name: "project_purchase", label: "อนุมัติจัดซื้อจัดจ้าง", type: "select", col: 6, options: db.findSync("purchase_approve").map((r) => ({ label: r.name, value: r.id })) },
      { name: "project_purchase_unapprove", label: "เหตุผลไม่อนุมัติ", type: "textarea", rows: 2, col: 12, hidden: (v) => v.project_purchase !== "0" },
    ],
  },
];

const Form = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const history = useHistory();
  const { user, byear } = useAuth();
  const schema = sections(isEdit);
  const { values, setValues, errors, check } = useForm(schema, { project_byear: byear, project_purchase: "", project_refid: 0, budget_approve: 0 });
  const [ampurs, setAmpurs] = useState([]);
  const allAmpur = db.findSync("ampur", { changwat: "30" });

  useEffect(() => {
    if (!isEdit) return;
    const p = db.getSync("project", id);
    if (!p) return;
    setValues(p);
    setAmpurs(db.findSync("project_ampur", { project_id: p.id, flag: 1 }).map((a) => a.ampur));
  }, [id, isEdit, setValues]);

  const save = async () => {
    if (!check()) return;
    if (!ampurs.length) return alertError("กรุณาเลือกอำเภอ", "เลือกอย่างน้อย 1 อำเภอ");
    const data = { ...values, budget_approve: values.budget_approve || 0, project_refid: values.project_refid || 0 };
    let pid = id;
    if (isEdit) {
      await db.update("project", id, { ...data, edit_users: user.id });
      await addLog(id, "แก้ไขโครงการ", user);
    } else {
      const code = nextProjectCode(data.project_byear, data.expenses_group);
      const res = await db.insert("project", {
        ...data,
        project_code: code,
        changwat: "30",
        org_id: user.org_id,
        flag: 1,
        add_users: user.id,
        project_status: 3,
        project_approve: 2,
        purchase_approve: "0",
        supplies_approve: "0",
        contract_approve: "0",
        purchase_pricecenter: data.project_purchase === "1" ? data.budget_approve : 0,
        purchase_winprice: 0,
        fine_status: "0",
        qrcode_gen: "1",
        qrcode_date: new Date().toISOString(),
        qrcode_users: user.id,
      });
      pid = res.data.id;
      await addLog(pid, "เพิ่มโครงการ", user);
      await db.insert("project_status", { project_id: pid, status_numb: 1, status_id: 3, status_date: data.project_date, status_remark: "", flag: 1, add_users: user.id });
      await db.insert("project_approve_hist", { project_id: pid, approve_numb: 1, approve_id: 2, approve_date: data.project_date, approve_remark: "", flag: 1, add_users: user.id });
    }
    await db.removeWhere("project_ampur", { project_id: Number(pid) });
    for (const a of ampurs) await db.insert("project_ampur", { project_id: Number(pid), ampur: a, changwat: "30", flag: 1, add_users: user.id });
    await alertSuccess("บันทึกสำเร็จ");
    history.push("/project");
  };

  const toggle = (code) => setAmpurs((a) => (a.includes(code) ? a.filter((x) => x !== code) : [...a, code]));

  return (
    <Page
      title={isEdit ? "แก้ไขโครงการ" : "เพิ่มโครงการ"}
      breadcrumb={["ข้อมูลโครงการ", isEdit ? "แก้ไขโครงการ" : "เพิ่มโครงการ"]}
      actions={
        <>
          <StepRibbon n={1} />
          <BackButton to="/project" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3">
          <FormBuilder sections={schema} values={values} setValues={setValues} errors={errors} />
          <div className="mt-5 flex gap-2">
            <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
            <BackButton />
          </div>
        </Card>
        <Card title="อำเภอ" icon="pi pi-map-marker" bodyClass="p-4">
          <label className="mb-2 flex cursor-pointer items-center gap-2 border-b pb-2 text-sm font-semibold">
            <Checkbox checked={ampurs.length === allAmpur.length} onChange={(e) => setAmpurs(e.checked ? allAmpur.map((a) => a.id) : [])} />
            เลือกทั้งหมด
          </label>
          <div className="max-h-[640px] space-y-1 overflow-y-auto pr-1">
            {allAmpur.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 text-sm hover:bg-slate-50">
                <Checkbox checked={ampurs.includes(a.id)} onChange={() => toggle(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
          <div className="mt-2 text-xs text-rose-500">* เลือกอย่างน้อย 1 อำเภอ</div>
        </Card>
      </div>
    </Page>
  );
};

export default Form;
